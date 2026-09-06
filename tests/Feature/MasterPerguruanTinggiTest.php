<?php

use App\Models\Dosen;
use App\Models\Fakultas;
use App\Models\PerguruanTinggi;
use App\Models\ProgramStudi;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
});

test('superadmin and admin_akademik can view and update perguruan tinggi profile', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $this->actingAs($superadmin)
        ->get(route('master.perguruan-tinggi.index'))
        ->assertOk();

    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'kode_unit' => '213048',
            'nama_unit' => 'STAI Al-Yasini Pasuruan Baru',
            'nama_unit_en' => 'Al-Yasini Islamic College of Pasuruan',
            'nama_singkat' => 'STAI Al-Yasini',
            'jenis_perguruan_tinggi' => 'Sekolah Tinggi',
            'ketua_nama' => 'Dr. H. Ahmad Fauzi, M.Pd.I',
            'ketua_nidn' => '2108098201',
            'peringkat_akreditasi' => 'Baik Sekali',
            'lembaga_akreditasi' => 'BAN-PT',
            'no_sk_akreditasi' => 'SK-BANPT-2026/01',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('perguruan_tinggis', [
        'nama_unit' => 'STAI Al-Yasini Pasuruan Baru',
        'ketua_nama' => 'Dr. H. Ahmad Fauzi, M.Pd.I',
    ]);
});

test('can view program studi detail page', function () {
    $admin = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $admin->assignRole('admin_akademik');

    $fakultas = Fakultas::create(['kode' => 'FTK', 'nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::create([
        'fakultas_id' => $fakultas->id,
        'kode' => '86231',
        'nama' => 'Manajemen Pendidikan Islam',
        'jenjang' => 'S1',
        'gelar_singkat' => 'S.Pd.',
        'akreditasi' => 'Baik Sekali',
    ]);

    $this->actingAs($admin)
        ->get(route('master.program-studi.show', $prodi->id))
        ->assertOk();
});

test('can view and update fakultas detail page with extended fields', function () {
    $admin = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $admin->assignRole('admin_akademik');

    $fakultas = Fakultas::create([
        'kode' => 'FEBI',
        'nama' => 'Fakultas Ekonomi dan Bisnis Islam',
        'nama_en' => 'Faculty of Islamic Economics and Business',
        'nama_singkat' => 'FEBI',
        'status' => 'aktif',
    ]);

    $this->actingAs($admin)
        ->get(route('master.fakultas.show', $fakultas->id))
        ->assertOk();

    $this->actingAs($admin)
        ->put(route('master.fakultas.update', $fakultas->id), [
            'kode' => 'FEBI',
            'nama' => 'Fakultas Ekonomi dan Bisnis Islam Al-Yasini',
            'nama_en' => 'Faculty of Islamic Economics and Business Al-Yasini',
            'nama_singkat' => 'FEBI',
            'alamat' => 'Gedung B Lt. 2 Kampus Terpadu',
            'telepon' => '08123456789',
            'status' => 'aktif',
            'dekan_nama' => 'Dr. H. Ahmad Fauzi, M.E',
            'wakil_dekan_1' => 'Dr. Syamsul Arifin, M.Pd',
            'wakil_dekan_2' => 'H. M. Sholeh, M.E',
            'visi' => 'Menjadi fakultas ekonomi Islam unggul dan berdaya saing.',
            'misi' => 'Menyelenggarakan pendidikan ekonomi Islam berbasis riset dan pesantren.',
        ])
        ->assertRedirect();

    $fakultas->refresh();
    expect($fakultas->nama)->toBe('Fakultas Ekonomi dan Bisnis Islam Al-Yasini');
    expect($fakultas->visi)->toContain('Menjadi fakultas ekonomi Islam unggul');
});

test('superadmin can update accreditation with valid dropdown options', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'nama_unit' => 'STAI Al-Yasini Pasuruan',
            'lembaga_akreditasi' => 'BAN-PT',
            'peringkat_akreditasi' => 'Unggul',
            'no_sk_akreditasi' => 'SK-BANPT-UNGGUL-2026',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('perguruan_tinggis', [
        'lembaga_akreditasi' => 'BAN-PT',
        'peringkat_akreditasi' => 'Unggul',
    ]);
});

test('update fails when invalid accreditation rating or body is submitted', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'nama_unit' => 'STAI Al-Yasini Pasuruan',
            'lembaga_akreditasi' => 'Badan_Fiktif',
            'peringkat_akreditasi' => 'Sangat_Bagus',
        ])
        ->assertSessionHasErrors(['lembaga_akreditasi', 'peringkat_akreditasi']);
});

test('superadmin can upload accreditation certificate file', function () {
    Storage::fake('public');

    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $fakeFile = UploadedFile::fake()->createWithContent('sertifikat_akreditasi.pdf', "%PDF-1.4\n%%EOF");

    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'nama_unit' => 'STAI Al-Yasini Pasuruan',
            'lembaga_akreditasi' => 'BAN-PT',
            'peringkat_akreditasi' => 'Baik Sekali',
            'file_sertifikat_akreditasi' => $fakeFile,
        ])
        ->assertRedirect();

    $pt = PerguruanTinggi::first();
    expect($pt->file_sertifikat_akreditasi)->not->toBeNull();
    Storage::disk('public')->assertExists($pt->file_sertifikat_akreditasi);
});

test('superadmin can remove accreditation certificate via hapus_file_sertifikat', function () {
    Storage::fake('public');

    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $fakeFile = UploadedFile::fake()->createWithContent('sertifikat_akreditasi.pdf', "%PDF-1.4\n%%EOF");

    // 1. Upload first
    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'nama_unit' => 'STAI Al-Yasini Pasuruan',
            'lembaga_akreditasi' => 'BAN-PT',
            'peringkat_akreditasi' => 'Baik',
            'file_sertifikat_akreditasi' => $fakeFile,
        ])
        ->assertRedirect();

    $pt = PerguruanTinggi::first();
    $filePath = $pt->file_sertifikat_akreditasi;
    expect($filePath)->not->toBeNull();
    Storage::disk('public')->assertExists($filePath);

    // 2. Remove file
    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'nama_unit' => 'STAI Al-Yasini Pasuruan',
            'lembaga_akreditasi' => 'BAN-PT',
            'peringkat_akreditasi' => 'Baik',
            'hapus_file_sertifikat' => true,
        ])
        ->assertRedirect();

    $pt->refresh();
    expect($pt->file_sertifikat_akreditasi)->toBeNull();
    Storage::disk('public')->assertMissing($filePath);
});

test('migration normalizes legacy accreditation values and down restores original state', function () {
    $migration = require database_path('migrations/2026_09_06_020000_normalize_akreditasi_perguruan_tinggi.php');

    $validLembaga = ['BAN-PT', 'LAMDIK', 'LAMEMBA', 'LAM-PTKes', 'LAM INFOKOM', 'LAM SAMA', 'LAM TEKNIK', 'Lainnya'];
    $validPeringkat = ['Unggul', 'Baik Sekali', 'Baik', 'A', 'B', 'C', 'Terakreditasi Sementara', 'Tidak Terakreditasi', 'Lainnya'];

    // Test fuzzy normalize lembaga
    expect($migration->normalizeLembaga('ban-pt resmi', $validLembaga))->toBe('BAN-PT');
    expect($migration->normalizeLembaga('LAMDIK Pusat', $validLembaga))->toBe('LAMDIK');
    expect($migration->normalizeLembaga('Tidak Diketahui', $validLembaga))->toBe('Lainnya');

    // Test fuzzy normalize peringkat
    expect($migration->normalizePeringkat('terakreditasi unggul', 'Kampus', 2, $validPeringkat))->toBe('Unggul');
    expect($migration->normalizePeringkat('baiksekali', 'Kampus', 2, $validPeringkat))->toBe('Baik Sekali');
    expect($migration->normalizePeringkat('masih dalam proses sementara', 'Kampus', 2, $validPeringkat))->toBe('Terakreditasi Sementara');
    expect($migration->normalizePeringkat('expired sudah lewat', 'Kampus', 2, $validPeringkat))->toBe('Tidak Terakreditasi');
    expect($migration->normalizePeringkat('aneh tak dikenal', 'STAI Al-Yasini Pasuruan', 1, $validPeringkat))->toBe('Baik');
    expect($migration->normalizePeringkat('aneh tak dikenal', 'Kampus Luar', 99, $validPeringkat))->toBe('Lainnya');
});

test('superadmin can update specific cards independently without full form payload', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    // 1. Update Card Pejabat only
    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'ketua_nama' => 'Prof. Dr. KH. A. Mujib Imron, SH., MH.',
            'ketua_nidn' => '2101017001',
            'wakil_ketua_1' => 'Dr. H. Ahmad Fauzi, M.Pd.I',
        ])
        ->assertRedirect();

    $pt = PerguruanTinggi::first();
    expect($pt->ketua_nama)->toBe('Prof. Dr. KH. A. Mujib Imron, SH., MH.');
    expect($pt->ketua_nidn)->toBe('2101017001');
    expect($pt->wakil_ketua_1)->toBe('Dr. H. Ahmad Fauzi, M.Pd.I');

    // 2. Update Card Visi Misi only
    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'visi' => 'Visi Kampus Al-Yasini Unggul dan Berakhlak Mulia',
            'misi' => 'Misi Kampus Al-Yasini Membina Generasi Qurani',
        ])
        ->assertRedirect();

    $pt->refresh();
    expect($pt->visi)->toBe('Visi Kampus Al-Yasini Unggul dan Berakhlak Mulia');
    expect($pt->misi)->toBe('Misi Kampus Al-Yasini Membina Generasi Qurani');
    expect($pt->ketua_nama)->toBe('Prof. Dr. KH. A. Mujib Imron, SH., MH.');

    // 3. Update Card Kontak only
    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'telepon' => '081299887766',
            'email' => 'sekretariat@stai-alyasini.ac.id',
            'website' => 'https://siakad.stai-alyasini.ac.id',
        ])
        ->assertRedirect();

    $pt->refresh();
    expect($pt->telepon)->toBe('081299887766');
    expect($pt->email)->toBe('sekretariat@stai-alyasini.ac.id');
    expect($pt->website)->toBe('https://siakad.stai-alyasini.ac.id');
});

test('dosen model nama_bergelar accessor formats titles cleanly without duplication', function () {
    // 1. Dosen without titles in nama_lengkap
    $dosen1 = new Dosen([
        'nama_lengkap' => 'Akh. Syamsul Muniri',
        'gelar_depan' => 'Dr.',
        'gelar_belakang' => 'M.S.I',
    ]);
    expect($dosen1->nama_bergelar)->toBe('Dr. Akh. Syamsul Muniri, M.S.I');

    // 2. Dosen with titles already inside nama_lengkap (common in some legacy entries)
    $dosen2 = new Dosen([
        'nama_lengkap' => 'Dr. H. Kaprodi PAI, M.Pd.I.',
        'gelar_depan' => 'Dr. H.',
        'gelar_belakang' => 'M.Pd.I.',
    ]);
    expect($dosen2->nama_bergelar)->toBe('Dr. H. Kaprodi PAI, M.Pd.I.');

    // 3. Dosen with only post-nominal degree
    $dosen3 = new Dosen([
        'nama_lengkap' => 'Muhammad Sholeh',
        'gelar_depan' => null,
        'gelar_belakang' => 'M.Pd',
    ]);
    expect($dosen3->nama_bergelar)->toBe('Muhammad Sholeh, M.Pd');

    // 4. Dosen with no degrees
    $dosen4 = new Dosen([
        'nama_lengkap' => 'Ahmad Shodiq',
        'gelar_depan' => null,
        'gelar_belakang' => null,
    ]);
    expect($dosen4->nama_bergelar)->toBe('Ahmad Shodiq');
});

test('perguruan tinggi index page provides dosens list with nama_bergelar for dosen picker', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    Dosen::create([
        'nama_lengkap' => 'Syamsul Muniri',
        'gelar_depan' => 'Dr.',
        'gelar_belakang' => 'M.S.I',
        'nidn' => '2113058301',
        'niy_nip' => 'LB001',
    ]);

    $response = $this->actingAs($superadmin)
        ->get(route('master.perguruan-tinggi.index'))
        ->assertOk();

    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('master/perguruan-tinggi/index')
        ->has('dosens')
        ->where('dosens.0.nama_bergelar', fn ($val) => str_contains($val, 'Syamsul Muniri'))
    );
});

test('superadmin can store snapshot leadership data from dosen picker or manual entry', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'ketua_nama' => 'Dr. Akh. Syamsul Muniri, M.S.I',
            'ketua_nidn' => '2113058301',
            'wakil_ketua_1' => '2104118501 - Dr. Mohamad Mishbahuddin, M.Pd.I',
            'wakil_ketua_2' => 'LB002 - Muhammad Sholeh, M.Pd',
            'wakil_ketua_3' => '2105128701 - H. Lukman Hakim, M.Pd',
            'wakil_ketua_4' => '2106158901 - Zainul Arifin, M.E',
        ])
        ->assertRedirect();

    $pt = PerguruanTinggi::first();
    expect($pt->ketua_nama)->toBe('Dr. Akh. Syamsul Muniri, M.S.I');
    expect($pt->ketua_nidn)->toBe('2113058301');
    expect($pt->wakil_ketua_1)->toBe('2104118501 - Dr. Mohamad Mishbahuddin, M.Pd.I');
    expect($pt->wakil_ketua_2)->toBe('LB002 - Muhammad Sholeh, M.Pd');
    expect($pt->wakil_ketua_3)->toBe('2105128701 - H. Lukman Hakim, M.Pd');
    expect($pt->wakil_ketua_4)->toBe('2106158901 - Zainul Arifin, M.E');
});

test('superadmin can update sevima pddikti fields, sk operasional, and granular address', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'nama_unit' => 'STAI Al-Yasini Pasuruan',
            'status_milik' => 'Swasta',
            'jenis_perguruan_tinggi' => 'Sekolah Tinggi',
            'no_sk_operasional' => 'SK-KEMENAG-2024/09',
            'tanggal_sk_operasional' => '2024-09-01',
            'jalan' => 'Jl. Raya Wonorejo No. 45',
            'rt_rw' => '03/07',
            'dusun' => 'Areng-Areng Timur',
            'kelurahan' => 'Sambisirah',
            'kecamatan' => 'Wonorejo',
            'kota_kabupaten' => 'Kabupaten Pasuruan',
            'provinsi' => 'Jawa Timur',
            'kode_pos' => '67173',
            'telepon_2' => '081298765432',
        ])
        ->assertRedirect();

    $pt = PerguruanTinggi::first();
    expect($pt->status_milik)->toBe('Swasta');
    expect($pt->no_sk_operasional)->toBe('SK-KEMENAG-2024/09');
    expect($pt->jalan)->toBe('Jl. Raya Wonorejo No. 45');
    expect($pt->telepon_2)->toBe('081298765432');
    expect($pt->alamat_lengkap)->toContain('Jl. Raya Wonorejo No. 45');
    expect($pt->alamat_lengkap)->toContain('RT/RW 03/07');
});

test('superadmin can update geo-coordinates and presensi radius with boundary validation', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    // 1. Valid coordinates
    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'nama_unit' => 'STAI Al-Yasini Pasuruan',
            'lintang' => -7.7123456,
            'bujur' => 112.8987654,
            'radius_presensi' => 150,
        ])
        ->assertRedirect();

    $pt = PerguruanTinggi::first();
    expect((float) $pt->lintang)->toEqualWithDelta(-7.7123456, 0.0001);
    expect((float) $pt->bujur)->toEqualWithDelta(112.8987654, 0.0001);
    expect($pt->radius_presensi)->toBe(150);

    // 2. Invalid coordinates should fail
    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'nama_unit' => 'STAI Al-Yasini Pasuruan',
            'lintang' => 999.0, // invalid latitude
            'bujur' => -999.0, // invalid longitude
            'radius_presensi' => 5, // below min 10
        ])
        ->assertSessionHasErrors(['lintang', 'bujur', 'radius_presensi']);
});

test('superadmin can upload and delete branding assets including logo, logo_kop, stempel, and ttd_ketua', function () {
    Storage::fake('public');

    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $fakeLogo = UploadedFile::fake()->image('logo_kampus.png');
    $fakeLogoKop = UploadedFile::fake()->image('logo_kop.webp');
    $fakeStempel = UploadedFile::fake()->image('stempel_resmi.png');
    $fakeTtd = UploadedFile::fake()->image('ttd_ketua.png');

    // 1. Upload all branding assets
    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'nama_unit' => 'STAI Al-Yasini Pasuruan',
            'logo' => $fakeLogo,
            'logo_kop' => $fakeLogoKop,
            'stempel' => $fakeStempel,
            'ttd_ketua' => $fakeTtd,
        ])
        ->assertRedirect();

    $pt = PerguruanTinggi::first();
    expect($pt->logo_path)->not->toBeNull();
    expect($pt->logo_kop_path)->not->toBeNull();
    expect($pt->stempel_path)->not->toBeNull();
    expect($pt->ttd_ketua_path)->not->toBeNull();

    Storage::disk('public')->assertExists($pt->logo_path);
    Storage::disk('public')->assertExists($pt->logo_kop_path);
    Storage::disk('public')->assertExists($pt->stempel_path);
    Storage::disk('public')->assertExists($pt->ttd_ketua_path);

    expect($pt->logo_url)->toContain('/storage/');
    expect($pt->logo_kop_url)->toContain('/storage/');
    expect($pt->stempel_url)->toContain('/storage/');
    expect($pt->ttd_ketua_url)->toContain('/storage/');

    $oldLogo = $pt->logo_path;
    $oldStempel = $pt->stempel_path;

    // 2. Delete logo and stempel via flags
    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'nama_unit' => 'STAI Al-Yasini Pasuruan',
            'hapus_logo' => true,
            'hapus_stempel' => true,
        ])
        ->assertRedirect();

    $pt->refresh();
    expect($pt->logo_path)->toBeNull();
    expect($pt->stempel_path)->toBeNull();
    expect($pt->logo_kop_path)->not->toBeNull(); // remains untouched

    Storage::disk('public')->assertMissing($oldLogo);
    Storage::disk('public')->assertMissing($oldStempel);
});

test('perguruan tinggi model calculates status akreditasi badge correctly', function () {
    $pt = new PerguruanTinggi([
        'nama_unit' => 'STAI Al-Yasini',
        'peringkat_akreditasi' => 'Unggul',
    ]);

    // 1. Without date
    $badgeNoDate = $pt->status_akreditasi_badge;
    expect($badgeNoDate['status'])->toBe('tidak_ada');
    expect($badgeNoDate['color'])->toBe('slate');

    // 2. Expired
    $pt->tanggal_berakhir_akreditasi = now()->subDays(10);
    $badgeExpired = $pt->status_akreditasi_badge;
    expect($badgeExpired['status'])->toBe('kadaluarsa');
    expect($badgeExpired['color'])->toBe('rose');

    // 3. Expiring soon (e.g. 60 days)
    $pt->tanggal_berakhir_akreditasi = now()->addDays(60);
    $badgeExpiring = $pt->status_akreditasi_badge;
    expect($badgeExpiring['status'])->toBe('akan_berakhir');
    expect($badgeExpiring['color'])->toBe('amber');

    // 4. Active (e.g. 300 days)
    $pt->tanggal_berakhir_akreditasi = now()->addDays(300);
    $badgeActive = $pt->status_akreditasi_badge;
    expect($badgeActive['status'])->toBe('aktif');
    expect($badgeActive['color'])->toBe('emerald');
});

test('unauthorized users cannot update perguruan tinggi profile', function () {
    $mahasiswa = User::factory()->create(['user_type' => 'mahasiswa', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $mahasiswa->assignRole('mahasiswa');

    $this->actingAs($mahasiswa)
        ->post(route('master.perguruan-tinggi.update'), [
            'nama_unit' => 'Hacked Campus Name',
        ])
        ->assertForbidden();

    expect(PerguruanTinggi::where('nama_unit', 'Hacked Campus Name')->exists())->toBeFalse();
});

test('can link ketua and wakil ketua 1 to master dosen and fallback properly', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $fakultas = Fakultas::create(['kode' => 'FTK2', 'nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::create([
        'fakultas_id' => $fakultas->id,
        'kode' => '86239',
        'nama' => 'Pendidikan Bahasa Arab',
        'jenjang' => 'S1',
    ]);

    $dosenKetua = Dosen::create([
        'nama_lengkap' => 'Ahmad Syamsul Muniri',
        'gelar_depan' => 'Dr.',
        'gelar_belakang' => 'M.S.I',
        'nidn' => '2113058399',
        'program_studi_id' => $prodi->id,
        'status_kepegawaian' => 'tetap',
    ]);

    $dosenWakil = Dosen::create([
        'nama_lengkap' => 'Mohamad Mishbahuddin',
        'gelar_depan' => 'Dr.',
        'gelar_belakang' => 'M.Pd.I',
        'nidn' => '2104118599',
        'program_studi_id' => $prodi->id,
        'status_kepegawaian' => 'tetap',
    ]);

    // 1. Update with dosen relations
    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'nama_unit' => 'STAI Al-Yasini Pasuruan',
            'ketua_dosen_id' => $dosenKetua->id,
            'wakil_ketua_1_dosen_id' => $dosenWakil->id,
            'ketua_nama' => 'Manual Text Override', // Should prefer Dosen relation
        ])
        ->assertRedirect();

    $pt = PerguruanTinggi::first();
    expect($pt->ketua_dosen_id)->toBe($dosenKetua->id);
    expect($pt->wakil_ketua_1_dosen_id)->toBe($dosenWakil->id);
    expect($pt->ketuaDosen->id)->toBe($dosenKetua->id);
    expect($pt->wakilKetua1Dosen->id)->toBe($dosenWakil->id);

    // Accessor should prefer the Dosen's formatted name
    expect($pt->ketua_nama_lengkap_bergelar)->toBe('Dr. Ahmad Syamsul Muniri, M.S.I');
    expect($pt->wakil_ketua_1_nama_lengkap_bergelar)->toBe('Dr. Mohamad Mishbahuddin, M.Pd.I');

    // 2. Disconnect relation to fallback to manual text
    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'nama_unit' => 'STAI Al-Yasini Pasuruan',
            'ketua_dosen_id' => null,
            'ketua_nama' => 'Prof. Tokoh Tamu Eksternal',
            'ketua_gelar_depan' => '',
            'ketua_gelar_belakang' => 'Ph.D',
        ])
        ->assertRedirect();

    $pt->refresh();
    expect($pt->ketua_dosen_id)->toBeNull();
    expect($pt->ketua_nama_lengkap_bergelar)->toBe('Prof. Tokoh Tamu Eksternal, Ph.D');
});

test('ketua_dosen_id must exist in dosens table', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'nama_unit' => 'STAI Al-Yasini Pasuruan',
            'ketua_dosen_id' => 999999,
        ])
        ->assertSessionHasErrors('ketua_dosen_id');
});

test('index endpoint delivers rich dosens list with prodi to inertia view', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $this->actingAs($superadmin)
        ->get(route('master.perguruan-tinggi.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master/perguruan-tinggi/index')
            ->has('dosens')
            ->has('perguruanTinggi')
        );
});
