<?php

namespace App\Http\Controllers\Akademik;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\KelasKuliah;
use App\Models\Krs;
use App\Models\Mahasiswa;
use App\Models\TahunAjaran;
use App\Services\KrsEligibilityService;
use App\Services\KrsService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KrsController extends Controller
{
    /**
     * Student KRS Selection Portal.
     */
    public function studentIndex(Request $request): Response
    {
        $user = auth()->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();
        $tahunAjaran = TahunAjaran::where('is_active', true)->first() ?? TahunAjaran::latest()->first();

        $eligibility = KrsEligibilityService::evaluate($mahasiswa, $tahunAjaran->id);

        $krs = Krs::with(['krsDetails.kelasKuliah.kurikulumMatakuliah.matakuliah', 'krsDetails.kelasKuliah.jadwalPerkuliahans.ruangKuliah', 'krsDetails.kelasKuliah.dosenPengajars.dosen'])
            ->firstOrCreate([
                'mahasiswa_id' => $mahasiswa->id,
                'tahun_ajaran_id' => $tahunAjaran->id,
            ], [
                'status' => 'draft',
            ]);

        // Filter ONLY classes that are ready for KRS (isReadyForKrs == true)
        $availableClasses = KelasKuliah::with([
            'kurikulumMatakuliah.matakuliah',
            'jadwalPerkuliahans.ruangKuliah',
            'dosenPengajars.dosen',
        ])
            ->withCount(['krsDetails as enrolled_count' => function ($q) {
                $q->whereHas('krs', function ($dq) {
                    $dq->whereIn('status', ['diajukan', 'disetujui_wali']);
                });
            }])
            ->where('tahun_ajaran_id', $tahunAjaran->id)
            ->whereHas('kurikulumMatakuliah.kurikulumProdi', function ($q) use ($mahasiswa) {
                $q->where('program_studi_id', $mahasiswa->program_studi_id)->where('is_active', true);
            })
            ->get()
            ->filter(fn ($k) => $k->isReadyForKrs())
            ->values();

        return Inertia::render('krs/student', [
            'mahasiswa' => $mahasiswa,
            'tahunAjaran' => $tahunAjaran,
            'eligibility' => $eligibility,
            'krs' => $krs,
            'availableClasses' => $availableClasses,
        ]);
    }

    /**
     * Submit Student KRS choices.
     */
    public function submitStudentKrs(Request $request, KrsService $krsService): RedirectResponse
    {
        $user = auth()->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();
        $tahunAjaran = TahunAjaran::where('is_active', true)->first() ?? TahunAjaran::latest()->first();

        $validated = $request->validate([
            'kelas_kuliah_ids' => ['required', 'array', 'min:1'],
            'kelas_kuliah_ids.*' => ['exists:kelas_kuliahs,id'],
        ], [
            'kelas_kuliah_ids.required' => 'Silakan pilih minimal 1 matakuliah untuk diajukan dalam KRS.',
        ]);

        $krs = Krs::firstOrCreate([
            'mahasiswa_id' => $mahasiswa->id,
            'tahun_ajaran_id' => $tahunAjaran->id,
        ]);

        try {
            $krsService->submitKrs($krs, $validated['kelas_kuliah_ids']);

            return back()->with('success', 'KRS berhasil diajukan ke Dosen Wali.');
        } catch (Exception $e) {
            return back()->withErrors(['krs' => $e->getMessage()]);
        }
    }

    /**
     * Dosen Wali Approval Dashboard.
     */
    public function dosenIndex(Request $request): Response
    {
        $user = auth()->user();
        $dosen = Dosen::where('user_id', $user->id)->first();
        $tahunAjaran = TahunAjaran::where('is_active', true)->first() ?? TahunAjaran::latest()->first();

        $krss = Krs::with([
            'mahasiswa.programStudi',
            'krsDetails.kelasKuliah.kurikulumMatakuliah.matakuliah',
            'krsDetails.kelasKuliah.jadwalPerkuliahans.ruangKuliah',
        ])
            ->where('tahun_ajaran_id', $tahunAjaran->id)
            ->when($dosen, function ($q) use ($dosen, $tahunAjaran) {
                $q->whereHas('mahasiswa.dosenWalis', function ($dq) use ($dosen, $tahunAjaran) {
                    $dq->where('dosen_id', $dosen->id)->where('tahun_ajaran_id', $tahunAjaran->id);
                });
            })
            ->orderByDesc('id')
            ->get();

        return Inertia::render('perwalian/dosen-approval', [
            'krss' => $krss,
            'tahunAjaran' => $tahunAjaran,
        ]);
    }

    /**
     * Dosen Wali Approve KRS.
     */
    public function approveKrs(Krs $krs, KrsService $krsService): RedirectResponse
    {
        $dosen = Dosen::where('user_id', auth()->id())->first();

        try {
            $krsService->approveKrsByDosenWali($krs, $dosen?->id ?? auth()->id());

            return back()->with('success', 'KRS Mahasiswa berhasil disetujui.');
        } catch (Exception $e) {
            return back()->withErrors(['approval' => $e->getMessage()]);
        }
    }

    /**
     * Dosen Wali Reject KRS.
     */
    public function rejectKrs(Request $request, Krs $krs, KrsService $krsService): RedirectResponse
    {
        $validated = $request->validate([
            'catatan' => ['required', 'string', 'max:500'],
        ], [
            'catatan.required' => 'Alasan penolakan KRS wajib diisi.',
        ]);

        $dosen = Dosen::where('user_id', auth()->id())->first();

        try {
            $krsService->rejectKrsByDosenWali($krs, $dosen?->id ?? auth()->id(), $validated['catatan']);

            return back()->with('success', 'KRS Mahasiswa berhasil ditolak dengan catatan.');
        } catch (Exception $e) {
            return back()->withErrors(['approval' => $e->getMessage()]);
        }
    }
}
