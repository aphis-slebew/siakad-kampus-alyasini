<?php

namespace App\Http\Controllers\Akademik;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\JurnalPerkuliahan;
use App\Models\KelasKuliah;
use App\Models\Mahasiswa;
use App\Models\TahunAjaran;
use App\Services\PresensiService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PresensiController extends Controller
{
    /**
     * Dosen Attendance & Journal Entry Portal.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $dosen = Dosen::where('user_id', $user->id)->first();
        $tahunAjaran = TahunAjaran::where('is_active', true)->first() ?? TahunAjaran::latest()->first();

        // Fetch classes taught by this lecturer (or all for admin)
        $kelases = KelasKuliah::with([
            'kurikulumMatakuliah.matakuliah',
            'jadwalPerkuliahans.ruangKuliah',
        ])
            ->where('tahun_ajaran_id', $tahunAjaran->id)
            ->when(! $user->hasRole('superadmin') && ! $user->hasRole('admin_akademik'), function ($q) use ($user, $dosen) {
                if ($user->hasRole('kaprodi') && $dosen?->program_studi_id) {
                    $q->whereHas('kurikulumMatakuliah.kurikulumProdi', function ($kq) use ($dosen) {
                        $kq->where('program_studi_id', $dosen->program_studi_id);
                    });
                } else {
                    $q->whereHas('dosenPengajars', function ($dq) use ($dosen) {
                        $dq->where('dosen_id', $dosen?->id);
                    });
                }
            })
            ->get()
            ->filter(fn ($k) => $k->isReadyForKrs())
            ->values();

        $selectedKelasId = $request->query('kelas_kuliah_id', $kelases->first()?->id);
        $selectedKelas = $kelases->firstWhere('id', (int) $selectedKelasId);

        $students = [];
        $jurnals = [];

        if ($selectedKelas) {
            // ONLY fetch students whose KRS for this class is approved by Dosen Wali
            $students = Mahasiswa::whereIn('id', function ($query) use ($selectedKelas) {
                $query->select('mahasiswa_id')
                    ->from('krs')
                    ->where('status', 'disetujui_wali')
                    ->whereIn('id', function ($subQuery) use ($selectedKelas) {
                        $subQuery->select('krs_id')
                            ->from('krs_details')
                            ->where('kelas_kuliah_id', $selectedKelas->id);
                    });
            })->get();

            $jurnals = JurnalPerkuliahan::with('presensis')
                ->where('kelas_kuliah_id', $selectedKelas->id)
                ->orderByDesc('tanggal')
                ->get();
        }

        return Inertia::render('akademik/presensi/index', [
            'kelases' => $kelases,
            'selectedKelas' => $selectedKelas,
            'students' => $students,
            'jurnals' => $jurnals,
            'tahunAjaran' => $tahunAjaran,
        ]);
    }

    /**
     * Store journal session and student attendance.
     */
    public function store(Request $request, PresensiService $presensiService): RedirectResponse
    {
        $validated = $request->validate([
            'kelas_kuliah_id' => ['required', 'exists:kelas_kuliahs,id'],
            'tanggal' => ['required', 'date'],
            'materi' => ['required', 'string', 'max:1000'],
            'presensis' => ['required', 'array', 'min:1'],
            'presensis.*.mahasiswa_id' => ['required', 'exists:mahasiswas,id'],
            'presensis.*.status' => ['required', 'in:hadir,izin,sakit,alpa'],
        ]);

        $kelas = KelasKuliah::findOrFail($validated['kelas_kuliah_id']);
        $isAdminOverride = auth()->user()->hasRole('superadmin') || auth()->user()->hasRole('admin_akademik');

        try {
            $presensiService->recordJurnalAndPresensi(
                $kelas,
                $validated['tanggal'],
                $validated['materi'],
                $validated['presensis'],
                auth()->id(),
                $isAdminOverride
            );

            return back()->with('success', 'Jurnal perkuliahan dan presensi mahasiswa berhasil disimpan.');
        } catch (Exception $e) {
            return back()->withErrors(['presensi' => $e->getMessage()]);
        }
    }
}
