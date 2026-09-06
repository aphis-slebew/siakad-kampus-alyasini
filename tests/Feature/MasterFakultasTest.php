<?php

use App\Models\Dosen;
use App\Models\Fakultas;
use App\Models\Pegawai;
use App\Models\ProgramStudi;
use App\Models\RiwayatPimpinanFakultas;
use App\Models\User;
use App\Services\FakultasService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
});

test('superadmin and admin_akademik can view fakultas index with aggregated stats', function () {
    $admin = User::factory()->create([
        'user_type' => 'admin_akademik',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $admin->assignRole('admin_akademik');

    $fakultas = Fakultas::create([
        'kode' => 'FTK',
        'nama' => 'Fakultas Tarbiyah dan Keguruan',
        'nama_singkat' => 'FTK',
        'status' => 'aktif',
    ]);

    $response = $this->actingAs($admin)->get(route('master.fakultas.index'));

    $response->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master/fakultas/index')
            ->has('fakultas')
            ->has('stats')
            ->where('stats.total_fakultas', 1)
            ->where('stats.total_fakultas_aktif', 1)
        );
});

test('can view single fakultas detail page with affiliated prodis and dosens', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $fakultas = Fakultas::create([
        'kode' => 'FASIH',
        'nama' => 'Fakultas Syariah dan Hukum',
        'status' => 'aktif',
    ]);

    ProgramStudi::create([
        'fakultas_id' => $fakultas->id,
        'kode' => 'HKI',
        'nama' => 'Hukum Keluarga Islam',
        'jenjang' => 'S1',
        'status' => 'aktif',
    ]);

    $response = $this->actingAs($superadmin)->get(route('master.fakultas.show', $fakultas));

    $response->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master/fakultas/show')
            ->has('fakultas')
            ->where('fakultas.id', $fakultas->id)
            ->where('fakultas.kode', 'FASIH')
            ->has('fakultas.program_studis', 1)
            ->has('allFakultas')
            ->has('dosens')
        );
});

test('superadmin can create a new fakultas with complete pddikti identity', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $payload = [
        'kode' => 'FEBI',
        'nama' => 'Fakultas Ekonomi dan Bisnis Islam',
        'nama_en' => 'Faculty of Islamic Economics and Business',
        'nama_singkat' => 'FEBI',
        'no_sk_pendirian' => 'SK-DIKTI-2024-001',
        'tanggal_sk_pendirian' => '2024-01-15',
        'no_sk_izin_operasional' => 'IZIN-OP-2024-002',
        'tanggal_sk_izin_operasional' => '2024-02-01',
        'status' => 'aktif',
        'tahun_berdiri' => 2024,
        'periode_berdiri' => '20241',
        'email' => 'febi@alyasini.ac.id',
        'website' => 'febi.alyasini.ac.id',
        'telepon' => '0343-421111',
        'alamat' => 'Kampus 2 Al-Yasini Pasuruan',
        'visi' => 'Menjadi fakultas ekonomi Islam unggul.',
        'misi' => 'Menyelenggarakan pendidikan ekonomi Islam berkarakter pesantren.',
    ];

    $response = $this->actingAs($superadmin)->post(route('master.fakultas.store'), $payload);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('fakultas', [
        'kode' => 'FEBI',
        'nama' => 'Fakultas Ekonomi dan Bisnis Islam',
        'no_sk_pendirian' => 'SK-DIKTI-2024-001',
        'email' => 'febi@alyasini.ac.id',
    ]);
});

test('can link dekan to master dosen with intelligent title accessor fallback', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $dosenUser = User::factory()->create([
        'name' => 'Dr. H. Ahmad Mustofa, M.Pd.',
        'user_type' => 'dosen',
    ]);

    $dosen = Dosen::create([
        'user_id' => $dosenUser->id,
        'nama_lengkap' => 'Ahmad Mustofa',
        'gelar_depan' => 'Dr. H.',
        'gelar_belakang' => 'M.Pd.',
        'nidn' => '2105058001',
        'niy_nip' => '198005052010011001',
        'status_aktif' => 'aktif',
    ]);

    // Create fakultas linked to Dosen
    $fakultas = Fakultas::create([
        'kode' => 'FTK',
        'nama' => 'Fakultas Tarbiyah',
        'dekan_dosen_id' => $dosen->id,
        'status' => 'aktif',
    ]);

    expect($fakultas->dekan)->not->toBeNull();
    expect($fakultas->dekan_nama_lengkap_bergelar)->toBe('Dr. H. Ahmad Mustofa, M.Pd.');

    // Fallback test: when dekan_dosen_id is null, use manual name and titles
    $fakultasManual = Fakultas::create([
        'kode' => 'FASIH',
        'nama' => 'Fakultas Syariah',
        'dekan_dosen_id' => null,
        'dekan_nama' => 'Zainul Arifin',
        'dekan_gelar_depan' => 'K.H.',
        'dekan_gelar_belakang' => 'M.H.',
        'status' => 'aktif',
    ]);

    expect($fakultasManual->dekan_nama_lengkap_bergelar)->toBe('K.H. Zainul Arifin, M.H.');
});

test('superadmin can update fakultas successfully', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $fakultas = Fakultas::create([
        'kode' => 'FTK',
        'nama' => 'Fakultas Tarbiyah Lama',
        'status' => 'nonaktif',
    ]);

    $response = $this->actingAs($superadmin)->put(route('master.fakultas.update', $fakultas), [
        'kode' => 'FTK',
        'nama' => 'Fakultas Tarbiyah dan Keguruan Baru',
        'status' => 'aktif',
        'nama_singkat' => 'FTK',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('fakultas', [
        'id' => $fakultas->id,
        'nama' => 'Fakultas Tarbiyah dan Keguruan Baru',
        'status' => 'aktif',
    ]);
});

test('superadmin can delete fakultas when it has no program studi', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $fakultas = Fakultas::create([
        'kode' => 'FKOSONG',
        'nama' => 'Fakultas Tanpa Prodi',
        'status' => 'nonaktif',
    ]);

    $response = $this->actingAs($superadmin)->delete(route('master.fakultas.destroy', $fakultas));

    $response->assertRedirect();
    $response->assertSessionHas('success');
    expect(Fakultas::find($fakultas->id))->toBeNull();
});

test('fakultas deletion is blocked when it has active program studi', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $fakultas = Fakultas::create([
        'kode' => 'FTKBLOK',
        'nama' => 'Fakultas Tarbiyah Ada Prodi',
        'status' => 'aktif',
    ]);

    ProgramStudi::create([
        'fakultas_id' => $fakultas->id,
        'kode' => 'PAIBLOK',
        'nama' => 'Pendidikan Agama Islam',
        'jenjang' => 'S1',
        'status' => 'aktif',
    ]);

    $response = $this->actingAs($superadmin)->delete(route('master.fakultas.destroy', $fakultas));

    $response->assertRedirect();
    $response->assertSessionHas('error');
    expect(Fakultas::find($fakultas->id))->not->toBeNull();
});

test('unauthorized roles cannot manage master fakultas', function () {
    $mahasiswa = User::factory()->create([
        'user_type' => 'mahasiswa',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $mahasiswa->assignRole('mahasiswa');

    $response = $this->actingAs($mahasiswa)->get(route('master.fakultas.index'));
    $response->assertForbidden();

    $responsePost = $this->actingAs($mahasiswa)->post(route('master.fakultas.store'), [
        'kode' => 'FHACK',
        'nama' => 'Fakultas Hacker',
        'status' => 'aktif',
    ]);
    $responsePost->assertForbidden();
});

test('getAvailableDosens query succeeds without unknown column error and resolves foto_url', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $dosenUser = User::factory()->create(['user_type' => 'dosen']);
    Dosen::create([
        'user_id' => $dosenUser->id,
        'nama_lengkap' => 'Dosen Foto Test',
        'gelar_depan' => 'Dr.',
        'gelar_belakang' => 'M.Kom.',
        'nidn' => '0712345678',
        'foto_path' => 'dosen/foto_test.jpg',
        'status_aktif' => 'aktif',
    ]);

    /** @var FakultasService $service */
    $service = app(FakultasService::class);
    $availableDosens = $service->getAvailableDosens();

    expect($availableDosens)->toHaveCount(1);
    expect($availableDosens->first()['foto_url'])->toContain('foto_test.jpg');
    expect($availableDosens->first()['nama_bergelar'])->toBe('Dr. Dosen Foto Test, M.Kom.');

    $fakultas = Fakultas::create([
        'kode' => 'FST',
        'nama' => 'Fakultas Sains dan Teknologi',
        'status' => 'aktif',
    ]);

    $this->actingAs($superadmin)->get(route('master.fakultas.index'))->assertOk();
    $this->actingAs($superadmin)->get(route('master.fakultas.show', $fakultas))->assertOk();
});

test('superadmin can record and delete riwayat pimpinan fakultas tenure', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $dosenUser = User::factory()->create(['user_type' => 'dosen']);
    $dosen = Dosen::create([
        'user_id' => $dosenUser->id,
        'nama_lengkap' => 'Dr. H. Ahmad Dahlan, M.Pd.I',
        'nidn' => '2101017501',
        'status_aktif' => 'aktif',
    ]);

    $fakultas = Fakultas::create([
        'kode' => 'FTK',
        'nama' => 'Fakultas Tarbiyah dan Keguruan',
        'status' => 'aktif',
    ]);

    // 1. Store leadership tenure record
    $response = $this->actingAs($superadmin)->post(route('master.fakultas.pimpinan.store', $fakultas), [
        'dosen_id' => $dosen->id,
        'jabatan' => 'dekan',
        'periode_mulai' => '2022-09-01',
        'periode_selesai' => '2026-08-31',
        'no_sk_pelantikan' => 'SK-YYS/012/IX/2022',
        'is_aktif' => true,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('riwayat_pimpinan_fakultas', [
        'fakultas_id' => $fakultas->id,
        'dosen_id' => $dosen->id,
        'jabatan' => 'dekan',
        'no_sk_pelantikan' => 'SK-YYS/012/IX/2022',
        'is_aktif' => true,
    ]);

    $tenure = RiwayatPimpinanFakultas::where('fakultas_id', $fakultas->id)->first();
    expect($tenure)->not->toBeNull();
    expect($tenure->jabatan_label)->toBe('Dekan');

    // 2. Delete leadership tenure record
    $deleteResponse = $this->actingAs($superadmin)->delete(route('master.fakultas.pimpinan.destroy', [
        'fakulta' => $fakultas->id,
        'pimpinan' => $tenure->id,
    ]));

    $deleteResponse->assertRedirect();
    $deleteResponse->assertSessionHas('success');
    expect(RiwayatPimpinanFakultas::find($tenure->id))->toBeNull();
});

test('can upload and store pdf documents for sk pendirian and sk izin operasional', function () {
    Storage::fake('public');

    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $fileSkPendirian = UploadedFile::fake()->create('sk_pendirian.pdf', 1024, 'application/pdf');
    $fileSkIzin = UploadedFile::fake()->create('sk_izin.pdf', 1024, 'application/pdf');

    $response = $this->actingAs($superadmin)->post(route('master.fakultas.store'), [
        'kode' => 'FPSI',
        'nama' => 'Fakultas Psikologi Islam',
        'status' => 'aktif',
        'no_sk_pendirian' => 'SK-DIKTI-2024-99',
        'file_sk_pendirian' => $fileSkPendirian,
        'no_sk_izin_operasional' => 'IZIN-BANPT-2024-88',
        'file_sk_izin_operasional' => $fileSkIzin,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $fakultas = Fakultas::where('kode', 'FPSI')->first();
    expect($fakultas)->not->toBeNull();
    expect($fakultas->file_sk_pendirian_path)->not->toBeNull();
    expect($fakultas->file_sk_izin_operasional_path)->not->toBeNull();
    expect($fakultas->file_sk_pendirian_url)->toContain('storage/documents/fakultas/');
    expect($fakultas->file_sk_izin_operasional_url)->toContain('storage/documents/fakultas/');

    Storage::disk('public')->assertExists($fakultas->file_sk_pendirian_path);
    Storage::disk('public')->assertExists($fakultas->file_sk_izin_operasional_path);
});

test('superadmin can trigger neo feeder synchronization', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $fakultas = Fakultas::create([
        'kode' => 'FAD',
        'nama' => 'Fakultas Adab dan Humaniora',
        'status' => 'aktif',
        'sync_status' => 'belum_sinkron',
    ]);

    $response = $this->actingAs($superadmin)->post(route('master.fakultas.sync-feeder', $fakultas));

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $fakultas->refresh();
    expect($fakultas->sync_status)->toBe('sinkron');
    expect($fakultas->last_synced_at)->not->toBeNull();
    expect($fakultas->id_feeder)->not->toBeNull();
});

test('fakultas service computes accurate academic kpi analytics', function () {
    $fakultas = Fakultas::create([
        'kode' => 'FUSH',
        'nama' => 'Fakultas Ushuluddin',
        'status' => 'aktif',
    ]);

    $prodi1 = ProgramStudi::create([
        'fakultas_id' => $fakultas->id,
        'kode' => 'IAT',
        'nama' => 'Ilmu Al-Qur`an dan Tafsir',
        'jenjang' => 'S1',
        'status' => 'aktif',
        'akreditasi' => 'Unggul',
    ]);

    $prodi2 = ProgramStudi::create([
        'fakultas_id' => $fakultas->id,
        'kode' => 'ILHA',
        'nama' => 'Ilmu Hadis',
        'jenjang' => 'S1',
        'status' => 'aktif',
        'akreditasi' => 'Baik Sekali',
    ]);

    // Create Homebase Dosen
    $dosenUser = User::factory()->create(['user_type' => 'dosen']);
    Dosen::create([
        'user_id' => $dosenUser->id,
        'program_studi_id' => $prodi1->id,
        'nama_lengkap' => 'Dosen Homebase IAT',
        'status_aktif' => 'aktif',
    ]);

    /** @var FakultasService $service */
    $service = app(FakultasService::class);
    $analytics = $service->getFakultasAnalytics($fakultas);

    expect($analytics['total_dosen_homebase'])->toBe(1);
    expect($analytics['distribusi_akreditasi']['Unggul'])->toBe(1);
    expect($analytics['distribusi_akreditasi']['Baik Sekali'])->toBe(1);
    expect($analytics['distribusi_akreditasi']['Baik'])->toBe(0);
    expect($analytics['rata_rata_ipk'])->toBe(3.38);
});

test('can assign full upps personalia with intelligent accessor fallbacks', function () {
    $dosenUser1 = User::factory()->create(['user_type' => 'dosen']);
    $wadek1 = Dosen::create([
        'user_id' => $dosenUser1->id,
        'nama_lengkap' => 'Muhammad Ali',
        'gelar_depan' => 'Dr.',
        'gelar_belakang' => 'M.Pd.',
        'status_aktif' => 'aktif',
    ]);

    $dosenUser2 = User::factory()->create(['user_type' => 'dosen']);
    $gpmf = Dosen::create([
        'user_id' => $dosenUser2->id,
        'nama_lengkap' => 'Fatimah Az-Zahra',
        'gelar_depan' => '',
        'gelar_belakang' => 'M.Ag.',
        'status_aktif' => 'aktif',
    ]);

    $pegawaiUser = User::factory()->create(['user_type' => 'staf_keuangan']);
    $tu = Pegawai::create([
        'user_id' => $pegawaiUser->id,
        'nama_lengkap' => 'Bambang Sutejo, S.Kom.',
        'nip_internal' => 'PEG-2024-009',
        'status_aktif' => 'aktif',
    ]);

    $fakultas = Fakultas::create([
        'kode' => 'FDIK',
        'nama' => 'Fakultas Dakwah dan Komunikasi',
        'status' => 'aktif',
        'wakil_dekan_1_dosen_id' => $wadek1->id,
        'ketua_gpmf_dosen_id' => $gpmf->id,
        'kepala_tata_usaha_pegawai_id' => $tu->id,
    ]);

    expect($fakultas->wakil_dekan_1_nama_lengkap_bergelar)->toBe('Dr. Muhammad Ali, M.Pd.');
    expect($fakultas->ketua_gpmf_nama_lengkap_bergelar)->toBe('Fatimah Az-Zahra, M.Ag.');
    expect($fakultas->kepala_tata_usaha_nama_lengkap)->toBe('Bambang Sutejo, S.Kom.');

    // Fallback test: when Wadek 1 dosen id is null, fall back to manual text
    $fakultasManual = Fakultas::create([
        'kode' => 'FMAN',
        'nama' => 'Fakultas Manual',
        'status' => 'aktif',
        'wakil_dekan_1' => 'Drs. H. M. Ridwan, M.Pd.',
    ]);

    expect($fakultasManual->wakil_dekan_1_nama_lengkap_bergelar)->toBe('Drs. H. M. Ridwan, M.Pd.');
});
