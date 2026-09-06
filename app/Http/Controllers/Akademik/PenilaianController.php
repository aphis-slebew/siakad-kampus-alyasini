<?php

namespace App\Http\Controllers\Akademik;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\KelasKuliah;
use App\Models\KomposisiNilai;
use App\Models\KrsDetail;
use App\Models\Nilai;
use App\Models\TahunAjaran;
use App\Services\PenilaianService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PenilaianController extends Controller
{
    /**
     * Grade Portal for Dosen & Admin.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $dosen = Dosen::where('user_id', $user->id)->first();
        $tahunAjaran = TahunAjaran::where('is_active', true)->first() ?? TahunAjaran::latest()->first();

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

        $komposisis = [];
        $studentsGradeSheet = [];

        if ($selectedKelas) {
            $komposisis = KomposisiNilai::where('kelas_kuliah_id', $selectedKelas->id)->get();

            $krsDetails = KrsDetail::with(['krs.mahasiswa', 'nilais'])
                ->where('kelas_kuliah_id', $selectedKelas->id)
                ->whereHas('krs', fn ($q) => $q->where('status', 'disetujui_wali'))
                ->get();

            foreach ($krsDetails as $detail) {
                $scores = [];
                foreach ($detail->nilais as $n) {
                    $scores[$n->komponen] = [
                        'id' => $n->id,
                        'nilai_angka' => $n->nilai_angka,
                        'nilai_huruf' => $n->nilai_huruf,
                        'is_final' => $n->is_final,
                    ];
                }

                $studentsGradeSheet[] = [
                    'krs_detail_id' => $detail->id,
                    'mahasiswa' => $detail->krs->mahasiswa,
                    'scores' => $scores,
                    'is_final' => $detail->nilais->first()?->is_final ?? false,
                ];
            }
        }

        return Inertia::render('akademik/penilaian/index', [
            'kelases' => $kelases,
            'selectedKelas' => $selectedKelas,
            'komposisis' => $komposisis,
            'studentsGradeSheet' => $studentsGradeSheet,
            'tahunAjaran' => $tahunAjaran,
        ]);
    }

    /**
     * Save grade composition (must total 100%).
     */
    public function saveKomposisi(Request $request, PenilaianService $penilaianService): RedirectResponse
    {
        $validated = $request->validate([
            'kelas_kuliah_id' => ['required', 'exists:kelas_kuliahs,id'],
            'komposisis' => ['required', 'array', 'min:1'],
            'komposisis.*.komponen' => ['required', 'string'],
            'komposisis.*.bobot_persen' => ['required', 'numeric', 'min:1', 'max:100'],
        ]);

        $kelas = KelasKuliah::findOrFail((int) $validated['kelas_kuliah_id']);

        try {
            $penilaianService->saveKomposisiNilai($kelas, $validated['komposisis']);

            return back()->with('success', 'Komposisi nilai perkuliahan berhasil disimpan (Total Bobot 100%).');
        } catch (Exception $e) {
            return back()->withErrors(['penilaian' => $e->getMessage()]);
        }
    }

    /**
     * Dosen inputs student scores.
     */
    public function inputNilai(Request $request, PenilaianService $penilaianService): RedirectResponse
    {
        $validated = $request->validate([
            'kelas_kuliah_id' => ['required', 'exists:kelas_kuliahs,id'],
            'krs_detail_id' => ['required', 'exists:krs_details,id'],
            'scores' => ['required', 'array'], // e.g. ['tugas' => 85, 'uts' => 80, 'uas' => 90]
        ]);

        $kelas = KelasKuliah::findOrFail((int) $validated['kelas_kuliah_id']);

        try {
            $penilaianService->inputNilaiByDosen($kelas, (int) $validated['krs_detail_id'], $validated['scores'], (int) auth()->id());

            return back()->with('success', 'Nilai mahasiswa berhasil diperbarui.');
        } catch (Exception $e) {
            return back()->withErrors(['penilaian' => $e->getMessage()]);
        }
    }

    /**
     * Finalize class grades.
     */
    public function finalize(Request $request, PenilaianService $penilaianService): RedirectResponse
    {
        $validated = $request->validate([
            'kelas_kuliah_id' => ['required', 'exists:kelas_kuliahs,id'],
        ]);

        $kelas = KelasKuliah::findOrFail((int) $validated['kelas_kuliah_id']);

        try {
            $penilaianService->finalizeNilai($kelas, (int) auth()->id());

            return back()->with('success', 'Nilai kelas kuliah berhasil difinalisasi.');
        } catch (Exception $e) {
            return back()->withErrors(['penilaian' => $e->getMessage()]);
        }
    }

    /**
     * Service Pemutihan Nilai (Admin override final grade).
     */
    public function whitewash(Request $request, PenilaianService $penilaianService): RedirectResponse
    {
        $validated = $request->validate([
            'nilai_id' => ['required', 'exists:nilais,id'],
            'nilai_angka_baru' => ['required', 'numeric', 'min:0', 'max:100'],
            'alasan_pemutihan' => ['required', 'string', 'max:500'],
        ]);

        if (! auth()->user()->hasRole('superadmin') && ! auth()->user()->hasRole('admin_akademik')) {
            return back()->withErrors(['penilaian' => 'AKSES DITOLAK: Pemutihan nilai hanya dapat dilakukan oleh Admin Akademik.']);
        }

        $nilai = Nilai::findOrFail($validated['nilai_id']);

        try {
            $penilaianService->whitewashNilai($nilai, (float) $validated['nilai_angka_baru'], $validated['alasan_pemutihan'], auth()->id());

            return back()->with('success', 'Pemutihan nilai final berhasil diproses dan dicatat di Activity Log.');
        } catch (Exception $e) {
            return back()->withErrors(['penilaian' => $e->getMessage()]);
        }
    }
}
