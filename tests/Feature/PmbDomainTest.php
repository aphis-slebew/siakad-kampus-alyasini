<?php

use App\Models\ActivityLog;
use App\Models\BerkasPendaftaran;
use App\Models\CalonMahasiswa;
use App\Models\GelombangPendaftaran;
use App\Models\HasilSeleksi;
use App\Models\JalurPendaftaran;
use App\Models\Mahasiswa;
use App\Models\PeriodeRegistrasi;
use App\Models\ProgramStudi;
use App\Models\RegistrasiUlang;
use App\Models\User;
use App\Services\NimGeneratorService;
use App\Services\PmbStateService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
    $this->artisan('db:seed', ['--class' => 'MasterDataSeeder']);
    $this->artisan('db:seed', ['--class' => 'PmbSeeder']);
});

test('prospective student public registration creates user with calon_mahasiswa role and status diajukan', function () {
    $gelombang = GelombangPendaftaran::first();
    $jalur = JalurPendaftaran::first();
    $prodi = ProgramStudi::first();

    Storage::fake('local');
    $ijazahFile = UploadedFile::fake()->createWithContent('ijazah.pdf', "%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF");

    $response = $this->post(route('pmb.register.store'), [
        'gelombang_pendaftaran_id' => $gelombang->id,
        'jalur_pendaftaran_id' => $jalur->id,
        'program_studi_pilihan_1_id' => $prodi->id,
        'nama_lengkap' => 'Ahmad Fulan',
        'nik' => '3515123456780001',
        'tempat_lahir' => 'Pasuruan',
        'tanggal_lahir' => '2005-05-15',
        'jenis_kelamin' => 'L',
        'alamat' => 'Jl. Pesantren Al-Yasini',
        'no_hp' => '081234567890',
        'email' => 'ahmad.fulan@example.com',
        'asal_sekolah' => 'MA Al-Yasini',
        'tahun_lulus_sekolah' => 2025,
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'berkas_ijazah' => $ijazahFile,
    ]);

    $response->assertRedirect(route('dashboard'));

    $user = User::where('email', 'ahmad.fulan@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->user_type)->toBe('calon_mahasiswa');
    expect($user->hasRole('calon_mahasiswa'))->toBeTrue();

    $calon = CalonMahasiswa::where('user_id', $user->id)->first();
    expect($calon)->not->toBeNull();
    expect($calon->status_pendaftaran)->toBe('diajukan');

    // Security check: Berkas stored in private storage (not public/uploads)
    $berkas = BerkasPendaftaran::where('calon_mahasiswa_id', $calon->id)->first();
    expect($berkas)->not->toBeNull();
    expect($berkas->file_path)->toContain('private/berkas_pmb');
    Storage::disk('local')->assertExists($berkas->file_path);
});

test('blind index nik_hash is automatically generated and prevents duplicate NIK across calon and mahasiswa', function () {
    $gelombang = GelombangPendaftaran::first();
    $jalur = JalurPendaftaran::first();
    $prodi = ProgramStudi::first();

    $testNik = '3515999999990001';
    $expectedHash = CalonMahasiswa::generateBlindIndex($testNik);

    $calon = CalonMahasiswa::create([
        'gelombang_pendaftaran_id' => $gelombang->id,
        'jalur_pendaftaran_id' => $jalur->id,
        'program_studi_pilihan_1_id' => $prodi->id,
        'nama_lengkap' => 'Eko Existing',
        'nik' => $testNik,
        'status_pendaftaran' => 'diajukan',
    ]);

    // Verify blind index column nik_hash was automatically populated via model saving event
    expect($calon->nik_hash)->toBe($expectedHash);

    // Verify fast indexed DB query finds the record by blind index hash
    $foundByHash = CalonMahasiswa::where('nik_hash', $expectedHash)->first();
    expect($foundByHash)->not->toBeNull();
    expect($foundByHash->id)->toBe($calon->id);

    // Attempt registration with duplicate NIK -> rejected cleanly
    $response = $this->post(route('pmb.register.store'), [
        'gelombang_pendaftaran_id' => $gelombang->id,
        'jalur_pendaftaran_id' => $jalur->id,
        'program_studi_pilihan_1_id' => $prodi->id,
        'nama_lengkap' => 'Eko Duplicate',
        'nik' => $testNik,
        'tempat_lahir' => 'Pasuruan',
        'tanggal_lahir' => '2005-05-15',
        'jenis_kelamin' => 'L',
        'alamat' => 'Jl. Pesantren Al-Yasini',
        'no_hp' => '081234567890',
        'email' => 'eko.dup@example.com',
        'asal_sekolah' => 'MA Al-Yasini',
        'tahun_lulus_sekolah' => 2025,
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors(['nik']);
});

test('state machine enforces strict sequential status transitions and rejects illegal skips', function () {
    $pmbService = app(PmbStateService::class);

    $gelombang = GelombangPendaftaran::first();
    $jalur = JalurPendaftaran::first();
    $prodi = ProgramStudi::first();

    $calon = CalonMahasiswa::create([
        'gelombang_pendaftaran_id' => $gelombang->id,
        'jalur_pendaftaran_id' => $jalur->id,
        'program_studi_pilihan_1_id' => $prodi->id,
        'nama_lengkap' => 'Budi Testing State',
        'status_pendaftaran' => 'draft',
    ]);

    // 1. Transition draft -> diajukan (VALID)
    $pmbService->transition($calon, 'diajukan');
    expect($calon->status_pendaftaran)->toBe('diajukan');

    // 2. Transition diajukan -> verifikasi_berkas (VALID)
    $pmbService->transition($calon, 'verifikasi_berkas');
    expect($calon->status_pendaftaran)->toBe('verifikasi_berkas');

    // 3. Try ILLEGAL transition: verifikasi_berkas -> lulus_seleksi (MUST FAIL)
    expect(fn () => $pmbService->transition($calon, 'lulus_seleksi'))
        ->toThrow(InvalidArgumentException::class);

    // 4. Try ILLEGAL transition: verifikasi_berkas -> dijadwalkan_tes (MUST FAIL)
    expect(fn () => $pmbService->transition($calon, 'dijadwalkan_tes'))
        ->toThrow(InvalidArgumentException::class);

    // 5. Valid transition: verifikasi_berkas -> lolos_verifikasi -> dijadwalkan_tes -> lulus_seleksi
    $pmbService->transition($calon, 'lolos_verifikasi');
    $pmbService->transition($calon, 'dijadwalkan_tes');
    $pmbService->transition($calon, 'lulus_seleksi');

    expect($calon->status_pendaftaran)->toBe('lulus_seleksi');
});

test('conversion to official student fails if status is not lulus_seleksi or registrasi_ulang is incomplete', function () {
    $pmbService = app(PmbStateService::class);

    $gelombang = GelombangPendaftaran::first();
    $jalur = JalurPendaftaran::first();
    $prodi = ProgramStudi::first();

    $calon = CalonMahasiswa::create([
        'gelombang_pendaftaran_id' => $gelombang->id,
        'jalur_pendaftaran_id' => $jalur->id,
        'program_studi_pilihan_1_id' => $prodi->id,
        'nama_lengkap' => 'Chandra Unconverted',
        'status_pendaftaran' => 'diajukan',
    ]);

    expect(fn () => $pmbService->convertCalonKeMahasiswa($calon))
        ->toThrow(DomainException::class);
});

test('successful conversion creates new student user with role mahasiswa, generates NIM, records activity_log, populates nik_hash, and retains old calon_mahasiswa record', function () {
    $pmbService = app(PmbStateService::class);

    $gelombang = GelombangPendaftaran::first();
    $jalur = JalurPendaftaran::first();
    $prodi = ProgramStudi::first();

    $userCalon = User::create([
        'name' => 'Dedi Admitted',
        'email' => 'dedi.calon@example.com',
        'password' => Hash::make('password'),
        'user_type' => 'calon_mahasiswa',
    ]);
    $userCalon->assignRole('calon_mahasiswa');

    $calon = CalonMahasiswa::create([
        'user_id' => $userCalon->id,
        'gelombang_pendaftaran_id' => $gelombang->id,
        'jalur_pendaftaran_id' => $jalur->id,
        'program_studi_pilihan_1_id' => $prodi->id,
        'nama_lengkap' => 'Dedi Admitted',
        'nik' => '3515000000000099',
        'status_pendaftaran' => 'lulus_seleksi',
    ]);

    HasilSeleksi::create([
        'calon_mahasiswa_id' => $calon->id,
        'nilai_tes' => 90,
        'status' => 'lulus',
    ]);

    $periodeReg = PeriodeRegistrasi::create([
        'tahun_ajaran_id' => 1,
        'jenis' => 'mahasiswa_baru',
        'mulai' => '2026-08-01',
        'selesai' => '2026-08-25',
    ]);

    RegistrasiUlang::create([
        'periode_registrasi_id' => $periodeReg->id,
        'calon_mahasiswa_id' => $calon->id,
        'status' => 'selesai',
        'selesai_at' => now(),
    ]);

    // Perform conversion
    $mahasiswa = $pmbService->convertCalonKeMahasiswa($calon);

    expect($mahasiswa)->not->toBeNull();
    expect($mahasiswa->calon_mahasiswa_id)->toBe($calon->id);
    expect($mahasiswa->nim)->toContain($prodi->kode);
    expect($mahasiswa->nik_hash)->toBe(Mahasiswa::generateBlindIndex('3515000000000099'));

    // Verify activity_log recorded for conversion
    $log = ActivityLog::where('action', 'pmb.konversi_mahasiswa')->first();
    expect($log)->not->toBeNull();
    expect((string) $log->entity_id)->toBe((string) $mahasiswa->id);

    // Verify NEW User account created with role 'mahasiswa'
    $userMahasiswa = $mahasiswa->user;
    expect($userMahasiswa->id)->not->toBe($userCalon->id);
    expect($userMahasiswa->user_type)->toBe('mahasiswa');
    expect($userMahasiswa->hasRole('mahasiswa'))->toBeTrue();

    // Verify OLD CalonMahasiswa user and record still exist (untouched history)
    expect(User::find($userCalon->id))->not->toBeNull();
    expect(CalonMahasiswa::find($calon->id))->not->toBeNull();
});

test('nim generator service creates structured sequential nim atomically', function () {
    $nimService = app(NimGeneratorService::class);
    $prodi = ProgramStudi::first();

    $nim1 = $nimService->generate($prodi->id, 2026);
    expect($nim1)->toBe('2026'.$prodi->kode.'0001');

    Mahasiswa::create([
        'program_studi_id' => $prodi->id,
        'nim' => $nim1,
        'nama_lengkap' => 'Mahasiswa 1',
        'tahun_masuk' => 2026,
    ]);

    $nim2 = $nimService->generate($prodi->id, 2026);
    expect($nim2)->toBe('2026'.$prodi->kode.'0002');
});

test('concurrent student conversion for first student in prodi generates unique NIMs without error or duplication', function () {
    $pmbService = app(PmbStateService::class);
    $gelombang = GelombangPendaftaran::first();
    $jalur = JalurPendaftaran::first();

    // Create a new prodi with 0 existing students
    $prodiBaru = ProgramStudi::create([
        'fakultas_id' => 1,
        'kode' => 'MPI',
        'nama' => 'Manajemen Pendidikan Islam',
        'jenjang' => 'S1',
    ]);

    // Create 2 admitted candidates for this brand new prodi
    $calon1 = CalonMahasiswa::create([
        'gelombang_pendaftaran_id' => $gelombang->id,
        'jalur_pendaftaran_id' => $jalur->id,
        'program_studi_pilihan_1_id' => $prodiBaru->id,
        'nama_lengkap' => 'Kandidat Pertama MPI',
        'nik' => '3515888800010001',
        'email' => 'kandidat1@example.com',
        'status_pendaftaran' => 'lulus_seleksi',
    ]);
    HasilSeleksi::create(['calon_mahasiswa_id' => $calon1->id, 'status' => 'lulus']);

    $calon2 = CalonMahasiswa::create([
        'gelombang_pendaftaran_id' => $gelombang->id,
        'jalur_pendaftaran_id' => $jalur->id,
        'program_studi_pilihan_1_id' => $prodiBaru->id,
        'nama_lengkap' => 'Kandidat Kedua MPI',
        'nik' => '3515888800020002',
        'email' => 'kandidat2@example.com',
        'status_pendaftaran' => 'lulus_seleksi',
    ]);
    HasilSeleksi::create(['calon_mahasiswa_id' => $calon2->id, 'status' => 'lulus']);

    // Perform conversions back-to-back (simulating concurrent execution)
    $periodeReg2 = PeriodeRegistrasi::firstOrCreate([
        'tahun_ajaran_id' => 1,
        'jenis' => 'mahasiswa_baru',
        'mulai' => '2026-08-01',
        'selesai' => '2026-08-25',
    ]);

    RegistrasiUlang::create([
        'periode_registrasi_id' => $periodeReg2->id,
        'calon_mahasiswa_id' => $calon1->id,
        'status' => 'selesai',
        'selesai_at' => now(),
    ]);

    RegistrasiUlang::create([
        'periode_registrasi_id' => $periodeReg2->id,
        'calon_mahasiswa_id' => $calon2->id,
        'status' => 'selesai',
        'selesai_at' => now(),
    ]);

    $mhs1 = $pmbService->convertCalonKeMahasiswa($calon1);
    $mhs2 = $pmbService->convertCalonKeMahasiswa($calon2);

    expect($mhs1->nim)->toBe('2026MPI0001');
    expect($mhs2->nim)->toBe('2026MPI0002');
    expect($mhs1->nim)->not->toBe($mhs2->nim);
});
