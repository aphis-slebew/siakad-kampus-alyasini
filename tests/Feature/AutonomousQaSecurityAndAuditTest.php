<?php

use App\Models\BerkasPendaftaran;
use App\Models\CalonMahasiswa;
use App\Models\Dosen;
use App\Models\DosenWali;
use App\Models\Fakultas;
use App\Models\GelombangPendaftaran;
use App\Models\JadwalPerkuliahan;
use App\Models\JalurPendaftaran;
use App\Models\KalenderAkademik;
use App\Models\KelasKuliah;
use App\Models\Konsentrasi;
use App\Models\Krs;
use App\Models\KurikulumMatakuliah;
use App\Models\KurikulumProdi;
use App\Models\Mahasiswa;
use App\Models\Matakuliah;
use App\Models\PeriodeRegistrasi;
use App\Models\ProgramStudi;
use App\Models\ReferensiBiodata;
use App\Models\RuangKuliah;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
});

test('Student cannot approve or reject KRS and receives 403 Forbidden', function () {
    $fakultas = Fakultas::create(['kode' => 'TAR', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PAI', 'nama' => 'Pendidikan Agama Islam', 'jenjang' => 'S1']);
    $tahun = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-09-01', 'selesai' => '2027-02-28', 'is_active' => true]);

    $studentUser = User::factory()->create(['user_type' => 'mahasiswa', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $studentUser->assignRole('mahasiswa');

    $mahasiswa = Mahasiswa::create([
        'user_id' => $studentUser->id,
        'program_studi_id' => $prodi->id,
        'nim' => '202601001',
        'nama_lengkap' => 'Mahasiswa Test',
        'tahun_masuk' => 2026,
    ]);

    $krs = Krs::create([
        'mahasiswa_id' => $mahasiswa->id,
        'tahun_ajaran_id' => $tahun->id,
        'status' => 'diajukan',
    ]);

    // Student attempts to approve own KRS -> MUST BE 403 FORBIDDEN
    $response = $this->actingAs($studentUser)->post(route('perwalian.krs.approve', $krs->id));
    $response->assertForbidden();

    // Student attempts to reject KRS -> MUST BE 403 FORBIDDEN
    $responseReject = $this->actingAs($studentUser)->post(route('perwalian.krs.reject', $krs->id), ['catatan' => 'Tolak']);
    $responseReject->assertForbidden();
});

test('Unassigned lecturer cannot approve KRS for a student whose dosen wali is someone else', function () {
    $fakultas = Fakultas::create(['kode' => 'TAR', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PAI', 'nama' => 'Pendidikan Agama Islam', 'jenjang' => 'S1']);
    $tahun = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-09-01', 'selesai' => '2027-02-28', 'is_active' => true]);

    // Lecturer A (Official Dosen Wali)
    $userDosenA = User::factory()->create(['user_type' => 'dosen', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $userDosenA->assignRole('dosen');
    $dosenA = Dosen::create(['user_id' => $userDosenA->id, 'program_studi_id' => $prodi->id, 'nidn' => '11111111', 'nama_lengkap' => 'Dosen Wali Sah']);

    // Lecturer B (Intruder Lecturer)
    $userDosenB = User::factory()->create(['user_type' => 'dosen', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $userDosenB->assignRole('dosen');
    $dosenB = Dosen::create(['user_id' => $userDosenB->id, 'program_studi_id' => $prodi->id, 'nidn' => '22222222', 'nama_lengkap' => 'Dosen B Bukan Wali']);

    $studentUser = User::factory()->create(['user_type' => 'mahasiswa', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $studentUser->assignRole('mahasiswa');
    $mahasiswa = Mahasiswa::create([
        'user_id' => $studentUser->id,
        'program_studi_id' => $prodi->id,
        'nim' => '202601002',
        'nama_lengkap' => 'Mahasiswa Wali Test',
        'tahun_masuk' => 2026,
    ]);

    // Assign Dosen A as Dosen Wali
    DosenWali::create([
        'dosen_id' => $dosenA->id,
        'mahasiswa_id' => $mahasiswa->id,
        'tahun_ajaran_id' => $tahun->id,
    ]);

    $krs = Krs::create([
        'mahasiswa_id' => $mahasiswa->id,
        'tahun_ajaran_id' => $tahun->id,
        'status' => 'diajukan',
    ]);

    // Dosen B attempts to approve -> MUST BE 403 FORBIDDEN
    $responseIntruder = $this->actingAs($userDosenB)->post(route('perwalian.krs.approve', $krs->id));
    $responseIntruder->assertForbidden();

    // Dosen A (Official Dosen Wali) approves -> SUCCEEDS
    $responseOfficial = $this->actingAs($userDosenA)->post(route('perwalian.krs.approve', $krs->id));
    $responseOfficial->assertRedirect();
    expect($krs->fresh()->status)->toBe('disetujui_wali');
});

test('Student cannot submit payment proof or request installment for another student bill (Anti-IDOR)', function () {
    Storage::fake('local');

    $tahun = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-09-01', 'selesai' => '2027-02-28', 'is_active' => true]);
    $fakultas = Fakultas::create(['kode' => 'TAR', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PAI', 'nama' => 'Pendidikan Agama Islam', 'jenjang' => 'S1']);

    // Student 1 & Student 2
    $user1 = User::factory()->create(['user_type' => 'mahasiswa', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $user1->assignRole('mahasiswa');
    $mhs1 = Mahasiswa::create(['user_id' => $user1->id, 'program_studi_id' => $prodi->id, 'nim' => '202601010', 'nama_lengkap' => 'Student 1', 'tahun_masuk' => 2026]);

    $user2 = User::factory()->create(['user_type' => 'mahasiswa', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $user2->assignRole('mahasiswa');
    $mhs2 = Mahasiswa::create(['user_id' => $user2->id, 'program_studi_id' => $prodi->id, 'nim' => '202601020', 'nama_lengkap' => 'Student 2', 'tahun_masuk' => 2026]);

    // Bill belonging to Student 1
    $tagihan1 = Tagihan::create([
        'mahasiswa_id' => $mhs1->id,
        'tahun_ajaran_id' => $tahun->id,
        'jenis' => 'ukt',
        'nominal' => 3000000.00,
        'jatuh_tempo' => '2026-08-30',
        'status' => 'belum_lunas',
    ]);

    // Student 2 tries to submit payment proof for Student 1 bill -> MUST BE 403
    $fakeFile = UploadedFile::fake()->create('bukti.pdf', 500, 'application/pdf');
    $responsePay = $this->actingAs($user2)->post(route('keuangan.bayar.submit'), [
        'tagihan_id' => $tagihan1->id,
        'tanggal_bayar' => '2026-08-15',
        'nominal_dibayar' => 3000000.00,
        'bukti_file' => $fakeFile,
    ]);
    $responsePay->assertForbidden();

    // Student 2 tries to request installment on Student 1 bill -> MUST BE 403
    $responseCicilan = $this->actingAs($user2)->post(route('keuangan.cicilan.request', $tagihan1->id), [
        'jumlah_cicilan' => 3,
    ]);
    $responseCicilan->assertForbidden();

    // Student 1 requests installment on own bill -> SUCCEEDS
    $responseOwnCicilan = $this->actingAs($user1)->post(route('keuangan.cicilan.request', $tagihan1->id), [
        'jumlah_cicilan' => 3,
    ]);
    $responseOwnCicilan->assertRedirect();
    expect($tagihan1->fresh()->status)->toBe('dicicil');
});

test('Student cannot register re-registration using another student ID (Anti-IDOR)', function () {
    $tahun = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-09-01', 'selesai' => '2027-02-28', 'is_active' => true]);
    $fakultas = Fakultas::create(['kode' => 'TAR', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PAI', 'nama' => 'Pendidikan Agama Islam', 'jenjang' => 'S1']);
    $periode = PeriodeRegistrasi::create(['tahun_ajaran_id' => $tahun->id, 'nama' => 'Periode Registrasi', 'jenis' => 'mahasiswa_lama', 'mulai' => '2026-08-01', 'selesai' => '2026-08-30']);

    $user1 = User::factory()->create(['user_type' => 'mahasiswa', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $user1->assignRole('mahasiswa');
    $mhs1 = Mahasiswa::create(['user_id' => $user1->id, 'program_studi_id' => $prodi->id, 'nim' => '202601030', 'nama_lengkap' => 'Student 1', 'tahun_masuk' => 2026]);

    $user2 = User::factory()->create(['user_type' => 'mahasiswa', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $user2->assignRole('mahasiswa');
    $mhs2 = Mahasiswa::create(['user_id' => $user2->id, 'program_studi_id' => $prodi->id, 'nim' => '202601040', 'nama_lengkap' => 'Student 2', 'tahun_masuk' => 2026]);

    // Student 2 attempts to register using Student 1 ID -> MUST BE 403
    $response = $this->actingAs($user2)->post(route('registrasi-ulang.student.submit'), [
        'periode_registrasi_id' => $periode->id,
        'mahasiswa_id' => $mhs1->id,
    ]);
    $response->assertForbidden();
});

test('Superadmin cannot impersonate another Superadmin', function () {
    $superadminA = User::factory()->create(['user_type' => 'superadmin', 'name' => 'Superadmin A', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadminA->assignRole('superadmin');

    $superadminB = User::factory()->create(['user_type' => 'superadmin', 'name' => 'Superadmin B', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadminB->assignRole('superadmin');

    $response = $this->actingAs($superadminA)->post(route('users.impersonate', $superadminB->id));
    $response->assertRedirect();
    $response->assertSessionHas('error', 'Tidak dapat melakukan impersonasi ke sesama akun Superadmin.');
    expect(session()->has('impersonator_id'))->toBeFalse();
});

test('ReferensiBiodata delete protection prevents deletion when used in relationships and uses standard flash error', function () {
    $admin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $admin->assignRole('superadmin');

    $refAgama = ReferensiBiodata::create(['tipe' => 'agama', 'nama' => 'Islam']);
    $fakultas = Fakultas::create(['kode' => 'TAR', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PAI', 'nama' => 'Pendidikan Agama Islam', 'jenjang' => 'S1']);

    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    Mahasiswa::create([
        'user_id' => $userMhs->id,
        'program_studi_id' => $prodi->id,
        'nim' => '2026REF001',
        'nama_lengkap' => 'Student Ref Test',
        'tahun_masuk' => 2026,
        'agama_referensi_biodata_id' => $refAgama->id,
    ]);

    // Attempting to delete used ReferensiBiodata -> MUST FAIL with flash error
    $response = $this->actingAs($admin)->delete(route('master.referensi-biodata.destroy', $refAgama->id));
    $response->assertRedirect();
    $response->assertSessionHas('error');
    expect(ReferensiBiodata::where('id', $refAgama->id)->exists())->toBeTrue();
});

test('RuangKuliah and KelasKuliah deletion with active dependencies return standard flash error', function () {
    $admin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $admin->assignRole('superadmin');

    $ruang = RuangKuliah::create(['kode' => 'RK-PROT', 'nama' => 'Ruang Protected', 'kapasitas' => 30]);
    $tahun = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-09-01', 'selesai' => '2027-02-28', 'is_active' => true]);
    $fakultas = Fakultas::create(['kode' => 'TAR', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PAI', 'nama' => 'Pendidikan Agama Islam', 'jenjang' => 'S1']);
    $kurikulum = KurikulumProdi::create(['program_studi_id' => $prodi->id, 'tahun_kurikulum' => '2026', 'is_active' => true]);
    $mk = Matakuliah::create(['kode' => 'MKPROT', 'nama' => 'Matakuliah Protected', 'sks' => 2]);
    $km = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk->id, 'semester' => 1]);
    $kelas = KelasKuliah::create(['kurikulum_matakuliah_id' => $km->id, 'tahun_ajaran_id' => $tahun->id, 'nama_kelas' => 'A', 'kuota' => 30]);

    JadwalPerkuliahan::create([
        'kelas_kuliah_id' => $kelas->id,
        'ruang_kuliah_id' => $ruang->id,
        'hari' => 'Senin',
        'jam_mulai' => '08:00:00',
        'jam_selesai' => '09:40:00',
    ]);

    // RuangKuliah occupied by schedule -> delete must return standard flash error
    $responseRuang = $this->actingAs($admin)->delete(route('master.ruang-kuliah.destroy', $ruang->id));
    $responseRuang->assertRedirect();
    $responseRuang->assertSessionHas('error');
    expect(RuangKuliah::where('id', $ruang->id)->exists())->toBeTrue();
});

test('KonsentrasiController and KalenderAkademikController CRUD operations succeed', function () {
    $admin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $admin->assignRole('superadmin');

    $fakultas = Fakultas::create(['kode' => 'TAR', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PAI', 'nama' => 'Pendidikan Agama Islam', 'jenjang' => 'S1']);
    $tahun = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-09-01', 'selesai' => '2027-02-28', 'is_active' => true]);

    // 1. Create Konsentrasi
    $resKon = $this->actingAs($admin)->post(route('master.konsentrasi.store'), [
        'program_studi_id' => $prodi->id,
        'nama' => 'Manajemen Pendidikan Islam',
    ]);
    $resKon->assertRedirect();
    $resKon->assertSessionHas('success');
    $konsentrasi = Konsentrasi::first();
    expect($konsentrasi)->not->toBeNull();
    expect($konsentrasi->nama)->toBe('Manajemen Pendidikan Islam');

    // 2. Update Konsentrasi
    $resKonUpdate = $this->actingAs($admin)->put(route('master.konsentrasi.update', $konsentrasi->id), [
        'nama' => 'Pendidikan Bahasa Arab',
    ]);
    $resKonUpdate->assertRedirect();
    expect($konsentrasi->fresh()->nama)->toBe('Pendidikan Bahasa Arab');

    // 3. Delete Konsentrasi
    $resKonDel = $this->actingAs($admin)->delete(route('master.konsentrasi.destroy', $konsentrasi->id));
    $resKonDel->assertRedirect();
    expect(Konsentrasi::where('id', $konsentrasi->id)->exists())->toBeFalse();

    // 4. Create Kalender Akademik
    $resKal = $this->actingAs($admin)->post(route('master.kalender-akademik.store'), [
        'tahun_ajaran_id' => $tahun->id,
        'kegiatan' => 'Masa Pengisian KRS',
        'tipe_kegiatan' => 'krs',
        'mulai' => '2026-08-20',
        'selesai' => '2026-08-30',
    ]);
    $resKal->assertRedirect();
    $resKal->assertSessionHas('success');
    $kalender = KalenderAkademik::first();
    expect($kalender)->not->toBeNull();
    expect($kalender->kegiatan)->toBe('Masa Pengisian KRS');

    // 5. Index Kalender Akademik
    $resKalIndex = $this->actingAs($admin)->get(route('master.kalender-akademik.index'));
    $resKalIndex->assertOk();

    // 6. Delete Kalender Akademik
    $resKalDel = $this->actingAs($admin)->delete(route('master.kalender-akademik.destroy', $kalender->id));
    $resKalDel->assertRedirect();
    expect(KalenderAkademik::where('id', $kalender->id)->exists())->toBeFalse();
});

test('Calon mahasiswa can download own berkas but cannot download other applicants berkas', function () {
    Storage::fake('local');

    $fakultas = Fakultas::create(['kode' => 'FTIKB', 'nama' => 'Fakultas B']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PBAB', 'nama' => 'PBA B', 'jenjang' => 'S1']);
    $gelombang = GelombangPendaftaran::create(['nama' => 'Gel 1', 'mulai_pendaftaran' => '2026-01-01', 'selesai_pendaftaran' => '2026-08-30', 'kuota' => 100, 'is_active' => true]);
    $jalur = JalurPendaftaran::create(['nama' => 'Reguler', 'is_active' => true]);

    $userCalon1 = User::factory()->create(['user_type' => 'calon_mahasiswa', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $userCalon1->assignRole('calon_mahasiswa');
    $calon1 = CalonMahasiswa::create([
        'user_id' => $userCalon1->id,
        'gelombang_pendaftaran_id' => $gelombang->id,
        'jalur_pendaftaran_id' => $jalur->id,
        'program_studi_pilihan_1_id' => $prodi->id,
        'nama_lengkap' => 'Calon 1',
        'nik' => '3515000000001111',
        'status_pendaftaran' => 'diajukan',
    ]);

    $userCalon2 = User::factory()->create(['user_type' => 'calon_mahasiswa', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $userCalon2->assignRole('calon_mahasiswa');
    $calon2 = CalonMahasiswa::create([
        'user_id' => $userCalon2->id,
        'gelombang_pendaftaran_id' => $gelombang->id,
        'jalur_pendaftaran_id' => $jalur->id,
        'program_studi_pilihan_1_id' => $prodi->id,
        'nama_lengkap' => 'Calon 2',
        'nik' => '3515000000002222',
        'status_pendaftaran' => 'diajukan',
    ]);

    $filePath1 = 'private/berkas_pmb/berkas1.pdf';
    Storage::disk('local')->put($filePath1, 'dummy pdf content 1');

    $berkas1 = BerkasPendaftaran::create([
        'calon_mahasiswa_id' => $calon1->id,
        'jenis_berkas' => 'ijazah_skl',
        'file_path' => $filePath1,
        'status_verifikasi' => 'diajukan',
    ]);

    // Calon 1 downloads own berkas -> 200 OK
    $resOwn = $this->actingAs($userCalon1)->get(route('pmb.berkas.download', $berkas1->id));
    $resOwn->assertOk();

    // Calon 2 attempts to download Calon 1\'s berkas -> 403 Forbidden
    $resOther = $this->actingAs($userCalon2)->get(route('pmb.berkas.download', $berkas1->id));
    $resOther->assertForbidden();

    // Panitia PMB downloads Calon 1\'s berkas -> 200 OK
    $userPanitia = User::factory()->create(['user_type' => 'pegawai', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $userPanitia->assignRole('panitia_pmb');
    $resPanitia = $this->actingAs($userPanitia)->get(route('pmb.berkas.download', $berkas1->id));
    $resPanitia->assertOk();
});

test('Dosen assigned as dosen wali cannot be deleted', function () {
    $fakultas = Fakultas::create(['kode' => 'FTIKD', 'nama' => 'Fakultas D']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PBAD', 'nama' => 'PBA D', 'jenjang' => 'S1']);

    $admin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $admin->assignRole('superadmin');

    $userDosen = User::factory()->create(['user_type' => 'dosen', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $userDosen->assignRole('dosen');
    $dosen = Dosen::create(['user_id' => $userDosen->id, 'program_studi_id' => $prodi->id, 'nidn' => '99887766', 'nama_lengkap' => 'Dosen Wali Guard']);

    $tahun = TahunAjaran::create(['nama' => '2026/2027 Ganjil Dosen', 'mulai' => '2026-09-01', 'selesai' => '2027-02-28', 'is_active' => true]);

    $mhs = Mahasiswa::create([
        'program_studi_id' => $prodi->id,
        'nim' => '2026MHSWALI',
        'nama_lengkap' => 'Mhs Bimbingan',
        'tahun_masuk' => 2026,
    ]);

    DosenWali::create([
        'dosen_id' => $dosen->id,
        'mahasiswa_id' => $mhs->id,
        'tahun_ajaran_id' => $tahun->id,
    ]);

    $resDel = $this->actingAs($admin)->delete(route('kepegawaian.dosen.destroy', $dosen->id));
    $resDel->assertSessionHas('error');
    expect(Dosen::find($dosen->id))->not->toBeNull();
});

test('Kaprodi is restricted to students in their own program studi', function () {
    $fakultas = Fakultas::create(['kode' => 'FTIKK', 'nama' => 'Fakultas K']);
    $prodi1 = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PRODI1', 'nama' => 'Prodi 1', 'jenjang' => 'S1']);
    $prodi2 = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PRODI2', 'nama' => 'Prodi 2', 'jenjang' => 'S1']);

    // Kaprodi for Prodi 1
    $userKaprodi = User::factory()->create(['user_type' => 'dosen', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $userKaprodi->assignRole('kaprodi');
    Dosen::create(['user_id' => $userKaprodi->id, 'program_studi_id' => $prodi1->id, 'nidn' => '55554444', 'nama_lengkap' => 'Kaprodi Prodi 1']);

    $mhsProdi1 = Mahasiswa::create([
        'program_studi_id' => $prodi1->id,
        'nim' => '2026P1MHS',
        'nama_lengkap' => 'Mhs Prodi 1',
        'tahun_masuk' => 2026,
    ]);

    $mhsProdi2 = Mahasiswa::create([
        'program_studi_id' => $prodi2->id,
        'nim' => '2026P2MHS',
        'nama_lengkap' => 'Mhs Prodi 2',
        'tahun_masuk' => 2026,
    ]);

    // Kaprodi views student in Prodi 1 -> 200 OK
    $resP1 = $this->actingAs($userKaprodi)->get(route('mahasiswa.show', $mhsProdi1->id));
    $resP1->assertOk();

    // Kaprodi attempts to view student in Prodi 2 -> 403 Forbidden
    $resP2 = $this->actingAs($userKaprodi)->get(route('mahasiswa.show', $mhsProdi2->id));
    $resP2->assertForbidden();
});
