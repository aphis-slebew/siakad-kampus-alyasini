<?php

namespace App\Http\Controllers\Pddikti;

use App\Http\Controllers\Controller;
use App\Jobs\Pddikti\PullReferensiPddiktiJob;
use App\Jobs\Pddikti\SyncKelasKuliahToPddiktiJob;
use App\Jobs\Pddikti\SyncKrsDanNilaiToPddiktiJob;
use App\Jobs\Pddikti\SyncMahasiswaToPddiktiJob;
use App\Models\KelasKuliah;
use App\Models\Mahasiswa;
use App\Models\PddiktiSyncLog;
use App\Services\Pddikti\NeoFeederClient;
use App\Services\Pddikti\PddiktiReconciliationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PddiktiSyncController extends Controller
{
    public function __construct(
        protected NeoFeederClient $client,
        protected PddiktiReconciliationService $reconciliationService
    ) {}

    /**
     * Tampilkan halaman utama monitoring sinkronisasi PD-DIKTI Neo Feeder.
     */
    public function index(Request $request): Response
    {
        $query = PddiktiSyncLog::query()->latest('id');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('table_name')) {
            $query->where('table_name', $request->string('table_name'));
        }

        if ($request->filled('action')) {
            $query->where('action', $request->string('action'));
        }

        if ($request->filled('search')) {
            $search = '%'.strtolower(trim((string) $request->string('search'))).'%';
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(pddikti_id) LIKE ?', [$search])
                    ->orWhereRaw('LOWER(error_message) LIKE ?', [$search])
                    ->orWhereRaw('LOWER(table_name) LIKE ?', [$search]);
            });
        }

        $logs = $query->paginate(15)->withQueryString();

        $stats = [
            'total_success' => PddiktiSyncLog::where('status', 'success')->count(),
            'total_failed' => PddiktiSyncLog::where('status', 'failed')->count(),
            'total_pending' => PddiktiSyncLog::where('status', 'pending')->count(),
            'last_synced_at' => PddiktiSyncLog::whereNotNull('synced_at')->max('synced_at'),
            'total_mahasiswa_active' => Mahasiswa::where('status_mahasiswa', 'aktif')->count(),
            'total_kelas_kuliah' => KelasKuliah::count(),
        ];

        return Inertia::render('pddikti/index', [
            'logs' => $logs,
            'stats' => $stats,
            'filters' => $request->only(['status', 'table_name', 'action', 'search']),
            'feederConfig' => [
                'url' => config('pddikti.feeder_url'),
                'username' => config('pddikti.username'),
                'sandbox_mode' => config('pddikti.sandbox_mode'),
            ],
        ]);
    }

    /**
     * Endpoint API/Web untuk uji koneksi real-time ke Neo Feeder Web Service.
     */
    public function testConnection(): JsonResponse
    {
        $result = $this->client->testConnection();

        return response()->json($result);
    }

    /**
     * Kirim ulang (retry) queue job untuk log sinkronisasi yang gagal.
     */
    public function retry(PddiktiSyncLog $log): RedirectResponse
    {
        $log->update(['status' => 'pending', 'error_message' => null]);

        match ($log->table_name) {
            'mahasiswas' => SyncMahasiswaToPddiktiJob::dispatch($log->record_id),
            'kelas_kuliahs' => SyncKelasKuliahToPddiktiJob::dispatch($log->record_id),
            'nilais' => SyncKrsDanNilaiToPddiktiJob::dispatch($log->record_id),
            'referensi_biodatas' => PullReferensiPddiktiJob::dispatch(),
            default => null,
        };

        return back()->with('success', "Proses sinkronisasi ulang untuk entitas [{$log->table_name}] #{$log->record_id} telah dijadwalkan ke antrean.");
    }

    /**
     * Memicu batch sinkronisasi berdasarkan kategori entitas.
     */
    public function syncBatch(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'entity' => 'required|in:mahasiswa,kelas_kuliah,nilai,referensi',
        ]);

        $dispatchedCount = 0;

        switch ($validated['entity']) {
            case 'mahasiswa':
                $mahasiswas = Mahasiswa::select('id')->get();
                foreach ($mahasiswas as $mhs) {
                    SyncMahasiswaToPddiktiJob::dispatch($mhs->id);
                    $dispatchedCount++;
                }
                break;

            case 'kelas_kuliah':
                $kelasList = KelasKuliah::select('id')->get();
                foreach ($kelasList as $kls) {
                    SyncKelasKuliahToPddiktiJob::dispatch($kls->id);
                    $dispatchedCount++;
                }
                break;

            case 'nilai':
                $kelasList = KelasKuliah::select('id')->get();
                foreach ($kelasList as $kls) {
                    SyncKrsDanNilaiToPddiktiJob::dispatch($kls->id);
                    $dispatchedCount++;
                }
                break;

            case 'referensi':
                PullReferensiPddiktiJob::dispatch();
                $dispatchedCount = 1;
                break;
        }

        return back()->with('success', "Berhasil menjadwalkan {$dispatchedCount} tugas sinkronisasi antrean untuk kategori [{$validated['entity']}].");
    }

    /**
     * Endpoint untuk menjalankan audit rekonsiliasi data.
     */
    public function reconcile(Request $request): JsonResponse
    {
        $type = $request->input('type', 'mahasiswa');

        try {
            $report = match ($type) {
                'dosen' => $this->reconciliationService->reconcileDosen(),
                default => $this->reconciliationService->reconcileMahasiswa($request->input('filter')),
            };

            return response()->json([
                'status' => 'success',
                'type' => $type,
                'data' => $report,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
