<?php

use App\Models\BeasiswaMahasiswa;
use App\Models\Dosen;
use App\Models\DosenWali;
use App\Models\Fakultas;
use App\Models\KomponenBiaya;
use App\Models\Mahasiswa;
use App\Models\ProgramStudi;
use App\Models\ReferensiBiodata;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use App\Models\User;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
});

test('staf_keuangan can manage komponen tarif biaya', function () {
    $keuangan = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $keuangan->assignRole('staf_keuangan');

    $this->actingAs($keuangan)
        ->get(route('keuangan.komponen-biaya.index'))
        ->assertOk();

    $this->actingAs($keuangan)
        ->post(route('keuangan.komponen-biaya.store'), [
            'kode' => 'KKN-2026',
            'nama' => 'Biaya Kuliah Kerja Nyata 2026',
            'kategori' => 'kegiatan',
            'nominal' => 750000,
            'is_active' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('komponen_biayas', [
        'kode' => 'KKN-2026',
        'nominal' => 750000,
    ]);
});

test('kasir POS can process direct payments at TU counter', function () {
    $keuangan = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $keuangan->assignRole('staf_keuangan');

    $ta = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-09-01', 'selesai' => '2027-01-31', 'is_active' => true]);
    $fakultas = Fakultas::create(['kode' => 'FTK', 'nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => '86231', 'nama' => 'MPI', 'jenjang' => 'S1']);
    $userMhs = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $userMhs->assignRole('mahasiswa');
    $mhs = Mahasiswa::create([
        'user_id' => $userMhs->id,
        'program_studi_id' => $prodi->id,
        'nim' => '2026001001',
        'nama_lengkap' => 'Mahasiswa Test Kasir',
        'tahun_masuk' => 2026,
        'status_mahasiswa' => 'aktif',
    ]);

    $tagihan = Tagihan::create([
        'mahasiswa_id' => $mhs->id,
        'tahun_ajaran_id' => $ta->id,
        'jenis' => 'ukt',
        'nominal' => 1500000,
        'jatuh_tempo' => '2026-10-01',
        'status' => 'belum_lunas',
    ]);

    $this->actingAs($keuangan)
        ->get(route('keuangan.kasir.index', ['nim' => '2026001001']))
        ->assertOk();

    $this->actingAs($keuangan)
        ->post(route('keuangan.kasir.bayar'), [
            'tagihan_id' => $tagihan->id,
            'nominal_bayar' => 1500000,
            'metode_pembayaran' => 'tunai',
            'catatan' => 'Lunas bayar di TU',
        ])
        ->assertRedirect();

    $tagihan->refresh();
    expect($tagihan->status)->toBe('lunas');
    $this->assertDatabaseHas('pembayarans', [
        'tagihan_id' => $tagihan->id,
        'nominal_dibayar' => 1500000,
        'metode' => 'tunai',
        'status_verifikasi' => 'diverifikasi',
    ]);
});

test('kasir bulk bill generator creates invoices and waives active scholarship students', function () {
    $keuangan = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $keuangan->assignRole('staf_keuangan');

    $ta = TahunAjaran::create(['nama' => '2026/2027 Genap', 'mulai' => '2027-02-01', 'selesai' => '2027-06-30', 'is_active' => true]);
    $fakultas = Fakultas::create(['kode' => 'FEBI', 'nama' => 'Fakultas Ekonomi']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => '86232', 'nama' => 'ES', 'jenjang' => 'S1']);

    $userReguler = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $mhsReguler = Mahasiswa::create([
        'user_id' => $userReguler->id,
        'program_studi_id' => $prodi->id,
        'nim' => '2026002001',
        'nama_lengkap' => 'Mahasiswa Reguler',
        'tahun_masuk' => 2026,
        'status_mahasiswa' => 'aktif',
    ]);

    $userBeasiswa = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $mhsBeasiswa = Mahasiswa::create([
        'user_id' => $userBeasiswa->id,
        'program_studi_id' => $prodi->id,
        'nim' => '2026002002',
        'nama_lengkap' => 'Mahasiswa Penerima Beasiswa',
        'tahun_masuk' => 2026,
        'status_mahasiswa' => 'aktif',
    ]);

    $jenisBeasiswa = ReferensiBiodata::create(['tipe' => 'jenis_beasiswa', 'nama' => 'Beasiswa Tahfidz Al-Quran']);
    BeasiswaMahasiswa::create([
        'mahasiswa_id' => $mhsBeasiswa->id,
        'jenis_beasiswa_id' => $jenisBeasiswa->id,
        'status' => 'aktif',
    ]);

    $komponen = KomponenBiaya::create([
        'kode' => 'SPP-SEM2',
        'nama' => 'SPP Semester 2',
        'kategori' => 'akademik',
        'nominal' => 2000000,
        'is_active' => true,
    ]);

    $this->actingAs($keuangan)
        ->post(route('keuangan.kasir.generate-massal'), [
            'tahun_ajaran_id' => $ta->id,
            'komponen_biaya_id' => $komponen->id,
            'program_studi_id' => 'all',
            'angkatan' => 2026,
            'jatuh_tempo' => '2027-03-01',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('tagihans', [
        'mahasiswa_id' => $mhsReguler->id,
        'tahun_ajaran_id' => $ta->id,
        'nominal' => 2000000,
        'status' => 'belum_lunas',
    ]);

    $this->assertDatabaseHas('tagihans', [
        'mahasiswa_id' => $mhsBeasiswa->id,
        'tahun_ajaran_id' => $ta->id,
        'nominal' => 0,
        'status' => 'lunas',
    ]);
});

test('admin_akademik can rollover dosen wali assignments from previous semester', function () {
    $admin = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $admin->assignRole('admin_akademik');

    $ta1 = TahunAjaran::create(['nama' => '2025/2026 Genap', 'mulai' => '2026-02-01', 'selesai' => '2026-06-30', 'is_active' => false]);
    $ta2 = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-09-01', 'selesai' => '2027-01-31', 'is_active' => true]);

    $fakultas = Fakultas::create(['kode' => 'FTK', 'nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => '86231', 'nama' => 'MPI', 'jenjang' => 'S1']);
    $userDosen = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $dosen = Dosen::create([
        'user_id' => $userDosen->id,
        'program_studi_id' => $prodi->id,
        'nidn' => '2108098201',
        'nama_lengkap' => 'Dr. Dosen Wali',
    ]);

    $userMhs = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $mhs = Mahasiswa::create([
        'user_id' => $userMhs->id,
        'program_studi_id' => $prodi->id,
        'nim' => '2026001099',
        'nama_lengkap' => 'Mahasiswa Bimbingan',
        'tahun_masuk' => 2026,
        'status_mahasiswa' => 'aktif',
    ]);

    DosenWali::create([
        'dosen_id' => $dosen->id,
        'mahasiswa_id' => $mhs->id,
        'tahun_ajaran_id' => $ta1->id,
    ]);

    $this->actingAs($admin)
        ->post(route('akademik.dosen-wali.rollover'), [
            'from_tahun_ajaran_id' => $ta1->id,
            'to_tahun_ajaran_id' => $ta2->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('dosen_walis', [
        'dosen_id' => $dosen->id,
        'mahasiswa_id' => $mhs->id,
        'tahun_ajaran_id' => $ta2->id,
    ]);
});
