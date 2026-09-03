<?php

use App\Models\Dosen;
use App\Models\Fakultas;
use App\Models\Pegawai;
use App\Models\ProgramStudi;
use App\Models\UnitKerja;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
});

test('Authorized user can view, create, update, and delete Unit Kerja', function () {
    $admin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $admin->assignRole('superadmin');

    // 1. Index
    $response = $this->actingAs($admin)->get(route('kepegawaian.unit-kerja.index'));
    $response->assertOk();

    // 2. Create
    $createRes = $this->actingAs($admin)->post(route('kepegawaian.unit-kerja.store'), [
        'kode' => 'BAA',
        'nama' => 'Bagian Administrasi Akademik',
    ]);
    $createRes->assertRedirect();
    $this->assertDatabaseHas('unit_kerjas', [
        'kode' => 'BAA',
        'nama' => 'Bagian Administrasi Akademik',
    ]);

    $unit = UnitKerja::where('kode', 'BAA')->first();

    // 3. Update
    $updateRes = $this->actingAs($admin)->put(route('kepegawaian.unit-kerja.update', $unit), [
        'kode' => 'BAA-KAMPUS',
        'nama' => 'Bagian Administrasi Akademik & Kemahasiswaan',
    ]);
    $updateRes->assertRedirect();
    expect($unit->fresh()->nama)->toBe('Bagian Administrasi Akademik & Kemahasiswaan');

    // 4. Delete
    $deleteRes = $this->actingAs($admin)->delete(route('kepegawaian.unit-kerja.destroy', $unit));
    $deleteRes->assertRedirect();
    $this->assertDatabaseMissing('unit_kerjas', ['id' => $unit->id]);
});

test('Unit Kerja cannot be deleted if it has assigned pegawais', function () {
    $admin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $admin->assignRole('superadmin');

    $unit = UnitKerja::create(['kode' => 'BAU', 'nama' => 'Bagian Administrasi Umum']);
    Pegawai::create([
        'nama_lengkap' => 'Ahmad Staf',
        'unit_kerja_id' => $unit->id,
        'status_kepegawaian' => 'tetap',
    ]);

    $response = $this->actingAs($admin)->delete(route('kepegawaian.unit-kerja.destroy', $unit));
    $response->assertRedirect();
    $this->assertDatabaseHas('unit_kerjas', ['id' => $unit->id]);
});

test('Authorized user can manage Pegawai and create associated user account', function () {
    $staf = User::factory()->create([
        'user_type' => 'pegawai',
        'two_factor_confirmed_at' => now(),
    ]);
    $staf->assignRole('staf_kepegawaian');

    $unit = UnitKerja::create(['kode' => 'IT', 'nama' => 'Unit Pelaksana Teknis Komputer & IT']);

    // 1. Index
    $res = $this->actingAs($staf)->get(route('kepegawaian.pegawai.index'));
    $res->assertOk();

    // 2. Store with user creation
    $storeRes = $this->actingAs($staf)->post(route('kepegawaian.pegawai.store'), [
        'nama_lengkap' => 'Budi Santoso, S.Kom.',
        'nip_internal' => 'NIP-IT-001',
        'unit_kerja_id' => $unit->id,
        'jabatan_struktural' => 'Kepala UPT IT',
        'status_kepegawaian' => 'tetap',
        'create_user_account' => true,
        'email' => 'budi.it@alyasini.ac.id',
        'user_role' => 'staf_kepegawaian',
        'password' => 'password123',
    ]);
    $storeRes->assertRedirect();

    $this->assertDatabaseHas('pegawais', [
        'nama_lengkap' => 'Budi Santoso, S.Kom.',
        'nip_internal' => 'NIP-IT-001',
        'unit_kerja_id' => $unit->id,
    ]);

    $createdUser = User::where('email', 'budi.it@alyasini.ac.id')->first();
    expect($createdUser)->not->toBeNull()
        ->and($createdUser->hasRole('staf_kepegawaian'))->toBeTrue();

    $pegawai = Pegawai::where('nip_internal', 'NIP-IT-001')->first();
    expect($pegawai->user_id)->toBe($createdUser->id);

    // 3. Update
    $updateRes = $this->actingAs($staf)->put(route('kepegawaian.pegawai.update', $pegawai), [
        'nama_lengkap' => 'Budi Santoso, M.Kom.',
        'nip_internal' => 'NIP-IT-001',
        'unit_kerja_id' => $unit->id,
        'jabatan_struktural' => 'Kepala Pusat Data & Sistem Informasi',
        'status_kepegawaian' => 'tetap',
    ]);
    $updateRes->assertRedirect();
    expect($pegawai->fresh()->nama_lengkap)->toBe('Budi Santoso, M.Kom.')
        ->and($createdUser->fresh()->name)->toBe('Budi Santoso, M.Kom.');

    // 4. Delete (Soft delete)
    $deleteRes = $this->actingAs($staf)->delete(route('kepegawaian.pegawai.destroy', $pegawai));
    $deleteRes->assertRedirect();
    expect($pegawai->fresh()->trashed())->toBeTrue();
});

test('Authorized user can manage Dosen, education history, and functional promotion', function () {
    $admin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $admin->assignRole('superadmin');

    $fakultas = Fakultas::create(['kode' => 'TAR', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create([
        'fakultas_id' => $fakultas->id,
        'kode' => 'PAI',
        'nama' => 'Pendidikan Agama Islam',
        'jenjang' => 'S1',
    ]);

    // 1. Index
    $res = $this->actingAs($admin)->get(route('kepegawaian.dosen.index'));
    $res->assertOk();

    // 2. Store Dosen with user account
    $storeRes = $this->actingAs($admin)->post(route('kepegawaian.dosen.store'), [
        'nama_lengkap' => 'Muhammad Syarifuddin',
        'gelar_depan' => 'Dr.',
        'gelar_belakang' => 'M.Pd.I',
        'nidn' => '2105088901',
        'program_studi_id' => $prodi->id,
        'email_pribadi' => 'syarif@alyasini.ac.id',
        'jabatan_fungsional_saat_ini' => 'Tenaga Pengajar',
        'status_kepegawaian' => 'tetap',
        'sertifikasi_pendidik' => true,
        'create_user_account' => true,
        'password' => 'dosenpassword',
    ]);
    $storeRes->assertRedirect();

    $this->assertDatabaseHas('dosens', [
        'nama_lengkap' => 'Muhammad Syarifuddin',
        'gelar_depan' => 'Dr.',
        'program_studi_id' => $prodi->id,
        'sertifikasi_pendidik' => true,
    ]);

    $dosen = Dosen::where('nama_lengkap', 'Muhammad Syarifuddin')->first();
    $dosenUser = User::where('email', 'syarif@alyasini.ac.id')->first();
    expect($dosenUser)->not->toBeNull()
        ->and($dosenUser->hasRole('dosen'))->toBeTrue()
        ->and($dosen->user_id)->toBe($dosenUser->id);

    // 3. Add Education History (S1 & S2)
    $pen1Res = $this->actingAs($admin)->post(route('kepegawaian.dosen.pendidikan.store', $dosen), [
        'jenjang' => 'S1',
        'institusi' => 'UIN Maulana Malik Ibrahim Malang',
        'program_studi' => 'Pendidikan Agama Islam',
        'tahun_lulus' => 2012,
    ]);
    $pen1Res->assertRedirect();

    $pen2Res = $this->actingAs($admin)->post(route('kepegawaian.dosen.pendidikan.store', $dosen), [
        'jenjang' => 'S2',
        'institusi' => 'UIN Sunan Ampel Surabaya',
        'program_studi' => 'Pendidikan Islam',
        'tahun_lulus' => 2015,
    ]);
    $pen2Res->assertRedirect();

    expect($dosen->riwayatPendidikans()->count())->toBe(2);

    $pen1 = $dosen->riwayatPendidikans()->where('jenjang', 'S1')->first();
    $delPenRes = $this->actingAs($admin)->delete(route('kepegawaian.dosen.pendidikan.destroy', [$dosen, $pen1]));
    $delPenRes->assertRedirect();
    expect($dosen->riwayatPendidikans()->count())->toBe(1);

    // 4. Add Functional Rank Promotion (Kenaikan Jabatan Fungsional)
    $jabRes = $this->actingAs($admin)->post(route('kepegawaian.dosen.jabatan.store', $dosen), [
        'jabatan' => 'Lektor',
        'tmt' => '2025-01-01',
        'nomor_sk' => 'SK/012/DIKTI/2025',
    ]);
    $jabRes->assertRedirect();

    $this->assertDatabaseHas('riwayat_jabatan_fungsionals', [
        'dosen_id' => $dosen->id,
        'jabatan' => 'Lektor',
        'nomor_sk' => 'SK/012/DIKTI/2025',
    ]);

    // Verifikasi jabatan fungsional saat ini di-update secara otomatis
    expect($dosen->fresh()->jabatan_fungsional_saat_ini)->toBe('Lektor');

    // 5. Update & Delete Dosen
    $updateRes = $this->actingAs($admin)->put(route('kepegawaian.dosen.update', $dosen), [
        'nama_lengkap' => 'Muhammad Syarifuddin Al-Hajj',
        'gelar_depan' => 'Dr. H.',
        'gelar_belakang' => 'M.Pd.I',
        'nidn' => '2105088901',
        'program_studi_id' => $prodi->id,
        'status_kepegawaian' => 'tetap',
        'sertifikasi_pendidik' => true,
    ]);
    $updateRes->assertRedirect();
    expect($dosen->fresh()->nama_lengkap)->toBe('Muhammad Syarifuddin Al-Hajj');

    $delDosenRes = $this->actingAs($admin)->delete(route('kepegawaian.dosen.destroy', $dosen));
    $delDosenRes->assertRedirect();
    expect($dosen->fresh()->trashed())->toBeTrue();
});

test('Unauthorized users cannot access Kepegawaian endpoints', function () {
    $mahasiswa = User::factory()->create([
        'user_type' => 'mahasiswa',
        'two_factor_confirmed_at' => now(),
    ]);
    $mahasiswa->assignRole('mahasiswa');

    $resDosen = $this->actingAs($mahasiswa)->get(route('kepegawaian.dosen.index'));
    $resDosen->assertForbidden();

    $resPegawai = $this->actingAs($mahasiswa)->get(route('kepegawaian.pegawai.index'));
    $resPegawai->assertForbidden();

    $resUnit = $this->actingAs($mahasiswa)->get(route('kepegawaian.unit-kerja.index'));
    $resUnit->assertForbidden();

    $guestRes = $this->get(route('kepegawaian.dosen.index'));
    $guestRes->assertForbidden();
});
