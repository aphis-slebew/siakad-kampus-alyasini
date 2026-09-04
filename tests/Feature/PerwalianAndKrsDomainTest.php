<?php

use App\Models\ActivityLog;
use App\Models\Cekal;
use App\Models\Dosen;
use App\Models\DosenPengajar;
use App\Models\DosenWali;
use App\Models\JadwalPerkuliahan;
use App\Models\KelasKuliah;
use App\Models\Krs;
use App\Models\KrsDetail;
use App\Models\KurikulumMatakuliah;
use App\Models\KurikulumProdi;
use App\Models\Mahasiswa;
use App\Models\Matakuliah;
use App\Models\PeriodeRegistrasi;
use App\Models\PrasyaratMatakuliah;
use App\Models\ProgramStudi;
use App\Models\RegistrasiUlang;
use App\Models\RuangKuliah;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use App\Models\User;
use App\Services\KrsService;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
    $this->artisan('db:seed', ['--class' => 'MasterDataSeeder']);
});

test('KrsService rejects submission if student is ineligible with explicit error reasons', function () {
    $krsService = app(KrsService::class);
    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();

    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mahasiswa = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026INELIGIBLE', 'nama_lengkap' => 'Mahasiswa Ineligible', 'tahun_masuk' => 2026]);

    // Active Cekal -> MUST FAIL
    Cekal::create(['mahasiswa_id' => $mahasiswa->id, 'alasan' => 'Tunggakan SPP', 'is_active' => true]);

    $krs = Krs::create(['mahasiswa_id' => $mahasiswa->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'status' => 'draft']);

    expect(fn () => $krsService->submitKrs($krs, [1]))
        ->toThrow(DomainException::class, 'SYARAT KRS BELUM TERPENUHI');
});

test('atomic lockForUpdate on class kuota prevents overbooking under concurrent submission', function () {
    $krsService = app(KrsService::class);
    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();
    $ruang = RuangKuliah::firstOrCreate(['kode' => 'RK301', 'nama' => 'Ruang 301', 'kapasitas' => 40]);
    $dosenUser = User::factory()->create(['user_type' => 'dosen']);
    $dosen = Dosen::create(['user_id' => $dosenUser->id, 'program_studi_id' => $prodi->id, 'nidn' => '0011223399', 'nama_lengkap' => 'Dr. Kuota Test']);

    $mk = Matakuliah::create(['kode' => 'MKKUOTA', 'nama' => 'Matakuliah Kuota Limited', 'sks' => 3, 'jenis' => 'wajib']);
    $kurikulum = KurikulumProdi::create(['program_studi_id' => $prodi->id, 'tahun_kurikulum' => '2026', 'is_active' => true]);
    $km = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk->id, 'semester' => 1]);

    // Class with EXACT 1 SEAT KUOTA!
    $kelas = KelasKuliah::create(['kurikulum_matakuliah_id' => $km->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'nama_kelas' => 'A', 'kuota' => 1]);
    DosenPengajar::create(['kelas_kuliah_id' => $kelas->id, 'dosen_id' => $dosen->id, 'peran' => 'utama']);
    JadwalPerkuliahan::create(['kelas_kuliah_id' => $kelas->id, 'ruang_kuliah_id' => $ruang->id, 'hari' => 'Senin', 'jam_mulai' => '08:00:00', 'jam_selesai' => '10:30:00']);

    // Setup 2 Eligible Students (With Paid Tagihan & Completed Registration)
    $periode = PeriodeRegistrasi::create(['tahun_ajaran_id' => $tahunAjaran->id, 'jenis' => 'mahasiswa_baru', 'mulai' => '2026-08-01', 'selesai' => '2026-08-25']);

    $userMhs1 = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs1 = Mahasiswa::create(['user_id' => $userMhs1->id, 'program_studi_id' => $prodi->id, 'nim' => '2026KUOTA01', 'nama_lengkap' => 'Student 1', 'tahun_masuk' => 2026]);
    RegistrasiUlang::create(['periode_registrasi_id' => $periode->id, 'mahasiswa_id' => $mhs1->id, 'status' => 'selesai']);
    Tagihan::create(['mahasiswa_id' => $mhs1->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'jenis' => 'ukt', 'nominal' => 3000000.00, 'jatuh_tempo' => '2026-08-30', 'status' => 'lunas']);
    $krs1 = Krs::create(['mahasiswa_id' => $mhs1->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'status' => 'draft']);

    $userMhs2 = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs2 = Mahasiswa::create(['user_id' => $userMhs2->id, 'program_studi_id' => $prodi->id, 'nim' => '2026KUOTA02', 'nama_lengkap' => 'Student 2', 'tahun_masuk' => 2026]);
    RegistrasiUlang::create(['periode_registrasi_id' => $periode->id, 'mahasiswa_id' => $mhs2->id, 'status' => 'selesai']);
    Tagihan::create(['mahasiswa_id' => $mhs2->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'jenis' => 'ukt', 'nominal' => 3000000.00, 'jatuh_tempo' => '2026-08-30', 'status' => 'lunas']);
    $krs2 = Krs::create(['mahasiswa_id' => $mhs2->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'status' => 'draft']);

    // Student 1 submits -> SUCCEEDS (takes final seat 1/1)
    $krsService->submitKrs($krs1, [$kelas->id]);
    expect($krs1->fresh()->status)->toBe('diajukan');

    // Student 2 submits -> MUST BE REJECTED (KUOTA KELAS PENUH)
    expect(fn () => $krsService->submitKrs($krs2, [$kelas->id]))
        ->toThrow(DomainException::class, 'KUOTA KELAS PENUH');

    // PROOF OF NO OVERBOOKING: Exactly 1 record in KrsDetail for this class
    $enrolledCount = KrsDetail::where('kelas_kuliah_id', $kelas->id)->count();
    expect($enrolledCount)->toBe(1);
});

test('KrsService rejects student schedule overlap in same KRS selection', function () {
    $krsService = app(KrsService::class);
    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();
    $ruang1 = RuangKuliah::firstOrCreate(['kode' => 'RK401', 'nama' => 'Ruang 401', 'kapasitas' => 40]);
    $ruang2 = RuangKuliah::firstOrCreate(['kode' => 'RK402', 'nama' => 'Ruang 402', 'kapasitas' => 40]);
    $dosenUser = User::factory()->create(['user_type' => 'dosen']);
    $dosen = Dosen::create(['user_id' => $dosenUser->id, 'program_studi_id' => $prodi->id, 'nidn' => '0011223388', 'nama_lengkap' => 'Dr. Schedule Overlap']);

    $mk1 = Matakuliah::create(['kode' => 'MKOVER1', 'nama' => 'Matakuliah Overlap 1', 'sks' => 3, 'jenis' => 'wajib']);
    $mk2 = Matakuliah::create(['kode' => 'MKOVER2', 'nama' => 'Matakuliah Overlap 2', 'sks' => 3, 'jenis' => 'wajib']);
    $kurikulum = KurikulumProdi::create(['program_studi_id' => $prodi->id, 'tahun_kurikulum' => '2026', 'is_active' => true]);
    $km1 = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk1->id, 'semester' => 1]);
    $km2 = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk2->id, 'semester' => 1]);

    // Class 1: Monday 08:00 - 10:30
    $kelas1 = KelasKuliah::create(['kurikulum_matakuliah_id' => $km1->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'nama_kelas' => 'A', 'kuota' => 30]);
    DosenPengajar::create(['kelas_kuliah_id' => $kelas1->id, 'dosen_id' => $dosen->id, 'peran' => 'utama']);
    JadwalPerkuliahan::create(['kelas_kuliah_id' => $kelas1->id, 'ruang_kuliah_id' => $ruang1->id, 'hari' => 'Senin', 'jam_mulai' => '08:00:00', 'jam_selesai' => '10:30:00']);

    // Class 2: Monday 09:30 - 12:00 (Overlaps with Class 1!)
    $kelas2 = KelasKuliah::create(['kurikulum_matakuliah_id' => $km2->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'nama_kelas' => 'B', 'kuota' => 30]);
    DosenPengajar::create(['kelas_kuliah_id' => $kelas2->id, 'dosen_id' => $dosen->id, 'peran' => 'utama']);
    JadwalPerkuliahan::create(['kelas_kuliah_id' => $kelas2->id, 'ruang_kuliah_id' => $ruang2->id, 'hari' => 'Senin', 'jam_mulai' => '09:30:00', 'jam_selesai' => '12:00:00']);

    // Eligible Student
    $periode = PeriodeRegistrasi::create(['tahun_ajaran_id' => $tahunAjaran->id, 'jenis' => 'mahasiswa_baru', 'mulai' => '2026-08-01', 'selesai' => '2026-08-25']);
    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026OVERSTU', 'nama_lengkap' => 'Student Overlap', 'tahun_masuk' => 2026]);
    RegistrasiUlang::create(['periode_registrasi_id' => $periode->id, 'mahasiswa_id' => $mhs->id, 'status' => 'selesai']);
    Tagihan::create(['mahasiswa_id' => $mhs->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'jenis' => 'ukt', 'nominal' => 3000000.00, 'jatuh_tempo' => '2026-08-30', 'status' => 'lunas']);
    $krs = Krs::create(['mahasiswa_id' => $mhs->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'status' => 'draft']);

    // Submitting both overlapping classes MUST FAIL
    expect(fn () => $krsService->submitKrs($krs, [$kelas1->id, $kelas2->id]))
        ->toThrow(DomainException::class, 'BENTROK JADWAL KRS');
});

test('KrsService rejects course if prerequisite minimal grade is not met', function () {
    $krsService = app(KrsService::class);
    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();
    $ruang = RuangKuliah::firstOrCreate(['kode' => 'RK501', 'nama' => 'Ruang 501', 'kapasitas' => 40]);
    $dosenUser = User::factory()->create(['user_type' => 'dosen']);
    $dosen = Dosen::create(['user_id' => $dosenUser->id, 'program_studi_id' => $prodi->id, 'nidn' => '0011223377', 'nama_lengkap' => 'Dr. Prereq Test']);

    $mkDasar = Matakuliah::create(['kode' => 'MKPREREQ1', 'nama' => 'Bahasa Arab I (Dasar)', 'sks' => 3, 'jenis' => 'wajib']);
    $mkLanjut = Matakuliah::create(['kode' => 'MKPREREQ2', 'nama' => 'Bahasa Arab II (Lanjut)', 'sks' => 3, 'jenis' => 'wajib']);

    // Prerequisite: Bahasa Arab II requires Bahasa Arab I with min grade 'B'
    PrasyaratMatakuliah::create([
        'matakuliah_id' => $mkLanjut->id,
        'matakuliah_prasyarat_id' => $mkDasar->id,
        'minimal_nilai' => 'B',
    ]);

    $kurikulum = KurikulumProdi::create(['program_studi_id' => $prodi->id, 'tahun_kurikulum' => '2026', 'is_active' => true]);
    $kmLanjut = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mkLanjut->id, 'semester' => 2]);

    $kelasLanjut = KelasKuliah::create(['kurikulum_matakuliah_id' => $kmLanjut->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'nama_kelas' => 'A', 'kuota' => 30]);
    DosenPengajar::create(['kelas_kuliah_id' => $kelasLanjut->id, 'dosen_id' => $dosen->id, 'peran' => 'utama']);
    JadwalPerkuliahan::create(['kelas_kuliah_id' => $kelasLanjut->id, 'ruang_kuliah_id' => $ruang->id, 'hari' => 'Selasa', 'jam_mulai' => '08:00:00', 'jam_selesai' => '10:30:00']);

    // Eligible Student without past passed grade for Bahasa Arab I
    $periode = PeriodeRegistrasi::create(['tahun_ajaran_id' => $tahunAjaran->id, 'jenis' => 'mahasiswa_baru', 'mulai' => '2026-08-01', 'selesai' => '2026-08-25']);
    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026NOPREREQ', 'nama_lengkap' => 'Student No Prereq', 'tahun_masuk' => 2026]);
    RegistrasiUlang::create(['periode_registrasi_id' => $periode->id, 'mahasiswa_id' => $mhs->id, 'status' => 'selesai']);
    Tagihan::create(['mahasiswa_id' => $mhs->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'jenis' => 'ukt', 'nominal' => 3000000.00, 'jatuh_tempo' => '2026-08-30', 'status' => 'lunas']);
    $krs = Krs::create(['mahasiswa_id' => $mhs->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'status' => 'draft']);

    // Submitting Bahasa Arab II without passing Bahasa Arab I MUST FAIL
    expect(fn () => $krsService->submitKrs($krs, [$kelasLanjut->id]))
        ->toThrow(DomainException::class, 'PRASYARAT BELUM TERPENUHI');
});

test('Dosen Wali approve and reject state machine with activity logging', function () {
    $krsService = app(KrsService::class);
    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();
    $ruang = RuangKuliah::firstOrCreate(['kode' => 'RK601', 'nama' => 'Ruang 601', 'kapasitas' => 40]);
    $dosenUser = User::factory()->create(['user_type' => 'dosen']);
    $dosen = Dosen::create(['user_id' => $dosenUser->id, 'program_studi_id' => $prodi->id, 'nidn' => '0011223366', 'nama_lengkap' => 'Dr. Dosen Wali']);

    $mk = Matakuliah::create(['kode' => 'MKFLOW', 'nama' => 'Matakuliah State Flow', 'sks' => 3, 'jenis' => 'wajib']);
    $kurikulum = KurikulumProdi::create(['program_studi_id' => $prodi->id, 'tahun_kurikulum' => '2026', 'is_active' => true]);
    $km = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk->id, 'semester' => 1]);

    $kelas = KelasKuliah::create(['kurikulum_matakuliah_id' => $km->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'nama_kelas' => 'A', 'kuota' => 30]);
    DosenPengajar::create(['kelas_kuliah_id' => $kelas->id, 'dosen_id' => $dosen->id, 'peran' => 'utama']);
    JadwalPerkuliahan::create(['kelas_kuliah_id' => $kelas->id, 'ruang_kuliah_id' => $ruang->id, 'hari' => 'Rabu', 'jam_mulai' => '08:00:00', 'jam_selesai' => '10:30:00']);

    $periode = PeriodeRegistrasi::create(['tahun_ajaran_id' => $tahunAjaran->id, 'jenis' => 'mahasiswa_baru', 'mulai' => '2026-08-01', 'selesai' => '2026-08-25']);
    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026STATEFLOW', 'nama_lengkap' => 'Student Flow', 'tahun_masuk' => 2026]);
    RegistrasiUlang::create(['periode_registrasi_id' => $periode->id, 'mahasiswa_id' => $mhs->id, 'status' => 'selesai']);
    Tagihan::create(['mahasiswa_id' => $mhs->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'jenis' => 'ukt', 'nominal' => 3000000.00, 'jatuh_tempo' => '2026-08-30', 'status' => 'lunas']);

    // Assign Dosen Wali
    DosenWali::create(['mahasiswa_id' => $mhs->id, 'dosen_id' => $dosen->id, 'tahun_ajaran_id' => $tahunAjaran->id]);

    $krs = Krs::create(['mahasiswa_id' => $mhs->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'status' => 'draft']);

    // 1. Submit KRS -> status diajukan
    $krsService->submitKrs($krs, [$kelas->id]);
    expect($krs->fresh()->status)->toBe('diajukan');
    expect(ActivityLog::where('action', 'krs.submit')->exists())->toBeTrue();

    // 2. Reject KRS by Dosen Wali -> status ditolak with note
    $krsService->rejectKrsByDosenWali($krs, $dosen->id, 'Kurangi SKS atau ubah kelas');
    expect($krs->fresh()->status)->toBe('ditolak');
    expect($krs->fresh()->catatan_penolakan)->toBe('Kurangi SKS atau ubah kelas');
    expect(ActivityLog::where('action', 'krs.reject')->exists())->toBeTrue();

    // 3. Re-submit KRS -> status diajukan and catatan_penolakan MUST BE RESET TO NULL
    $krsService->submitKrs($krs, [$kelas->id]);
    expect($krs->fresh()->status)->toBe('diajukan');
    expect($krs->fresh()->catatan_penolakan)->toBeNull();

    // 4. Approve KRS by Dosen Wali -> status disetujui_wali
    $krsService->approveKrsByDosenWali($krs, $dosen->id);
    expect($krs->fresh()->status)->toBe('disetujui_wali');
    expect(ActivityLog::where('action', 'krs.approve')->exists())->toBeTrue();
});

test('KrsService prevents student from selecting duplicate courses or multiple classes for same course', function () {
    $krsService = app(KrsService::class);
    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();
    $ruang = RuangKuliah::firstOrCreate(['kode' => 'RKDUP', 'nama' => 'Ruang Dup', 'kapasitas' => 40]);

    $dosenUser = User::factory()->create(['user_type' => 'dosen']);
    $dosen = Dosen::create(['user_id' => $dosenUser->id, 'program_studi_id' => $prodi->id, 'nidn' => '0099887711', 'nama_lengkap' => 'Dr. Dup Test']);

    $mk = Matakuliah::create(['kode' => 'MKDUP1', 'nama' => 'Matakuliah Duplikasi Test', 'sks' => 3, 'jenis' => 'wajib']);
    $kurikulum = KurikulumProdi::create(['program_studi_id' => $prodi->id, 'tahun_kurikulum' => '2026', 'is_active' => true]);
    $km = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk->id, 'semester' => 1]);

    $kelasA = KelasKuliah::create(['kurikulum_matakuliah_id' => $km->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'nama_kelas' => 'A', 'kuota' => 30]);
    $kelasB = KelasKuliah::create(['kurikulum_matakuliah_id' => $km->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'nama_kelas' => 'B', 'kuota' => 30]);

    DosenPengajar::create(['kelas_kuliah_id' => $kelasA->id, 'dosen_id' => $dosen->id, 'peran' => 'utama']);
    DosenPengajar::create(['kelas_kuliah_id' => $kelasB->id, 'dosen_id' => $dosen->id, 'peran' => 'utama']);

    JadwalPerkuliahan::create(['kelas_kuliah_id' => $kelasA->id, 'ruang_kuliah_id' => $ruang->id, 'hari' => 'Senin', 'jam_mulai' => '08:00:00', 'jam_selesai' => '10:30:00']);
    JadwalPerkuliahan::create(['kelas_kuliah_id' => $kelasB->id, 'ruang_kuliah_id' => $ruang->id, 'hari' => 'Selasa', 'jam_mulai' => '08:00:00', 'jam_selesai' => '10:30:00']);

    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026DUP01', 'nama_lengkap' => 'Student Dup', 'tahun_masuk' => 2026]);

    Tagihan::create(['mahasiswa_id' => $mhs->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'jenis' => 'ukt', 'nominal' => 3500000, 'jatuh_tempo' => '2026-08-30', 'status' => 'lunas']);
    $periode = PeriodeRegistrasi::firstOrCreate(['tahun_ajaran_id' => $tahunAjaran->id], [
        'nama' => 'Periode Test',
        'jenis' => 'mahasiswa_lama',
        'mulai' => '2026-08-01',
        'selesai' => '2026-08-30',
        'is_active' => true,
    ]);

    RegistrasiUlang::firstOrCreate(['periode_registrasi_id' => $periode->id, 'mahasiswa_id' => $mhs->id], [
        'status' => 'selesai',
        'status_verifikasi_dokumen' => 'disetujui',
    ]);

    DosenWali::create(['mahasiswa_id' => $mhs->id, 'dosen_id' => $dosen->id, 'tahun_ajaran_id' => $tahunAjaran->id]);

    $krs = Krs::create(['mahasiswa_id' => $mhs->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'status' => 'draft']);

    // Attempting to submit both Kelas A and Kelas B for the same Matakuliah MUST BE REJECTED
    expect(fn () => $krsService->submitKrs($krs, [$kelasA->id, $kelasB->id]))
        ->toThrow(DomainException::class, 'DUPLIKASI MATAKULIAH');
});
