<?php

use App\Models\Fakultas;
use App\Models\KalenderAkademik;
use App\Models\Konsentrasi;
use App\Models\ProgramStudi;
use App\Models\ReferensiBiodata;
use App\Models\RuangKuliah;
use App\Models\TahunAjaran;
use App\Models\Wilayah;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

test('role and permission seeder creates all 10 defined roles', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $expectedRoles = [
        'superadmin',
        'admin_akademik',
        'panitia_pmb',
        'staf_keuangan',
        'kaprodi',
        'dosen',
        'staf_kepegawaian',
        'mahasiswa',
        'calon_mahasiswa',
        'operator_kemahasiswaan',
    ];

    foreach ($expectedRoles as $roleName) {
        expect(Role::where('name', $roleName)->exists())->toBeTrue();
    }
});

test('master data tables can be created and queried', function () {
    $fakultas = Fakultas::create([
        'kode' => 'FTI',
        'nama' => 'Fakultas Tarbiyah dan Ilmu Keguruan',
    ]);

    $prodi = ProgramStudi::create([
        'fakultas_id' => $fakultas->id,
        'kode' => 'PAI',
        'nama' => 'Pendidikan Agama Islam',
        'jenjang' => 'S1',
        'sks_lulus_min' => 144,
    ]);

    $konsentrasi = Konsentrasi::create([
        'program_studi_id' => $prodi->id,
        'nama' => 'Pendidikan Bahasa Arab',
    ]);

    $tahunAjaran = TahunAjaran::create([
        'nama' => '2026/2027 Ganjil',
        'mulai' => '2026-09-01',
        'selesai' => '2027-01-31',
        'is_active' => true,
    ]);

    $kalender = KalenderAkademik::create([
        'tahun_ajaran_id' => $tahunAjaran->id,
        'kegiatan' => 'Perkuliahan Semester Ganjil',
        'mulai' => '2026-09-01',
        'selesai' => '2026-12-20',
    ]);

    $ruang = RuangKuliah::create([
        'kode' => 'RK-01',
        'nama' => 'Ruang Kuliah 01',
        'kapasitas' => 40,
    ]);

    $refBio = ReferensiBiodata::create([
        'tipe' => 'agama',
        'nama' => 'Islam',
        'pddikti_ref_id' => '1',
    ]);

    $wilayah = Wilayah::create([
        'kode' => '3575000',
        'nama' => 'Kota Pasuruan',
        'level' => 2,
    ]);

    expect($fakultas->programStudis)->toHaveCount(1);
    expect($prodi->konsentrasis)->toHaveCount(1);
    expect($tahunAjaran->kalenderAkademiks)->toHaveCount(1);
    expect(RuangKuliah::count())->toBe(1);
    expect(ReferensiBiodata::count())->toBe(1);
    expect(Wilayah::count())->toBe(1);
});
