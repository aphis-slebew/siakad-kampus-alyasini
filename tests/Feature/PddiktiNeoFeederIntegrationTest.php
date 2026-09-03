<?php

use App\Jobs\Pddikti\PullReferensiPddiktiJob;
use App\Jobs\Pddikti\SyncKelasKuliahToPddiktiJob;
use App\Jobs\Pddikti\SyncKrsDanNilaiToPddiktiJob;
use App\Jobs\Pddikti\SyncMahasiswaToPddiktiJob;
use App\Models\Fakultas;
use App\Models\KelasKuliah;
use App\Models\Krs;
use App\Models\KrsDetail;
use App\Models\KurikulumMatakuliah;
use App\Models\KurikulumProdi;
use App\Models\Mahasiswa;
use App\Models\Matakuliah;
use App\Models\Nilai;
use App\Models\PddiktiMapping;
use App\Models\PddiktiSyncLog;
use App\Models\ProgramStudi;
use App\Models\ReferensiBiodata;
use App\Models\TahunAjaran;
use App\Models\User;
use App\Services\Pddikti\NeoFeederClient;
use App\Services\Pddikti\PddiktiReconciliationService;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['pddikti.sandbox_mode' => false]);
    $this->artisan('db:seed', ['--class' => RoleAndPermissionSeeder::class]);
});

test('NeoFeederClient authenticates and caches token successfully', function () {
    Http::fake([
        'http://localhost:3003/ws/live2.php' => Http::response([
            'error_code' => 0,
            'error_desc' => '',
            'data' => [
                'token' => 'mock-jwt-token-123456',
            ],
        ], 200),
    ]);

    Cache::flush();

    $client = new NeoFeederClient;
    $token = $client->getToken();

    expect($token)->toBe('mock-jwt-token-123456');
    expect(Cache::has('pddikti_feeder_token_'.md5('http://localhost:3003/ws/live2.php'.config('pddikti.username'))))->toBeTrue();
});

test('NeoFeederClient handles RPC call and returns payload', function () {
    Http::fake([
        'http://localhost:3003/ws/live2.php' => Http::sequence()
            ->push([
                'error_code' => 0,
                'error_desc' => '',
                'data' => ['token' => 'test-token'],
            ], 200)
            ->push([
                'error_code' => 0,
                'error_desc' => '',
                'data' => [
                    'kode_perguruan_tinggi' => '213035',
                    'nama_perguruan_tinggi' => 'STAI Al-Yasini Pasuruan',
                ],
            ], 200),
    ]);

    Cache::flush();
    $client = new NeoFeederClient;
    $result = $client->call('GetProfilPT');

    expect($result['error_code'])->toBe(0);
    expect($result['data']['kode_perguruan_tinggi'])->toBe('213035');
});

test('SyncMahasiswaToPddiktiJob pushes student biodata and saves mapping', function () {
    Http::fake([
        'http://localhost:3003/ws/live2.php' => Http::sequence()
            ->push(['error_code' => 0, 'data' => ['token' => 'token-123']], 200)
            ->push(['error_code' => 0, 'data' => ['id_mahasiswa' => 'feeder-mhs-uuid-1122']], 200),
    ]);

    Cache::flush();

    $fakultas = Fakultas::create(['kode' => 'FTIK', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create([
        'fakultas_id' => $fakultas->id,
        'kode' => 'PAI',
        'nama' => 'Pendidikan Agama Islam',
        'jenjang' => 'S1',
    ]);

    $user = User::factory()->create(['user_type' => 'mahasiswa']);
    $mahasiswa = Mahasiswa::create([
        'user_id' => $user->id,
        'program_studi_id' => $prodi->id,
        'nim' => '2026010099',
        'nama_lengkap' => 'Muhammad Ali',
        'nik' => '3514010101990001',
        'tempat_lahir' => 'Pasuruan',
        'tanggal_lahir' => '2001-05-15',
        'jenis_kelamin' => 'L',
        'tahun_masuk' => 2026,
        'status_mahasiswa' => 'aktif',
    ]);

    $job = new SyncMahasiswaToPddiktiJob($mahasiswa->id);
    $job->handle(new NeoFeederClient);

    $log = PddiktiSyncLog::where('table_name', 'mahasiswas')->where('record_id', $mahasiswa->id)->first();
    expect($log)->not->toBeNull();
    expect($log->status)->toBe('success');
    expect($log->pddikti_id)->toBe('feeder-mhs-uuid-1122');

    $mapping = PddiktiMapping::where('local_table', 'mahasiswas')->where('local_id', $mahasiswa->id)->first();
    expect($mapping)->not->toBeNull();
    expect($mapping->pddikti_id)->toBe('feeder-mhs-uuid-1122');
});

test('SyncKelasKuliahToPddiktiJob and SyncKrsDanNilaiToPddiktiJob execute correctly', function () {
    Http::fake([
        'http://localhost:3003/ws/live2.php' => Http::response([
            'error_code' => 0,
            'data' => [
                'token' => 'token-test',
                'id_kelas_kuliah' => 'feeder-kls-uuid-99',
            ],
        ], 200),
    ]);

    Cache::flush();

    $fakultas = Fakultas::create(['kode' => 'FTIK', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create([
        'fakultas_id' => $fakultas->id,
        'kode' => 'PAI',
        'nama' => 'Pendidikan Agama Islam',
        'jenjang' => 'S1',
    ]);

    $tahun = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-09-01', 'selesai' => '2027-02-28', 'is_active' => true]);
    $kurikulum = KurikulumProdi::create(['program_studi_id' => $prodi->id, 'tahun_kurikulum' => '2026', 'is_active' => true]);
    $matakuliah = Matakuliah::create(['program_studi_id' => $prodi->id, 'kode' => 'PAI101', 'nama' => 'Ilmu Pendidikan Islam', 'sks' => 3]);
    $kurikulumMk = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $matakuliah->id, 'semester' => 1]);

    $kelas = KelasKuliah::create([
        'kurikulum_matakuliah_id' => $kurikulumMk->id,
        'tahun_ajaran_id' => $tahun->id,
        'nama_kelas' => 'PAI-1A',
        'kuota' => 40,
    ]);

    $user = User::factory()->create(['user_type' => 'mahasiswa']);
    $mahasiswa = Mahasiswa::create([
        'user_id' => $user->id,
        'program_studi_id' => $prodi->id,
        'nim' => '2026010088',
        'nama_lengkap' => 'Siti Aisyah',
        'nik' => '3514010101990002',
        'jenis_kelamin' => 'P',
        'tahun_masuk' => 2026,
        'status_mahasiswa' => 'aktif',
    ]);

    $krs = Krs::create(['mahasiswa_id' => $mahasiswa->id, 'tahun_ajaran_id' => $tahun->id, 'status' => 'disetujui_wali', 'total_sks' => 3]);
    $krsDetail = KrsDetail::create(['krs_id' => $krs->id, 'kelas_kuliah_id' => $kelas->id]);
    Nilai::create(['krs_detail_id' => $krsDetail->id, 'komponen' => 'UAS', 'nilai_angka' => 88.00, 'nilai_huruf' => 'A', 'is_final' => true]);

    // 1. Sync Kelas
    $kelasJob = new SyncKelasKuliahToPddiktiJob($kelas->id);
    $kelasJob->handle(new NeoFeederClient);

    $kelasLog = PddiktiSyncLog::where('table_name', 'kelas_kuliahs')->where('record_id', $kelas->id)->first();
    expect($kelasLog)->not->toBeNull();
    expect($kelasLog->status)->toBe('success');

    // 2. Sync KRS & Nilai
    $nilaiJob = new SyncKrsDanNilaiToPddiktiJob($kelas->id);
    $nilaiJob->handle(new NeoFeederClient);

    $nilaiLog = PddiktiSyncLog::where('table_name', 'nilais')->where('record_id', $kelas->id)->first();
    expect($nilaiLog)->not->toBeNull();
    expect($nilaiLog->status)->toBe('success');
});

test('PullReferensiPddiktiJob updates pddikti_ref_id in ReferensiBiodata', function () {
    Http::fake([
        'http://localhost:3003/ws/live2.php' => Http::sequence()
            ->push(['error_code' => 0, 'data' => ['token' => 'token-test']], 200)
            ->push(['error_code' => 0, 'data' => [
                ['id_agama' => 1, 'nama_agama' => 'Islam'],
                ['id_agama' => 2, 'nama_agama' => 'Kristen'],
            ]], 200)
            ->push(['error_code' => 0, 'data' => [
                ['id_pekerjaan' => 5, 'nama_pekerjaan' => 'PNS/TNI/Polri'],
            ]], 200)
            ->push(['error_code' => 0, 'data' => [
                ['id_penghasilan' => 11, 'nama_penghasilan' => 'Kurang dari Rp. 1.000.000'],
            ]], 200),
    ]);

    Cache::flush();

    $refAgama = ReferensiBiodata::create(['tipe' => 'agama', 'nama' => 'Islam']);
    $refPekerjaan = ReferensiBiodata::create(['tipe' => 'pekerjaan', 'nama' => 'PNS/TNI/Polri']);

    $job = new PullReferensiPddiktiJob;
    $job->handle(new NeoFeederClient);

    expect($refAgama->fresh()->pddikti_ref_id)->toBe('1');
    expect($refPekerjaan->fresh()->pddikti_ref_id)->toBe('5');

    $log = PddiktiSyncLog::where('table_name', 'referensi_biodatas')->first();
    expect($log->status)->toBe('success');
});

test('PddiktiReconciliationService identifies differences without overwriting local source of truth', function () {
    Http::fake([
        'http://localhost:3003/ws/live2.php' => Http::sequence()
            ->push(['error_code' => 0, 'data' => ['token' => 'token-test']], 200)
            ->push(['error_code' => 0, 'data' => [
                [
                    'id_mahasiswa' => 'feeder-mhs-1',
                    'id_registrasi_mahasiswa' => 'feeder-reg-1',
                    'nim' => '2026010001',
                    'nama_mahasiswa' => 'Ahmad Fauzi SE', // Different name in feeder
                ],
                [
                    'id_mahasiswa' => 'feeder-mhs-99',
                    'id_registrasi_mahasiswa' => 'feeder-reg-99',
                    'nim' => '2026019999',
                    'nama_mahasiswa' => 'Budi Santoso', // Only in feeder
                ],
            ]], 200),
    ]);

    Cache::flush();

    $fakultas = Fakultas::create(['kode' => 'FTIK', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create(['fakultas_id' => $fakultas->id, 'kode' => 'PAI', 'nama' => 'Pendidikan Agama Islam', 'jenjang' => 'S1']);
    $user = User::factory()->create(['user_type' => 'mahasiswa']);

    $localMhs = Mahasiswa::create([
        'user_id' => $user->id,
        'program_studi_id' => $prodi->id,
        'nim' => '2026010001',
        'nama_lengkap' => 'Ahmad Fauzi', // Local name
        'nik' => '3514010101990003',
        'jenis_kelamin' => 'L',
        'tahun_masuk' => 2026,
        'status_mahasiswa' => 'aktif',
    ]);

    $service = new PddiktiReconciliationService(new NeoFeederClient);
    $report = $service->reconcileMahasiswa();

    expect($report['total_local'])->toBe(1);
    expect($report['total_feeder'])->toBe(2);
    expect($report['matched_count'])->toBe(1);
    expect($report['differences'])->toHaveCount(1);
    expect($report['differences'][0]['discrepancies'][0]['field'])->toBe('nama');
    expect($report['unmatched_feeder'])->toHaveCount(1);

    // Verify local data is NOT altered
    expect($localMhs->fresh()->nama_lengkap)->toBe('Ahmad Fauzi');
});

test('Superadmin and Admin Akademik can access PD-DIKTI dashboard and actions', function () {
    Queue::fake();

    $admin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('SECRET123'),
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('superadmin');

    // 1. Dashboard Index
    $response = $this->actingAs($admin)->get(route('pddikti.index'));
    $response->assertOk();

    // 2. Test Connection
    Http::fake([
        'http://localhost:3003/ws/live2.php' => Http::response([
            'error_code' => 0,
            'data' => ['token' => 'tok', 'kode_perguruan_tinggi' => '213035', 'nama_perguruan_tinggi' => 'STAI Al-Yasini'],
        ], 200),
    ]);

    $testRes = $this->actingAs($admin)->get(route('pddikti.test-connection'));
    $testRes->assertOk();

    // 3. Batch Sync Trigger
    $batchRes = $this->actingAs($admin)->post(route('pddikti.sync-batch'), [
        'entity' => 'referensi',
    ]);
    $batchRes->assertRedirect();
    Queue::assertPushed(PullReferensiPddiktiJob::class);

    // 4. Retry Failed Log
    $log = PddiktiSyncLog::create([
        'table_name' => 'referensi_biodatas',
        'record_id' => 0,
        'action' => 'pull',
        'status' => 'failed',
        'error_message' => 'Timeout test',
    ]);

    $retryRes = $this->actingAs($admin)->post(route('pddikti.retry', $log));
    $retryRes->assertRedirect();
    expect($log->fresh()->status)->toBe('pending');
    Queue::assertPushed(PullReferensiPddiktiJob::class);
});

test('Unauthorized users cannot access PD-DIKTI routes', function () {
    $mahasiswaUser = User::factory()->create(['user_type' => 'mahasiswa']);
    $mahasiswaUser->assignRole('mahasiswa');

    $response = $this->actingAs($mahasiswaUser)->get(route('pddikti.index'));
    $response->assertForbidden();

    $guestResponse = $this->get(route('pddikti.index'));
    $guestResponse->assertForbidden();
});
