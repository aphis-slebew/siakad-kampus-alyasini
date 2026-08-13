<?php

namespace App\Http\Controllers\Akademik;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\DosenPengajar;
use App\Models\JadwalPerkuliahan;
use App\Models\KelasKuliah;
use App\Models\KurikulumMatakuliah;
use App\Models\RuangKuliah;
use App\Models\TahunAjaran;
use App\Services\ScheduleConflictValidationService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class KelasKuliahController extends Controller
{
    public function index(Request $request): Response
    {
        $kelases = KelasKuliah::with([
            'kurikulumMatakuliah.matakuliah',
            'kurikulumMatakuliah.kurikulumProdi.programStudi',
            'tahunAjaran',
            'dosenPengajars.dosen',
            'jadwalPerkuliahans.ruangKuliah',
        ])
            ->orderByDesc('tahun_ajaran_id')
            ->orderBy('id')
            ->get();

        $tahunAjarans = TahunAjaran::orderByDesc('id')->get();
        $kurikulumMatakuliahs = KurikulumMatakuliah::with(['matakuliah', 'kurikulumProdi.programStudi'])->get();
        $dosens = Dosen::orderBy('nama_lengkap')->get();
        $ruangs = RuangKuliah::orderBy('kode')->get();

        return Inertia::render('akademik/kelas-kuliah/index', [
            'kelases' => $kelases,
            'tahunAjarans' => $tahunAjarans,
            'kurikulumMatakuliahs' => $kurikulumMatakuliahs,
            'dosens' => $dosens,
            'ruangs' => $ruangs,
        ]);
    }

    public function store(Request $request, ScheduleConflictValidationService $conflictService): RedirectResponse
    {
        $validated = $request->validate([
            'kurikulum_matakuliah_id' => ['required', 'exists:kurikulum_matakuliahs,id'],
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id'],
            'nama_kelas' => ['required', 'string', 'max:50'],
            'kuota' => ['required', 'integer', 'min:1', 'max:500'],
            'dosen_ids' => ['required', 'array', 'min:1'],
            'dosen_ids.*' => ['exists:dosens,id'],
            'ruang_kuliah_id' => ['required', 'exists:ruang_kuliahs,id'],
            'hari' => ['required', 'in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu'],
            'jam_mulai' => ['required', 'string'],
            'jam_selesai' => ['required', 'string'],
        ], [
            'kurikulum_matakuliah_id.required' => 'Matakuliah wajib dipilih.',
            'tahun_ajaran_id.required' => 'Tahun ajaran wajib dipilih.',
            'nama_kelas.required' => 'Nama kelas (A/B/C) wajib diisi.',
            'kuota.required' => 'Kuota mahasiswa wajib diisi.',
            'dosen_ids.required' => 'Dosen pengajar utama wajib ditugaskan.',
            'ruang_kuliah_id.required' => 'Ruang kuliah wajib dipilih.',
            'hari.required' => 'Hari perkuliahan wajib dipilih.',
            'jam_mulai.required' => 'Jam mulai perkuliahan wajib diisi.',
            'jam_selesai.required' => 'Jam selesai perkuliahan wajib diisi.',
        ]);

        try {
            DB::transaction(function () use ($validated, $conflictService) {
                // 1. Create Kelas Kuliah
                // TODO: Langkah 6 - validasi kuota saat KRS dibangun
                $kelas = KelasKuliah::create([
                    'kurikulum_matakuliah_id' => $validated['kurikulum_matakuliah_id'],
                    'tahun_ajaran_id' => $validated['tahun_ajaran_id'],
                    'nama_kelas' => $validated['nama_kelas'],
                    'kuota' => $validated['kuota'],
                ]);

                // 2. Assign Dosen Pengajar
                $dosenIds = $validated['dosen_ids'] ?? [];
                foreach ($dosenIds as $index => $dosenId) {
                    DosenPengajar::create([
                        'kelas_kuliah_id' => $kelas->id,
                        'dosen_id' => $dosenId,
                        'peran' => ($index === 0) ? 'utama' : 'asisten',
                    ]);
                }

                // 3. Create Schedule if provided (with ScheduleConflictValidationService)
                if (! empty($validated['ruang_kuliah_id']) && ! empty($validated['hari']) && ! empty($validated['jam_mulai']) && ! empty($validated['jam_selesai'])) {
                    $conflictService->validate(
                        $kelas->id,
                        $validated['ruang_kuliah_id'],
                        $validated['hari'],
                        $validated['jam_mulai'],
                        $validated['jam_selesai'],
                        $dosenIds
                    );

                    JadwalPerkuliahan::create([
                        'kelas_kuliah_id' => $kelas->id,
                        'ruang_kuliah_id' => $validated['ruang_kuliah_id'],
                        'hari' => $validated['hari'],
                        'jam_mulai' => $validated['jam_mulai'],
                        'jam_selesai' => $validated['jam_selesai'],
                    ]);
                }
            });

            return back()->with('success', 'Kelas kuliah dan jadwal perkuliahan berhasil ditambahkan.');
        } catch (Exception $e) {
            return back()->withErrors(['jadwal' => $e->getMessage()]);
        }
    }

    public function update(Request $request, KelasKuliah $kela, ScheduleConflictValidationService $conflictService): RedirectResponse
    {
        $validated = $request->validate([
            'kurikulum_matakuliah_id' => ['required', 'exists:kurikulum_matakuliahs,id'],
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id'],
            'nama_kelas' => ['required', 'string', 'max:50'],
            'kuota' => ['required', 'integer', 'min:1', 'max:500'],
            'dosen_ids' => ['nullable', 'array'],
            'dosen_ids.*' => ['exists:dosens,id'],
            'ruang_kuliah_id' => ['nullable', 'exists:ruang_kuliahs,id'],
            'hari' => ['nullable', 'in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu'],
            'jam_mulai' => ['nullable', 'string'],
            'jam_selesai' => ['nullable', 'string'],
        ]);

        try {
            DB::transaction(function () use ($kela, $validated, $conflictService) {
                // TODO: Langkah 6 - validasi kuota saat KRS dibangun
                $kela->update([
                    'kurikulum_matakuliah_id' => $validated['kurikulum_matakuliah_id'],
                    'tahun_ajaran_id' => $validated['tahun_ajaran_id'],
                    'nama_kelas' => $validated['nama_kelas'],
                    'kuota' => $validated['kuota'],
                ]);

                // Update Dosen Pengajar
                DosenPengajar::where('kelas_kuliah_id', $kela->id)->delete();
                $dosenIds = $validated['dosen_ids'] ?? [];
                foreach ($dosenIds as $index => $dosenId) {
                    DosenPengajar::create([
                        'kelas_kuliah_id' => $kela->id,
                        'dosen_id' => $dosenId,
                        'peran' => ($index === 0) ? 'utama' : 'asisten',
                    ]);
                }

                // Update Schedule with conflict validation
                if (! empty($validated['ruang_kuliah_id']) && ! empty($validated['hari']) && ! empty($validated['jam_mulai']) && ! empty($validated['jam_selesai'])) {
                    $existingJadwal = JadwalPerkuliahan::where('kelas_kuliah_id', $kela->id)->first();
                    $ignoreJadwalId = $existingJadwal ? $existingJadwal->id : null;

                    $conflictService->validate(
                        $kela->id,
                        $validated['ruang_kuliah_id'],
                        $validated['hari'],
                        $validated['jam_mulai'],
                        $validated['jam_selesai'],
                        $dosenIds,
                        $ignoreJadwalId
                    );

                    JadwalPerkuliahan::updateOrCreate(
                        ['kelas_kuliah_id' => $kela->id],
                        [
                            'ruang_kuliah_id' => $validated['ruang_kuliah_id'],
                            'hari' => $validated['hari'],
                            'jam_mulai' => $validated['jam_mulai'],
                            'jam_selesai' => $validated['jam_selesai'],
                        ]
                    );
                }
            });

            return back()->with('success', 'Kelas kuliah dan jadwal perkuliahan berhasil diperbarui.');
        } catch (Exception $e) {
            return back()->withErrors(['jadwal' => $e->getMessage()]);
        }
    }

    public function destroy(KelasKuliah $kela): RedirectResponse
    {
        $kela->delete();

        return back()->with('success', 'Kelas kuliah berhasil dihapus.');
    }
}
