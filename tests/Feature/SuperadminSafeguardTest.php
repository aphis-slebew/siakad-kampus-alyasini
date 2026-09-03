<?php

use App\Models\ActivityLog;
use App\Models\CalonMahasiswa;
use App\Models\Fakultas;
use App\Models\GelombangPendaftaran;
use App\Models\JalurPendaftaran;
use App\Models\KelasKuliah;
use App\Models\KelompokUkt;
use App\Models\Krs;
use App\Models\KrsDetail;
use App\Models\KurikulumMatakuliah;
use App\Models\KurikulumProdi;
use App\Models\Mahasiswa;
use App\Models\MahasiswaUkt;
use App\Models\Matakuliah;
use App\Models\PeriodeRegistrasi;
use App\Models\ProgramStudi;
use App\Models\RegistrasiUlang;
use App\Models\TahunAjaran;
use App\Models\User;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
});

test('superadmin can update and delete periode registrasi via route model binding', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $tahunAjaran = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-09-01', 'selesai' => '2027-01-31', 'is_active' => true]);

    $periode = PeriodeRegistrasi::create([
        'tahun_ajaran_id' => $tahunAjaran->id,
        'jenis' => 'mahasiswa_baru',
        'mulai' => '2026-08-01',
        'selesai' => '2026-08-20',
    ]);

    // Update test
    $response = $this->actingAs($superadmin)->put(route('keuangan.periode-registrasi.update', $periode), [
        'tahun_ajaran_id' => $tahunAjaran->id,
        'jenis' => 'mahasiswa_lama',
        'mulai' => '2026-08-05',
        'selesai' => '2026-08-25',
    ]);

    $response->assertRedirect();
    $periode->refresh();
    expect($periode->jenis)->toBe('mahasiswa_lama');
    expect($periode->mulai->format('Y-m-d'))->toBe('2026-08-05');

    // Delete test
    $deleteResponse = $this->actingAs($superadmin)->delete(route('keuangan.periode-registrasi.destroy', $periode));
    $deleteResponse->assertRedirect();
    expect(PeriodeRegistrasi::find($periode->id))->toBeNull();
});

test('periode registrasi with existing registrasi_ulangs cannot be deleted', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $tahunAjaran = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-09-01', 'selesai' => '2027-01-31', 'is_active' => true]);
    $periode = PeriodeRegistrasi::create([
        'tahun_ajaran_id' => $tahunAjaran->id,
        'jenis' => 'mahasiswa_baru',
        'mulai' => '2026-08-01',
        'selesai' => '2026-08-20',
    ]);

    $fakultas = Fakultas::create(['kode' => 'FTKREG', 'nama' => 'Fakultas Reg']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'REG1', 'nama' => 'Prodi Reg', 'jenjang' => 'S1']);
    $gelombang = GelombangPendaftaran::create(['nama' => 'Gel 1', 'mulai_pendaftaran' => '2026-01-01', 'selesai_pendaftaran' => '2026-03-31', 'kuota' => 50]);
    $jalur = JalurPendaftaran::create(['nama' => 'Jalur 1', 'biaya_pendaftaran' => 150000]);

    $calon = CalonMahasiswa::create([
        'gelombang_pendaftaran_id' => $gelombang->id,
        'jalur_pendaftaran_id' => $jalur->id,
        'program_studi_pilihan_1_id' => $prodi->id,
        'nama_lengkap' => 'Calon Mhs Reg',
        'nik' => '3515000099998888',
        'status_pendaftaran' => 'lulus_seleksi',
    ]);

    RegistrasiUlang::create([
        'periode_registrasi_id' => $periode->id,
        'calon_mahasiswa_id' => $calon->id,
        'status' => 'proses_verifikasi',
    ]);

    $response = $this->actingAs($superadmin)->delete(route('keuangan.periode-registrasi.destroy', $periode));
    $response->assertSessionHas('error');
    expect(PeriodeRegistrasi::find($periode->id))->not->toBeNull();
});

test('fakultas cannot be deleted if it has active program studi', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $fakultas = Fakultas::create(['kode' => 'FTK', 'nama' => 'Fakultas Tarbiyah']);
    ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PAI', 'nama' => 'Pendidikan Agama Islam', 'jenjang' => 'S1']);

    $response = $this->actingAs($superadmin)->delete(route('master.fakultas.destroy', $fakultas));
    $response->assertSessionHas('error');
    expect(Fakultas::find($fakultas->id))->not->toBeNull();
});

test('program studi cannot be deleted if it has enrolled mahasiswa or dosen', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $fakultas = Fakultas::create(['kode' => 'FTK2', 'nama' => 'Fakultas Tarbiyah 2']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PBA', 'nama' => 'Pendidikan Bahasa Arab', 'jenjang' => 'S1']);

    Mahasiswa::create([
        'program_studi_id' => $prodi->id,
        'nim' => '2026001122',
        'nama_lengkap' => 'Mahasiswa Test Prodi',
        'tahun_masuk' => 2026,
        'status_mahasiswa' => 'aktif',
    ]);

    $response = $this->actingAs($superadmin)->delete(route('master.program-studi.destroy', $prodi));
    $response->assertSessionHas('error');
    expect(ProgramStudi::find($prodi->id))->not->toBeNull();
});

test('active tahun ajaran or tahun ajaran with classes cannot be deleted', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $tahunAjaran = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-09-01', 'selesai' => '2027-01-31', 'is_active' => true]);

    $response = $this->actingAs($superadmin)->delete(route('master.tahun-ajaran.destroy', $tahunAjaran));
    $response->assertSessionHas('error');
    expect(TahunAjaran::find($tahunAjaran->id))->not->toBeNull();
});

test('kelas kuliah cannot be deleted if students are already enrolled in krs', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $fakultas = Fakultas::create(['kode' => 'FTK3', 'nama' => 'Fakultas T3']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'TIF', 'nama' => 'Teknik Informatika', 'jenjang' => 'S1']);
    $tahunAjaran = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-09-01', 'selesai' => '2027-01-31', 'is_active' => true]);
    $kurikulum = KurikulumProdi::create(['program_studi_id' => $prodi->id, 'tahun_kurikulum' => '2026', 'is_active' => true]);
    $matakuliah = Matakuliah::create(['kode' => 'IF101', 'nama' => 'Dasar Pemrograman', 'sks' => 3, 'semester' => 1]);
    $kurikulumMatakuliah = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $matakuliah->id, 'semester' => 1]);

    $kelas = KelasKuliah::create([
        'kurikulum_matakuliah_id' => $kurikulumMatakuliah->id,
        'tahun_ajaran_id' => $tahunAjaran->id,
        'nama_kelas' => 'A',
        'kuota' => 30,
    ]);

    $mhs = Mahasiswa::create([
        'program_studi_id' => $prodi->id,
        'nim' => '2026002233',
        'nama_lengkap' => 'Mahasiswa KRS',
        'tahun_masuk' => 2026,
        'status_mahasiswa' => 'aktif',
    ]);

    $krs = Krs::create(['mahasiswa_id' => $mhs->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'status' => 'disetujui']);
    KrsDetail::create(['krs_id' => $krs->id, 'kelas_kuliah_id' => $kelas->id]);

    $response = $this->actingAs($superadmin)->delete(route('akademik.kelas-kuliah.destroy', $kelas));
    $response->assertSessionHasErrors('error');
    expect(KelasKuliah::find($kelas->id))->not->toBeNull();
});

test('gelombang and jalur pmb cannot be deleted if calon mahasiswa exists', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $fakultas = Fakultas::create(['kode' => 'FTKPMB', 'nama' => 'Fakultas PMB']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PMB1', 'nama' => 'Prodi PMB', 'jenjang' => 'S1']);
    $gelombang = GelombangPendaftaran::create(['nama' => 'Gelombang 1', 'mulai_pendaftaran' => '2026-01-01', 'selesai_pendaftaran' => '2026-03-31', 'kuota' => 100]);
    $jalur = JalurPendaftaran::create(['nama' => 'Reguler', 'biaya_pendaftaran' => 200000]);

    CalonMahasiswa::create([
        'gelombang_pendaftaran_id' => $gelombang->id,
        'jalur_pendaftaran_id' => $jalur->id,
        'program_studi_pilihan_1_id' => $prodi->id,
        'nama_lengkap' => 'Calon Mhs Uji',
        'nik' => '3515000077776666',
        'status_pendaftaran' => 'menunggu_verifikasi',
    ]);

    $resGel = $this->actingAs($superadmin)->delete(route('pmb.gelombang.destroy', $gelombang));
    $resGel->assertSessionHas('error');
    expect(GelombangPendaftaran::find($gelombang->id))->not->toBeNull();

    $resJalur = $this->actingAs($superadmin)->delete(route('pmb.jalur.destroy', $jalur));
    $resJalur->assertSessionHas('error');
    expect(JalurPendaftaran::find($jalur->id))->not->toBeNull();
});

test('kelompok ukt cannot be deleted if assigned to mahasiswa', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $fakultas = Fakultas::create(['kode' => 'FTK4', 'nama' => 'Fakultas T4']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PGMI', 'nama' => 'PGMI', 'jenjang' => 'S1']);
    $tahunAjaran = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-09-01', 'selesai' => '2027-01-31', 'is_active' => true]);
    $kelompok = KelompokUkt::create(['program_studi_id' => $prodi->id, 'nama' => 'UKT 1', 'nominal_per_semester' => 2500000]);

    $mhs = Mahasiswa::create([
        'program_studi_id' => $prodi->id,
        'nim' => '2026005566',
        'nama_lengkap' => 'Mahasiswa UKT Uji',
        'tahun_masuk' => 2026,
        'status_mahasiswa' => 'aktif',
    ]);

    MahasiswaUkt::create([
        'mahasiswa_id' => $mhs->id,
        'kelompok_ukt_id' => $kelompok->id,
        'tahun_ajaran_id' => $tahunAjaran->id,
    ]);

    $response = $this->actingAs($superadmin)->delete(route('keuangan.kelompok-ukt.destroy', $kelompok));
    $response->assertSessionHas('error');
    expect(KelompokUkt::find($kelompok->id))->not->toBeNull();
});

test('activity logger logs master data and user operations', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    // Create fakultas
    $this->actingAs($superadmin)->post(route('master.fakultas.store'), [
        'kode' => 'FAUDIT',
        'nama' => 'Fakultas Audit Test',
    ]);

    $fakultas = Fakultas::where('kode', 'FAUDIT')->first();
    expect($fakultas)->not->toBeNull();

    $log = ActivityLog::where('action', 'master.fakultas.create')->where('entity_id', (string) $fakultas->id)->first();
    expect($log)->not->toBeNull();
    expect($log->user_id)->toBe($superadmin->id);
});
