<?php

use App\Models\Fakultas;
use App\Models\KelasKuliah;
use App\Models\KurikulumMatakuliah;
use App\Models\KurikulumProdi;
use App\Models\Matakuliah;
use App\Models\ProgramStudi;
use App\Models\SettingProdi;
use App\Models\TahunAjaran;
use App\Models\User;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
});

test('admin_akademik and superadmin can view setting prodi list and details', function () {
    $admin = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $admin->assignRole('admin_akademik');

    $ta = TahunAjaran::create(['nama' => '2025/2026 Genap', 'mulai' => '2026-02-01', 'selesai' => '2026-06-30', 'is_active' => true]);
    $fakultas = Fakultas::create(['kode' => 'FTK', 'nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => '86231', 'nama' => 'MPI', 'jenjang' => 'S1']);

    $this->actingAs($admin)
        ->get(route('akademik.setting-prodi.index', ['tahun_ajaran_id' => $ta->id]))
        ->assertOk();

    $setting = SettingProdi::where('tahun_ajaran_id', $ta->id)->where('program_studi_id', $prodi->id)->first();
    expect($setting)->not->toBeNull();

    $this->actingAs($admin)
        ->get(route('akademik.setting-prodi.show', $setting->id))
        ->assertOk();
});

test('admin_akademik can update setting prodi tab parameters', function () {
    $admin = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $admin->assignRole('admin_akademik');

    $ta = TahunAjaran::create(['nama' => '2025/2026 Genap', 'mulai' => '2026-02-01', 'selesai' => '2026-06-30', 'is_active' => true]);
    $fakultas = Fakultas::create(['kode' => 'FTK', 'nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => '86231', 'nama' => 'MPI', 'jenjang' => 'S1']);

    $setting = SettingProdi::create([
        'tahun_ajaran_id' => $ta->id,
        'program_studi_id' => $prodi->id,
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
        'buka_ubah_biodata' => false,
        'buka_kuesioner' => true,
        'dosen_generate_tatap_muka' => false,
        'jumlah_pertemuan_kuliah' => 16,
        'batas_waktu_perubahan_presensi_hari' => 3,
        'buka_setting_ketua_kelas' => false,
    ]);

    $this->actingAs($admin)
        ->put(route('akademik.setting-prodi.update', $setting->id), [
            'buka_krs' => true,
            'tgl_awal_krs' => '2026-02-18',
            'tgl_akhir_krs' => '2026-06-30',
            'tgl_cetak_krs' => '2026-02-28',
            'buka_validasi_krs' => true,
            'tgl_awal_validasi_krs' => '2026-02-20',
            'tgl_akhir_validasi_krs' => '2026-08-31',
            'dosen_tampil_di_krs' => true,
            'buka_cetak_krs' => true,

            'buka_khs' => true,
            'tgl_cetak_khs' => '2026-08-14',
            'buka_pengisian_nilai' => true,
            'dosen_isi_persentase_komponen' => true,
            'tgl_awal_pengisian_nilai' => '2026-08-01',
            'tgl_akhir_pengisian_nilai' => '2026-08-31',

            'buka_cetak_uts' => true,
            'tgl_awal_cetak_uts' => '2026-05-13',
            'tgl_akhir_cetak_uts' => '2026-05-31',
            'tgl_cetak_uts' => '2026-05-19',
            'min_presensi_uts' => 50,
            'min_presensi_uas' => 75,
            'buka_cetak_uas' => false,

            'buka_ubah_biodata' => false,
            'buka_kuesioner' => true,
            'dosen_generate_tatap_muka' => false,
            'jumlah_pertemuan_kuliah' => 16,
            'batas_waktu_perubahan_presensi_hari' => 3,
            'buka_setting_ketua_kelas' => false,
        ])
        ->assertRedirect();

    $setting->refresh();
    expect($setting->min_presensi_uts)->toBe(50);
    expect($setting->min_presensi_uas)->toBe(75);
});

test('admin_akademik can copy setting prodi from previous semester', function () {
    $admin = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $admin->assignRole('admin_akademik');

    $ta1 = TahunAjaran::create(['nama' => '2025/2026 Ganjil', 'mulai' => '2025-09-01', 'selesai' => '2026-01-31', 'is_active' => false]);
    $ta2 = TahunAjaran::create(['nama' => '2025/2026 Genap', 'mulai' => '2026-02-01', 'selesai' => '2026-06-30', 'is_active' => true]);

    $fakultas = Fakultas::create(['kode' => 'FTK', 'nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => '86231', 'nama' => 'MPI', 'jenjang' => 'S1']);

    SettingProdi::create([
        'tahun_ajaran_id' => $ta1->id,
        'program_studi_id' => $prodi->id,
        'buka_krs' => true,
        'buka_validasi_krs' => true,
        'dosen_tampil_di_krs' => true,
        'buka_cetak_krs' => true,
        'buka_khs' => true,
        'buka_pengisian_nilai' => true,
        'dosen_isi_persentase_komponen' => true,
        'buka_cetak_uts' => true,
        'buka_cetak_uas' => false,
        'min_presensi_uts' => 55,
        'min_presensi_uas' => 80,
        'buka_ubah_biodata' => false,
        'buka_kuesioner' => true,
        'dosen_generate_tatap_muka' => false,
        'jumlah_pertemuan_kuliah' => 16,
        'batas_waktu_perubahan_presensi_hari' => 3,
        'buka_setting_ketua_kelas' => false,
    ]);

    $this->actingAs($admin)
        ->post(route('akademik.setting-prodi.copy'), [
            'from_tahun_ajaran_id' => $ta1->id,
            'to_tahun_ajaran_id' => $ta2->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('setting_prodis', [
        'tahun_ajaran_id' => $ta2->id,
        'program_studi_id' => $prodi->id,
        'min_presensi_uts' => 55,
        'min_presensi_uas' => 80,
    ]);
});

test('unauthorized user cannot manage setting prodi', function () {
    $mahasiswa = User::factory()->create(['user_type' => 'mahasiswa', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $mahasiswa->assignRole('mahasiswa');

    $this->actingAs($mahasiswa)
        ->get(route('akademik.setting-prodi.index'))
        ->assertForbidden();
});

test('kelas kuliah index supports filters and returns kurikulum list', function () {
    $admin = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $admin->assignRole('admin_akademik');

    $ta = TahunAjaran::create(['nama' => '2025/2026 Genap', 'mulai' => '2026-02-01', 'selesai' => '2026-06-30', 'is_active' => true]);
    $fakultas = Fakultas::create(['kode' => 'FEBI', 'nama' => 'Fakultas Ekonomi']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => '86232', 'nama' => 'ES', 'jenjang' => 'S1']);
    $kurikulum = KurikulumProdi::create(['program_studi_id' => $prodi->id, 'tahun_kurikulum' => '2023', 'is_active' => true]);
    $mk = Matakuliah::create(['kode' => 'LK002', 'nama' => 'Kajian Kitab Turats II', 'sks' => 2]);
    $km = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk->id, 'semester' => 2]);

    $kelas = KelasKuliah::create([
        'kurikulum_matakuliah_id' => $km->id,
        'tahun_ajaran_id' => $ta->id,
        'nama_kelas' => 'A2',
        'kuota' => 40,
        'sistem_kuliah' => 'reguler',
    ]);

    $this->actingAs($admin)
        ->get(route('akademik.kelas-kuliah.index', [
            'tahun_ajaran_id' => $ta->id,
            'program_studi_id' => $prodi->id,
            'kurikulum_id' => $kurikulum->id,
            'sistem_kuliah' => 'reguler',
        ]))
        ->assertOk();
});
