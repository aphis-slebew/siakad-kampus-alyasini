<?php

use App\Models\AktivitasMahasiswa;
use App\Models\BeasiswaMahasiswa;
use App\Models\Fakultas;
use App\Models\Mahasiswa;
use App\Models\ProgramStudi;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => RoleAndPermissionSeeder::class]);
});

test('unauthorized student role is blocked at route level when trying to create yudisium or wisuda period', function () {
    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $userMhs->assignRole('mahasiswa');

    // Route middleware role:superadmin|admin_akademik blocks mahasiswa at HTTP route level
    $resYudisium = $this->actingAs($userMhs)->post('/yudisium', ['mahasiswa_id' => 1, 'periode_wisuda_id' => 1]);
    $resYudisium->assertStatus(403);

    $resPeriode = $this->actingAs($userMhs)->post('/yudisium/periode-wisuda', ['nama' => 'Wisuda XVIII', 'tanggal_wisuda' => '2026-10-10']);
    $resPeriode->assertStatus(403);
});

test('unauthorized student role is blocked at route level when trying to access presensi portal', function () {
    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $userMhs->assignRole('mahasiswa');

    // Route middleware role:superadmin|admin_akademik|dosen blocks mahasiswa at HTTP route level
    $resIndex = $this->actingAs($userMhs)->get('/akademik/presensi');
    $resIndex->assertStatus(403);

    $resStore = $this->actingAs($userMhs)->post('/akademik/presensi', []);
    $resStore->assertStatus(403);
});

test('unauthorized student role is blocked at route level when trying to validate or create kemahasiswaan records', function () {
    $fakultas = Fakultas::create(['kode' => 'FTIK', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PAI99', 'nama' => 'Pendidikan Agama Islam', 'jenjang' => 'S1']);

    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $userMhs->assignRole('mahasiswa');
    $mhs = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026AUTH01', 'nama_lengkap' => 'Mhs Unauthorized', 'tahun_masuk' => 2026]);

    $aktivitas = AktivitasMahasiswa::create(['mahasiswa_id' => $mhs->id, 'nama_kegiatan' => 'Lomba Karya Tulis', 'status_validasi' => 'diajukan']);
    $beasiswa = BeasiswaMahasiswa::create(['mahasiswa_id' => $mhs->id, 'status' => 'diajukan']);

    // Route middleware role:superadmin|admin_akademik blocks mahasiswa at HTTP route level
    $resAktivitas = $this->actingAs($userMhs)->post("/kemahasiswaan/aktivitas/{$aktivitas->id}/validate");
    $resAktivitas->assertStatus(403);

    $resPelanggaran = $this->actingAs($userMhs)->post('/kemahasiswaan/pelanggaran', ['mahasiswa_id' => $mhs->id, 'tanggal' => '2026-08-07']);
    $resPelanggaran->assertStatus(403);

    $resBeasiswa = $this->actingAs($userMhs)->post("/kemahasiswaan/beasiswa/{$beasiswa->id}/approve", ['status' => 'diterima']);
    $resBeasiswa->assertStatus(403);
});
