<?php

use App\Models\Dosen;
use App\Models\DosenPengajar;
use App\Models\JadwalPerkuliahan;
use App\Models\KelasKuliah;
use App\Models\KurikulumMatakuliah;
use App\Models\KurikulumProdi;
use App\Models\Matakuliah;
use App\Models\ProgramStudi;
use App\Models\RuangKuliah;
use App\Models\TahunAjaran;
use App\Models\User;
use App\Services\ScheduleConflictValidationService;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
    $this->artisan('db:seed', ['--class' => 'MasterDataSeeder']);
});

test('kurikulum is_active rule enforces only one active kurikulum per program studi', function () {
    $prodi = ProgramStudi::first();

    $kurikulum1 = KurikulumProdi::create([
        'program_studi_id' => $prodi->id,
        'tahun_kurikulum' => '2024',
        'is_active' => true,
    ]);

    expect($kurikulum1->fresh()->is_active)->toBeTrue();

    // Create 2nd kurikulum and set to active
    $userAdmin = User::factory()->create(['user_type' => 'pegawai', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $userAdmin->assignRole('superadmin');

    $this->actingAs($userAdmin);

    $this->post(route('akademik.kurikulum.store'), [
        'program_studi_id' => $prodi->id,
        'tahun_kurikulum' => '2026',
        'is_active' => true,
    ]);

    // 1st kurikulum must now be deactivated automatically
    expect($kurikulum1->fresh()->is_active)->toBeFalse();
    $kurikulum2 = KurikulumProdi::where('tahun_kurikulum', '2026')->first();
    expect($kurikulum2->is_active)->toBeTrue();
});

test('ScheduleConflictValidationService rejects room schedule conflict with explicit error message', function () {
    $conflictService = app(ScheduleConflictValidationService::class);

    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();
    $ruang = RuangKuliah::firstOrCreate(['kode' => 'RK101', 'nama' => 'Ruang 101', 'kapasitas' => 40]);

    $mk1 = Matakuliah::create(['kode' => 'MK001', 'nama' => 'Fiqih I', 'sks' => 3, 'jenis' => 'wajib']);
    $mk2 = Matakuliah::create(['kode' => 'MK002', 'nama' => 'Aqidah I', 'sks' => 3, 'jenis' => 'wajib']);

    $kurikulum = KurikulumProdi::create(['program_studi_id' => $prodi->id, 'tahun_kurikulum' => '2026', 'is_active' => true]);
    $km1 = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk1->id, 'semester' => 1]);
    $km2 = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk2->id, 'semester' => 1]);

    $kelas1 = KelasKuliah::create(['kurikulum_matakuliah_id' => $km1->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'nama_kelas' => 'A', 'kuota' => 30]);
    $kelas2 = KelasKuliah::create(['kurikulum_matakuliah_id' => $km2->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'nama_kelas' => 'B', 'kuota' => 30]);

    // Jadwal 1: Room 101, Monday 08:00 - 10:30
    JadwalPerkuliahan::create([
        'kelas_kuliah_id' => $kelas1->id,
        'ruang_kuliah_id' => $ruang->id,
        'hari' => 'Senin',
        'jam_mulai' => '08:00:00',
        'jam_selesai' => '10:30:00',
    ]);

    // Attempting to schedule Class 2 in Room 101 on Monday 09:00 - 11:30 (Overlap!) MUST FAIL
    try {
        $conflictService->validate($kelas2->id, $ruang->id, 'Senin', '09:00', '11:30');
        $this->fail('Expected ValidationException was not thrown.');
    } catch (ValidationException $e) {
        $errorMessage = $e->errors()['ruang_kuliah_id'][0] ?? '';
        expect($errorMessage)->toContain('BENTROK RUANG KULIAH');
        expect($errorMessage)->toContain($ruang->nama);
        expect($errorMessage)->toContain($mk1->nama);
    }
});

test('updating class schedule without changing time does not trigger self conflict', function () {
    $conflictService = app(ScheduleConflictValidationService::class);

    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();
    $ruang = RuangKuliah::firstOrCreate(['kode' => 'RK102', 'nama' => 'Ruang 102', 'kapasitas' => 40]);

    $dosenUser = User::factory()->create(['user_type' => 'dosen']);
    $dosen = Dosen::create(['user_id' => $dosenUser->id, 'program_studi_id' => $prodi->id, 'nidn' => '0099887766', 'nama_lengkap' => 'Dr. Self Test']);

    $mk = Matakuliah::create(['kode' => 'MKSELF', 'nama' => 'Matakuliah Self Edit', 'sks' => 3, 'jenis' => 'wajib']);
    $kurikulum = KurikulumProdi::create(['program_studi_id' => $prodi->id, 'tahun_kurikulum' => '2026', 'is_active' => true]);
    $km = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk->id, 'semester' => 1]);

    $kelas = KelasKuliah::create(['kurikulum_matakuliah_id' => $km->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'nama_kelas' => 'A', 'kuota' => 30]);
    DosenPengajar::create(['kelas_kuliah_id' => $kelas->id, 'dosen_id' => $dosen->id, 'peran' => 'utama']);

    $jadwal = JadwalPerkuliahan::create([
        'kelas_kuliah_id' => $kelas->id,
        'ruang_kuliah_id' => $ruang->id,
        'hari' => 'Selasa',
        'jam_mulai' => '08:00:00',
        'jam_selesai' => '10:30:00',
    ]);

    // Updating class details (e.g. updating kuota / edit submit) with same time and room MUST SUCCEED (no self conflict)
    expect(fn () => $conflictService->validate($kelas->id, $ruang->id, 'Selasa', '08:00', '10:30', [$dosen->id], $jadwal->id))
        ->not->toThrow(ValidationException::class);
});

test('ScheduleConflictValidationService rejects lecturer schedule conflict with explicit error message', function () {
    $conflictService = app(ScheduleConflictValidationService::class);

    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();
    $ruang1 = RuangKuliah::firstOrCreate(['kode' => 'RK201', 'nama' => 'Ruang 201', 'kapasitas' => 40]);
    $ruang2 = RuangKuliah::firstOrCreate(['kode' => 'RK202', 'nama' => 'Ruang 202', 'kapasitas' => 40]);

    $dosenUser = User::factory()->create(['user_type' => 'dosen']);
    $dosen = Dosen::create(['user_id' => $dosenUser->id, 'program_studi_id' => $prodi->id, 'nidn' => '0011223344', 'nama_lengkap' => 'Dr. Ahmad']);

    $mk1 = Matakuliah::create(['kode' => 'MK003', 'nama' => 'Hadits I', 'sks' => 3, 'jenis' => 'wajib']);
    $mk2 = Matakuliah::create(['kode' => 'MK004', 'nama' => 'Tafsir I', 'sks' => 3, 'jenis' => 'wajib']);

    $kurikulum = KurikulumProdi::create(['program_studi_id' => $prodi->id, 'tahun_kurikulum' => '2026', 'is_active' => true]);
    $km1 = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk1->id, 'semester' => 1]);
    $km2 = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk2->id, 'semester' => 1]);

    $kelas1 = KelasKuliah::create(['kurikulum_matakuliah_id' => $km1->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'nama_kelas' => 'A', 'kuota' => 30]);
    $kelas2 = KelasKuliah::create(['kurikulum_matakuliah_id' => $km2->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'nama_kelas' => 'B', 'kuota' => 30]);

    DosenPengajar::create(['kelas_kuliah_id' => $kelas1->id, 'dosen_id' => $dosen->id, 'peran' => 'utama']);

    // Class 1 schedule: Monday 08:00 - 10:30 in Room 201
    JadwalPerkuliahan::create([
        'kelas_kuliah_id' => $kelas1->id,
        'ruang_kuliah_id' => $ruang1->id,
        'hari' => 'Senin',
        'jam_mulai' => '08:00:00',
        'jam_selesai' => '10:30:00',
    ]);

    // Attempting to assign Dr. Ahmad to Class 2 on Monday 09:30 - 12:00 in Room 202 (Overlap!) MUST FAIL
    try {
        $conflictService->validate($kelas2->id, $ruang2->id, 'Senin', '09:30', '12:00', [$dosen->id]);
        $this->fail('Expected ValidationException for lecturer conflict was not thrown.');
    } catch (ValidationException $e) {
        $errorMessage = $e->errors()['dosen_ids'][0] ?? '';
        expect($errorMessage)->toContain('BENTROK JADWAL DOSEN');
        expect($errorMessage)->toContain($dosen->nama_lengkap);
        expect($errorMessage)->toContain($mk1->nama);
    }
});

test('RBAC restricts curriculum and class CRUD to admin_akademik while allowing kaprodi view-only access', function () {
    $prodi = ProgramStudi::first();

    $userKaprodi = User::factory()->create(['user_type' => 'dosen']);
    $userKaprodi->assignRole('kaprodi');

    // 1. Kaprodi can VIEW curriculum, courses, and classes
    $this->actingAs($userKaprodi);
    $this->get('/akademik/matakuliah')->assertStatus(200);
    $this->get('/akademik/kurikulum')->assertStatus(200);
    $this->get('/akademik/kelas-kuliah')->assertStatus(200);

    // 2. Kaprodi attempting WRITE actions MUST be rejected with HTTP 403 Forbidden
    $this->post('/akademik/matakuliah', [
        'kode' => 'MKFORBID',
        'nama' => 'Forbidden Course',
        'sks' => 3,
        'jenis' => 'wajib',
    ])->assertStatus(403);

    $this->post('/akademik/kurikulum', [
        'program_studi_id' => $prodi->id,
        'tahun_kurikulum' => '2027',
        'is_active' => true,
    ])->assertStatus(403);

    // 3. Admin Akademik can perform full WRITE actions
    $userAdmin = User::factory()->create(['user_type' => 'pegawai']);
    $userAdmin->assignRole('admin_akademik');
    $this->actingAs($userAdmin);

    $this->post('/akademik/matakuliah', [
        'kode' => 'MKALLOW',
        'nama' => 'Allowed Course',
        'sks' => 3,
        'jenis' => 'wajib',
    ])->assertRedirect();
});

test('Superadmin and admin akademik can search kelas kuliah without database error', function () {
    $userAdmin = User::factory()->create(['user_type' => 'pegawai', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $userAdmin->assignRole('admin_akademik');
    $this->actingAs($userAdmin);

    $responseSearch = $this->get(route('akademik.kelas-kuliah.index', ['search' => 'Kelas']));
    $responseSearch->assertOk();

    $responseCourse = $this->get(route('akademik.kelas-kuliah.index', ['search' => 'Tafsir']));
    $responseCourse->assertOk();
});
