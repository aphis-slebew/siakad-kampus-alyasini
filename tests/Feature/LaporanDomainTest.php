<?php

use App\Models\Dosen;
use App\Models\DosenPengajar;
use App\Models\Fakultas;
use App\Models\KelasKuliah;

use App\Models\Krs;
use App\Models\KrsDetail;
use App\Models\Kurikulum;
use App\Models\KurikulumMatakuliah;
use App\Models\KurikulumProdi;
use App\Models\Mahasiswa;
use App\Models\Matakuliah;
use App\Models\Nilai;
use App\Models\ProgramStudi;
use App\Models\RuangKuliah;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use App\Models\User;
use App\Services\LaporanService;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => RoleAndPermissionSeeder::class]);
});

function createLaporanTestEnvironment() {
    $fakultas = Fakultas::firstOrCreate(['kode' => 'FTIK'], ['nama' => 'Fakultas Tarbiyah']);
    $prodi1 = ProgramStudi::firstOrCreate(['kode' => 'PAI'], ['fakultas_id' => $fakultas->id, 'nama' => 'Pendidikan Agama Islam', 'jenjang' => 'S1']);
    $prodi2 = ProgramStudi::firstOrCreate(['kode' => 'PBA'], ['fakultas_id' => $fakultas->id, 'nama' => 'Pendidikan Bahasa Arab', 'jenjang' => 'S1']);

    $tahun = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-08-01', 'selesai' => '2027-01-31', 'is_active' => true]);

    return compact('fakultas', 'prodi1', 'prodi2', 'tahun');
}

test('laporan krs agregat calculation matches database records', function () {
    $env = createLaporanTestEnvironment();

    $userMhs1 = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs1 = Mahasiswa::create(['user_id' => $userMhs1->id, 'program_studi_id' => $env['prodi1']->id, 'nim' => '2026KRS101', 'nama_lengkap' => 'Mhs Diajukan 1', 'tahun_masuk' => 2026]);

    $userMhs2 = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs2 = Mahasiswa::create(['user_id' => $userMhs2->id, 'program_studi_id' => $env['prodi1']->id, 'nim' => '2026KRS102', 'nama_lengkap' => 'Mhs Diajukan 2', 'tahun_masuk' => 2026]);

    $userMhs3 = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs3 = Mahasiswa::create(['user_id' => $userMhs3->id, 'program_studi_id' => $env['prodi1']->id, 'nim' => '2026KRS103', 'nama_lengkap' => 'Mhs Disetujui', 'tahun_masuk' => 2026]);

    Krs::create(['mahasiswa_id' => $mhs1->id, 'tahun_ajaran_id' => $env['tahun']->id, 'status' => 'diajukan']);
    Krs::create(['mahasiswa_id' => $mhs2->id, 'tahun_ajaran_id' => $env['tahun']->id, 'status' => 'diajukan']);
    Krs::create(['mahasiswa_id' => $mhs3->id, 'tahun_ajaran_id' => $env['tahun']->id, 'status' => 'disetujui_wali']);

    $service = app(LaporanService::class);
    $report = $service->getLaporanKrs($env['tahun']->id, $env['prodi1']->id);

    $summaryPai = $report['summary']->firstWhere('program_studi_id', $env['prodi1']->id);

    expect((int) $summaryPai->diajukan_count)->toBe(2);
    expect((int) $summaryPai->disetujui_wali_count)->toBe(1);
    expect((int) $summaryPai->total_krs)->toBe(3);
});

test('kaprodi auto scopes silently to own program studi krs data', function () {
    $env = createLaporanTestEnvironment();

    $userKaprodiPai = User::factory()->create(['user_type' => 'dosen']);
    $userKaprodiPai->assignRole('kaprodi');
    Dosen::create(['user_id' => $userKaprodiPai->id, 'program_studi_id' => $env['prodi1']->id, 'nama_lengkap' => 'Kaprodi PAI']);

    $service = app(LaporanService::class);

    // Kaprodi PAI accessing PAI data -> OK
    $report = $service->getLaporanKrs($env['tahun']->id, $env['prodi1']->id, null, $userKaprodiPai);
    expect($report['scopedProdiId'])->toBe($env['prodi1']->id);

    // Kaprodi PAI attempting to query PBA (prodi2) -> Silently neutralized to PAI homebase prodi (200 OK UX)
    $reportNeutralized = $service->getLaporanKrs($env['tahun']->id, $env['prodi2']->id, null, $userKaprodiPai);
    expect($reportNeutralized['scopedProdiId'])->toBe($env['prodi1']->id);
});

test('rekap nilai grade distribution and average calculated via database', function () {
    $env = createLaporanTestEnvironment();

    $userDosen = User::factory()->create(['user_type' => 'dosen']);
    $dosen = Dosen::create(['user_id' => $userDosen->id, 'program_studi_id' => $env['prodi1']->id, 'nama_lengkap' => 'Dosen Pengajar']);

    $mk = Matakuliah::create(['kode' => 'PAI101', 'nama' => 'Fikih', 'sks' => 3]);
    $kurikulum = KurikulumProdi::create(['program_studi_id' => $env['prodi1']->id, 'tahun_kurikulum' => '2026', 'is_active' => true]);
    $kmk = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk->id, 'semester' => 1]);
    $ruang = RuangKuliah::create(['kode' => 'R101', 'nama' => 'Ruang 101']);

    $kelas = KelasKuliah::create([
        'tahun_ajaran_id' => $env['tahun']->id,
        'kurikulum_matakuliah_id' => $kmk->id,
        'ruang_kuliah_id' => $ruang->id,
        'nama_kelas' => 'A',
        'kuota' => 30,
    ]);
    DosenPengajar::create(['kelas_kuliah_id' => $kelas->id, 'dosen_id' => $dosen->id, 'peran' => 'pengampu']);

    $userMhs1 = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs1 = Mahasiswa::create(['user_id' => $userMhs1->id, 'program_studi_id' => $env['prodi1']->id, 'nim' => '2026NIL01', 'nama_lengkap' => 'Mhs Nilai A', 'tahun_masuk' => 2026]);
    $userMhs2 = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs2 = Mahasiswa::create(['user_id' => $userMhs2->id, 'program_studi_id' => $env['prodi1']->id, 'nim' => '2026NIL02', 'nama_lengkap' => 'Mhs Nilai B', 'tahun_masuk' => 2026]);

    $krs1 = Krs::create(['mahasiswa_id' => $mhs1->id, 'tahun_ajaran_id' => $env['tahun']->id, 'status' => 'disetujui_wali']);
    $krs2 = Krs::create(['mahasiswa_id' => $mhs2->id, 'tahun_ajaran_id' => $env['tahun']->id, 'status' => 'disetujui_wali']);

    $kd1 = KrsDetail::create(['krs_id' => $krs1->id, 'kelas_kuliah_id' => $kelas->id]);
    $kd2 = KrsDetail::create(['krs_id' => $krs2->id, 'kelas_kuliah_id' => $kelas->id]);

    // Nilai A (90.0) and B (80.0) -> Rata-rata = 85.0
    Nilai::create(['krs_detail_id' => $kd1->id, 'komponen' => 'UAS', 'nilai_angka' => 90.0, 'nilai_huruf' => 'A', 'is_final' => true]);
    Nilai::create(['krs_detail_id' => $kd2->id, 'komponen' => 'UAS', 'nilai_angka' => 80.0, 'nilai_huruf' => 'B', 'is_final' => true]);

    $service = app(LaporanService::class);
    $report = $service->getRekapNilai($env['tahun']->id, $kelas->id);

    $rekapKelas = $report['rekap']->firstWhere('kelas_kuliah_id', $kelas->id);

    expect((int) $rekapKelas->count_a)->toBe(1);
    expect((int) $rekapKelas->count_b)->toBe(1);
    expect((float) $rekapKelas->rata_rata)->toBe(85.0);
});

test('dosen auto scopes silently to own taught classes in rekap nilai', function () {
    $env = createLaporanTestEnvironment();

    $userDosenA = User::factory()->create(['user_type' => 'dosen']);
    $userDosenA->assignRole('dosen');
    $dosenA = Dosen::create(['user_id' => $userDosenA->id, 'program_studi_id' => $env['prodi1']->id, 'nama_lengkap' => 'Dosen A']);

    $userDosenB = User::factory()->create(['user_type' => 'dosen']);
    $userDosenB->assignRole('dosen');
    $dosenB = Dosen::create(['user_id' => $userDosenB->id, 'program_studi_id' => $env['prodi1']->id, 'nama_lengkap' => 'Dosen B']);

    $mk = Matakuliah::create(['kode' => 'PAI102', 'nama' => 'Hadits', 'sks' => 3]);

    $kurikulum = KurikulumProdi::create(['program_studi_id' => $env['prodi1']->id, 'tahun_kurikulum' => '2026', 'is_active' => true]);
    $kmk = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk->id, 'semester' => 1]);
    $ruang = RuangKuliah::create(['kode' => 'R102', 'nama' => 'Ruang 102']);

    $kelasB = KelasKuliah::create([
        'tahun_ajaran_id' => $env['tahun']->id,
        'kurikulum_matakuliah_id' => $kmk->id,
        'ruang_kuliah_id' => $ruang->id,
        'nama_kelas' => 'B',
        'kuota' => 30,
    ]);
    DosenPengajar::create(['kelas_kuliah_id' => $kelasB->id, 'dosen_id' => $dosenB->id, 'peran' => 'pengampu']);

    $service = app(LaporanService::class);

    // Dosen A attempting to view Dosen B's class -> Silently neutralized (does not return Dosen B's class data)
    $report = $service->getRekapNilai($env['tahun']->id, $kelasB->id, null, $userDosenA);
    expect($report['rekap']->firstWhere('kelas_kuliah_id', $kelasB->id))->toBeNull();
});


test('piutang ukt summary and student list restricted to finance and superadmin', function () {
    $env = createLaporanTestEnvironment();

    $userKeuangan = User::factory()->create(['user_type' => 'staf_keuangan']);
    $userKeuangan->assignRole('staf_keuangan');

    $userDosen = User::factory()->create(['user_type' => 'dosen']);
    $userDosen->assignRole('dosen');

    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $env['prodi1']->id, 'nim' => '2026UKT01', 'nama_lengkap' => 'Mhs Menunggak', 'tahun_masuk' => 2026]);

    Tagihan::create([
        'mahasiswa_id' => $mhs->id,
        'tahun_ajaran_id' => $env['tahun']->id,
        'jenis' => 'ukt',
        'nominal' => 3000000.00,
        'jatuh_tempo' => '2026-08-31',
        'status' => 'menunggu_pembayaran',
    ]);

    $service = app(LaporanService::class);

    // Staf Keuangan access -> OK
    $report = $service->getLaporanPiutangUkt($env['tahun']->id, null, $userKeuangan);
    expect((float) $report['totalPiutangKeseluruhan'])->toBe(3000000.00);

    // Dosen access -> Throws DomainException 403
    expect(fn () => $service->getLaporanPiutangUkt($env['tahun']->id, null, $userDosen))
        ->toThrow(\DomainException::class, 'AKSES DITOLAK: Laporan piutang UKT hanya dapat diakses oleh Superadmin dan Staf Keuangan.');
});

test('laporan queries are efficient without n plus one', function () {
    $env = createLaporanTestEnvironment();

    $userAdmin = User::factory()->create(['user_type' => 'superadmin']);
    $userAdmin->assignRole('superadmin');

    DB::enableQueryLog();

    $service = app(LaporanService::class);
    $service->getLaporanKrs($env['tahun']->id, null, null, $userAdmin);
    $service->getRekapNilai($env['tahun']->id, null, null, $userAdmin);
    $service->getLaporanPiutangUkt($env['tahun']->id, null, $userAdmin);

    $queries = DB::getQueryLog();
    // Verify query count is small & constant (no N+1 loop)
    expect(count($queries))->toBeLessThanOrEqual(5);
});

test('csv exports return streamed csv response', function () {
    $env = createLaporanTestEnvironment();

    $userAdmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $userAdmin->assignRole('superadmin');


    $responseKrs = $this->actingAs($userAdmin)->get("/laporan/krs/export?tahun_ajaran_id={$env['tahun']->id}");
    $responseKrs->assertStatus(200);
    $responseKrs->assertHeader('content-type', 'text/csv; charset=UTF-8');

    $responseRekap = $this->actingAs($userAdmin)->get("/laporan/rekap-nilai/export?tahun_ajaran_id={$env['tahun']->id}");
    $responseRekap->assertStatus(200);
    $responseRekap->assertHeader('content-type', 'text/csv; charset=UTF-8');

    $responsePiutang = $this->actingAs($userAdmin)->get("/laporan/piutang-ukt/export?tahun_ajaran_id={$env['tahun']->id}");
    $responsePiutang->assertStatus(200);
    $responsePiutang->assertHeader('content-type', 'text/csv; charset=UTF-8');
});
