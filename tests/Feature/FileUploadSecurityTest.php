<?php

use App\Models\Fakultas;
use App\Models\GelombangPendaftaran;
use App\Models\JalurPendaftaran;
use App\Models\Mahasiswa;
use App\Models\PeriodeRegistrasi;
use App\Models\ProgramStudi;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => RoleAndPermissionSeeder::class]);
});

test('public pmb registration rejects php script disguised as pdf file', function () {
    $fakultas = Fakultas::create(['kode' => 'FTIK', 'nama' => 'Tarbiyah']);
    $prodi1 = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PAI1', 'nama' => 'Pendidikan Agama Islam', 'jenjang' => 'S1']);
    $gelombang = GelombangPendaftaran::create(['nama' => 'Gelombang 1', 'mulai_pendaftaran' => '2026-01-01', 'selesai_pendaftaran' => '2026-08-30', 'kuota' => 100, 'is_active' => true]);
    $jalur = JalurPendaftaran::create(['nama' => 'Reguler', 'is_active' => true]);

    $maliciousContent = base64_decode('PD9waHAgZWNobyAibWFsaWNpb3VzX3BheWxvYWRfZXhlY3V0aW9uIjsgPz4=');
    $maliciousFile = UploadedFile::fake()->createWithContent('shell.pdf', $maliciousContent);

    $response = $this->post('/pmb/daftar', [
        'gelombang_pendaftaran_id' => $gelombang->id,
        'jalur_pendaftaran_id' => $jalur->id,
        'program_studi_pilihan_1_id' => $prodi1->id,
        'nama_lengkap' => 'Attacker PMB',
        'nik' => '3515000000009999',
        'tempat_lahir' => 'Pasuruan',
        'tanggal_lahir' => '2000-01-01',
        'jenis_kelamin' => 'L',
        'alamat' => 'Jl. Fake 123',
        'no_hp' => '081234567890',
        'email' => 'attacker_pmb@example.com',
        'asal_sekolah' => 'SMA Fake',
        'tahun_lulus_sekolah' => 2024,
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'berkas_ijazah' => $maliciousFile,
    ]);

    $response->assertSessionHasErrors(['berkas_ijazah']);
});

test('student payment submission rejects php script disguised as pdf file', function () {
    $fakultas = Fakultas::create(['kode' => 'FTIK', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PAI2', 'nama' => 'Pendidikan Agama Islam', 'jenjang' => 'S1']);
    $tahun = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-08-01', 'selesai' => '2027-01-31', 'is_active' => true]);

    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $userMhs->assignRole('mahasiswa');
    $mhs = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026PAY01', 'nama_lengkap' => 'Attacker Mhs', 'tahun_masuk' => 2026]);

    $tagihan = Tagihan::create(['mahasiswa_id' => $mhs->id, 'tahun_ajaran_id' => $tahun->id, 'jenis' => 'ukt', 'nominal' => 3000000, 'status' => 'belum_bayar', 'jatuh_tempo' => '2026-08-30']);

    $maliciousContent = base64_decode('PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXZs7ID8+');
    $maliciousFile = UploadedFile::fake()->createWithContent('bukti.pdf', $maliciousContent);

    $response = $this->actingAs($userMhs)->post('/keuangan/bayar', [
        'tagihan_id' => $tagihan->id,
        'tanggal_bayar' => '2026-08-07',
        'nominal_dibayar' => 3000000,
        'bukti_file' => $maliciousFile,
    ]);

    $response->assertSessionHasErrors(['bukti_file']);
});

test('registrasi ulang submission rejects php script disguised as pdf file', function () {
    $fakultas = Fakultas::create(['kode' => 'FTIK', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PAI3', 'nama' => 'Pendidikan Agama Islam', 'jenjang' => 'S1']);
    $tahun = TahunAjaran::create(['nama' => '2026/2027 Genap', 'mulai' => '2027-02-01', 'selesai' => '2027-07-31', 'is_active' => true]);

    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $userMhs->assignRole('mahasiswa');
    $mhs = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026REG01', 'nama_lengkap' => 'Attacker Reg', 'tahun_masuk' => 2026]);

    $periode = PeriodeRegistrasi::create(['tahun_ajaran_id' => $tahun->id, 'jenis' => 'mahasiswa_lama', 'mulai' => '2026-08-01', 'selesai' => '2026-08-30']);

    $maliciousContent = base64_decode('PD9waHAgcGFzc3RocnUoIndob2FtaSIpOyA/Pg==');
    $maliciousFile = UploadedFile::fake()->createWithContent('ijazah.pdf', $maliciousContent);

    $response = $this->actingAs($userMhs)->post('/registrasi-ulang/saya', [
        'periode_registrasi_id' => $periode->id,
        'berkas_ijazah' => $maliciousFile,
    ]);

    $response->assertSessionHasErrors(['registrasi']);
});
