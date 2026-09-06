<?php

namespace App\Http\Controllers\Yudisium;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\PeriodeWisuda;
use App\Models\Yudisium;
use App\Services\YudisiumService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class YudisiumController extends Controller
{
    /**
     * Display Yudisium dashboard & list.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        if ($user->hasRole('mahasiswa') || $user->user_type === 'mahasiswa') {
            $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();
            $yudisium = Yudisium::with(['periodeWisuda', 'mahasiswa.programStudi'])
                ->where('mahasiswa_id', $mahasiswa->id)
                ->first();

            return Inertia::render('yudisium/index', [
                'yudisium' => $yudisium,
                'role' => 'mahasiswa',
            ]);
        }

        if (! $user->hasAnyRole(['superadmin', 'admin_akademik', 'kaprodi', 'dosen', 'operator_kemahasiswaan'])
            && ! in_array($user->user_type, ['superadmin', 'admin_akademik', 'kaprodi', 'dosen', 'pegawai'])) {
            abort(403, 'Akses Ditolak: Anda tidak memiliki akses ke portal yudisium.');
        }

        $yudisiums = Yudisium::with(['mahasiswa.programStudi', 'periodeWisuda'])->latest()->get();
        $periodeWisudas = PeriodeWisuda::latest()->get();

        // Candidates for yudisium: students who passed skripsi exam
        $candidates = Mahasiswa::with('programStudi')
            ->whereHas('skripsis', function ($q) {
                $q->where('status', 'lulus_ujian');
            })
            ->whereDoesntHave('yudisiums')
            ->get();

        return Inertia::render('yudisium/index', [
            'yudisiums' => $yudisiums,
            'periodeWisudas' => $periodeWisudas,
            'candidates' => $candidates,
            'role' => 'admin',
        ]);
    }

    /**
     * Admin assigns Yudisium to student.
     */
    public function store(Request $request, YudisiumService $yudisiumService): RedirectResponse
    {
        $request->validate([
            'mahasiswa_id' => 'required|exists:mahasiswas,id',
            'periode_wisuda_id' => 'required|exists:periode_wisudas,id',
        ]);

        $mahasiswa = Mahasiswa::findOrFail($request->mahasiswa_id);

        try {
            $yudisiumService->assignYudisium($mahasiswa, (int) $request->periode_wisuda_id);

            return back()->with('success', 'Yudisium mahasiswa berhasil ditetapkan.');
        } catch (Exception $e) {
            return back()->withErrors(['yudisium' => $e->getMessage()]);
        }
    }

    /**
     * Admin creates a Periode Wisuda.
     */
    public function storePeriodeWisuda(Request $request): RedirectResponse
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'tanggal_wisuda' => 'required|date',
        ]);

        PeriodeWisuda::create([
            'nama' => $request->nama,
            'tanggal_wisuda' => $request->tanggal_wisuda,
        ]);

        return back()->with('success', 'Periode Wisuda berhasil ditambahkan.');
    }

    /**
     * Official Certificate / Keterangan Yudisium View (with strict IDOR protection).
     */
    public function sertifikat(Request $request, Yudisium $yudisium): Response
    {
        $user = auth()->user();

        // IDOR Check: Mahasiswa A cannot view Mahasiswa B certificate
        if ($user->hasRole('mahasiswa') || $user->user_type === 'mahasiswa') {
            $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();
            if ($yudisium->mahasiswa_id !== $mahasiswa->id) {
                abort(403, 'Akses Ditolak: Anda tidak memiliki akses ke Dokumen Yudisium ini.');
            }
        } elseif (! $user->hasAnyRole(['superadmin', 'admin_akademik', 'kaprodi', 'dosen'])
            && ! in_array($user->user_type, ['superadmin', 'admin_akademik', 'kaprodi', 'dosen', 'pegawai'])) {
            abort(403, 'Akses Ditolak: Anda tidak memiliki wewenang untuk mengakses Dokumen Yudisium.');
        }

        $yudisium->load(['mahasiswa.programStudi.fakultas', 'periodeWisuda']);

        return Inertia::render('yudisium/sertifikat', [
            'yudisium' => $yudisium,
        ]);
    }
}
