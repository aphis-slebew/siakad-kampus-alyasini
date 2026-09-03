<?php

namespace App\Http\Controllers\Akademik;

use App\Http\Controllers\Controller;
use App\Models\KurikulumProdi;
use App\Models\PerguruanTinggi;
use App\Models\ProgramStudi;
use App\Models\SettingProdi;
use App\Models\TahunAjaran;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingProdiController extends Controller
{
    /**
     * Display a listing of setting prodis for the selected/active academic year.
     */
    public function index(Request $request): Response
    {
        $tahunAjaranId = $request->input('tahun_ajaran_id')
            ?: (TahunAjaran::where('is_active', true)->first()?->id ?: TahunAjaran::latest('id')->first()?->id);

        $tahunAjarans = TahunAjaran::orderByDesc('id')->get();
        $programStudis = ProgramStudi::with('fakultas')->orderBy('kode')->get();

        // Ensure default setting exists for the academic year and each program studi
        if ($tahunAjaranId) {
            // Global/Institute-level setting (program_studi_id = null)
            SettingProdi::firstOrCreate([
                'tahun_ajaran_id' => $tahunAjaranId,
                'program_studi_id' => null,
            ], [
                'buka_krs' => true,
                'buka_validasi_krs' => true,
                'dosen_tampil_di_krs' => true,
                'buka_cetak_krs' => true,
                'buka_khs' => true,
                'buka_pengisian_nilai' => true,
                'dosen_isi_persentase_komponen' => true,
                'buka_cetak_uts' => true,
                'buka_cetak_uas' => false,
                'min_presensi_uts' => 50,
                'min_presensi_uas' => 75,
                'jumlah_pertemuan_kuliah' => 16,
                'batas_waktu_perubahan_presensi_hari' => 3,
            ]);

            foreach ($programStudis as $prodi) {
                SettingProdi::firstOrCreate([
                    'tahun_ajaran_id' => $tahunAjaranId,
                    'program_studi_id' => $prodi->id,
                ], [
                    'buka_krs' => true,
                    'buka_validasi_krs' => true,
                    'dosen_tampil_di_krs' => true,
                    'buka_cetak_krs' => true,
                    'buka_khs' => true,
                    'buka_pengisian_nilai' => true,
                    'dosen_isi_persentase_komponen' => true,
                    'buka_cetak_uts' => true,
                    'buka_cetak_uas' => false,
                    'min_presensi_uts' => 50,
                    'min_presensi_uas' => 75,
                    'jumlah_pertemuan_kuliah' => 16,
                    'batas_waktu_perubahan_presensi_hari' => 3,
                ]);
            }
        }

        $settings = SettingProdi::with(['tahunAjaran', 'programStudi.fakultas'])
            ->where('tahun_ajaran_id', $tahunAjaranId)
            ->orderBy('program_studi_id')
            ->get();

        $selectedTahun = TahunAjaran::find($tahunAjaranId);

        return Inertia::render('akademik/setting-prodi/index', [
            'settings' => $settings,
            'tahunAjarans' => $tahunAjarans,
            'selectedTahun' => $selectedTahun,
            'filters' => [
                'tahun_ajaran_id' => $tahunAjaranId ? (int) $tahunAjaranId : null,
            ],
        ]);
    }

    /**
     * Display the specified setting prodi detail page (matching reference UI Photo 1, 2, 3, 4).
     */
    public function show(SettingProdi $settingProdi): Response
    {
        $settingProdi->load(['tahunAjaran', 'programStudi.fakultas', 'kurikulumProdi']);
        $pt = PerguruanTinggi::first();
        $kurikulums = KurikulumProdi::where('program_studi_id', $settingProdi->program_studi_id)->get();

        return Inertia::render('akademik/setting-prodi/show', [
            'setting' => $settingProdi,
            'perguruanTinggi' => $pt,
            'kurikulums' => $kurikulums,
        ]);
    }

    /**
     * Update the specified setting prodi.
     */
    public function update(Request $request, SettingProdi $settingProdi): RedirectResponse
    {
        $validated = $request->validate([
            'kurikulum_id' => ['nullable', 'exists:kurikulum_prodis,id'],

            // Tab 1: KRS & Validasi
            'buka_krs' => ['required', 'boolean'],
            'tgl_awal_krs' => ['nullable', 'date'],
            'tgl_akhir_krs' => ['nullable', 'date'],
            'tgl_cetak_krs' => ['nullable', 'date'],
            'buka_validasi_krs' => ['required', 'boolean'],
            'tgl_awal_validasi_krs' => ['nullable', 'date'],
            'tgl_akhir_validasi_krs' => ['nullable', 'date'],
            'dosen_tampil_di_krs' => ['required', 'boolean'],
            'buka_cetak_krs' => ['required', 'boolean'],

            // Tab 2: KHS & Nilai
            'buka_khs' => ['required', 'boolean'],
            'tgl_awal_khs' => ['nullable', 'date'],
            'tgl_akhir_khs' => ['nullable', 'date'],
            'tgl_cetak_khs' => ['nullable', 'date'],
            'buka_pengisian_nilai' => ['required', 'boolean'],
            'dosen_isi_persentase_komponen' => ['required', 'boolean'],
            'tgl_awal_pengisian_nilai' => ['nullable', 'date'],
            'tgl_akhir_pengisian_nilai' => ['nullable', 'date'],

            // Tab 3: Ujian
            'buka_cetak_uts' => ['required', 'boolean'],
            'tgl_awal_cetak_uts' => ['nullable', 'date'],
            'tgl_akhir_cetak_uts' => ['nullable', 'date'],
            'tgl_cetak_uts' => ['nullable', 'date'],
            'min_presensi_uts' => ['required', 'integer', 'min:0', 'max:100'],
            'min_presensi_uas' => ['required', 'integer', 'min:0', 'max:100'],
            'buka_cetak_uas' => ['required', 'boolean'],
            'tgl_awal_cetak_uas' => ['nullable', 'date'],
            'tgl_akhir_cetak_uas' => ['nullable', 'date'],
            'tgl_cetak_uas' => ['nullable', 'date'],

            // Tab 4: Lain-lain
            'buka_ubah_biodata' => ['required', 'boolean'],
            'buka_kuesioner' => ['required', 'boolean'],
            'tgl_awal_kuesioner' => ['nullable', 'date'],
            'tgl_akhir_kuesioner' => ['nullable', 'date'],
            'dosen_generate_tatap_muka' => ['required', 'boolean'],
            'jumlah_pertemuan_kuliah' => ['required', 'integer', 'min:1', 'max:32'],
            'batas_waktu_perubahan_presensi_hari' => ['required', 'integer', 'min:0', 'max:30'],
            'buka_setting_ketua_kelas' => ['required', 'boolean'],
        ]);

        $old = $settingProdi->toArray();
        $settingProdi->update($validated);

        ActivityLogger::log('akademik.setting_prodi.update', 'SettingProdi', $settingProdi->id, $old, $validated);

        return back()->with('success', 'Pengaturan program studi berhasil diperbarui.');
    }

    /**
     * Copy all settings from previous semester to another.
     */
    public function copyFromSemester(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'from_tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id'],
            'to_tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id', 'different:from_tahun_ajaran_id'],
        ]);

        $sourceSettings = SettingProdi::where('tahun_ajaran_id', $validated['from_tahun_ajaran_id'])->get();

        if ($sourceSettings->isEmpty()) {
            return back()->with('error', 'Tidak ada data pengaturan pada semester sumber yang dipilih.');
        }

        $copiedCount = 0;
        foreach ($sourceSettings as $src) {
            $data = $src->toArray();
            unset($data['id'], $data['created_at'], $data['updated_at']);
            $data['tahun_ajaran_id'] = $validated['to_tahun_ajaran_id'];

            SettingProdi::updateOrCreate([
                'tahun_ajaran_id' => $validated['to_tahun_ajaran_id'],
                'program_studi_id' => $src->program_studi_id,
            ], $data);

            $copiedCount++;
        }

        ActivityLogger::log('akademik.setting_prodi.copy', 'SettingProdi', $validated['to_tahun_ajaran_id'], null, [
            'copied_count' => $copiedCount,
        ]);

        return back()->with('success', "Berhasil menyalin {$copiedCount} pengaturan dari semester sebelumnya.");
    }
}
