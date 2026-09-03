<?php

use App\Models\ActivityLog;
use App\Models\Dosen;
use App\Models\DosenPengajar;
use App\Models\JadwalPerkuliahan;
use App\Models\KelasKuliah;
use App\Models\KomposisiNilai;
use App\Models\Krs;
use App\Models\KrsDetail;
use App\Models\KurikulumMatakuliah;
use App\Models\KurikulumProdi;
use App\Models\Mahasiswa;
use App\Models\Matakuliah;
use App\Models\Nilai;
use App\Models\ProgramStudi;
use App\Models\RuangKuliah;
use App\Models\TahunAjaran;
use App\Models\User;
use App\Services\KhsService;
use App\Services\PenilaianService;
use App\Services\PresensiService;
use Carbon\Carbon;
use DomainException;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
    $this->artisan('db:seed', ['--class' => 'MasterDataSeeder']);
});

test('PresensiService enforces date range constraint blocking future dates and ancient past dates for lecturers', function () {
    $presensiService = app(PresensiService::class);
    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();
    $ruang = RuangKuliah::firstOrCreate(['kode' => 'RK701', 'nama' => 'Ruang 701', 'kapasitas' => 40]);

    $dosenUser = User::factory()->create(['user_type' => 'dosen']);
    $dosen = Dosen::create(['user_id' => $dosenUser->id, 'program_studi_id' => $prodi->id, 'nidn' => '0011998877', 'nama_lengkap' => 'Dr. Presensi Test']);

    $mk = Matakuliah::create(['kode' => 'MKPRES1', 'nama' => 'Matakuliah Presensi Test', 'sks' => 3, 'jenis' => 'wajib']);
    $kurikulum = KurikulumProdi::create(['program_studi_id' => $prodi->id, 'tahun_kurikulum' => '2026', 'is_active' => true]);
    $km = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk->id, 'semester' => 1]);

    $kelas = KelasKuliah::create(['kurikulum_matakuliah_id' => $km->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'nama_kelas' => 'A', 'kuota' => 30]);
    DosenPengajar::create(['kelas_kuliah_id' => $kelas->id, 'dosen_id' => $dosen->id, 'peran' => 'utama']);
    JadwalPerkuliahan::create(['kelas_kuliah_id' => $kelas->id, 'ruang_kuliah_id' => $ruang->id, 'hari' => 'Senin', 'jam_mulai' => '08:00:00', 'jam_selesai' => '10:30:00']);

    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026PRES01', 'nama_lengkap' => 'Student Presensi', 'tahun_masuk' => 2026]);

    $krs = Krs::create(['mahasiswa_id' => $mhs->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'status' => 'disetujui_wali']);
    KrsDetail::create(['krs_id' => $krs->id, 'kelas_kuliah_id' => $kelas->id]);

    // 1. Future date (Tomorrow) MUST BE BLOCKED
    $tomorrow = Carbon::tomorrow()->toDateString();
    expect(fn () => $presensiService->recordJurnalAndPresensi($kelas, $tomorrow, 'Materi Future', [['mahasiswa_id' => $mhs->id, 'status' => 'hadir']], $dosenUser->id))
        ->toThrow(DomainException::class, 'TANGGAL MASA DEPAN DILARANG');

    // 2. Past date older than 7 days MUST BE BLOCKED for Dosen
    $pastDate = Carbon::today()->subDays(10)->toDateString();
    expect(fn () => $presensiService->recordJurnalAndPresensi($kelas, $pastDate, 'Materi Past', [['mahasiswa_id' => $mhs->id, 'status' => 'hadir']], $dosenUser->id))
        ->toThrow(DomainException::class, 'BATAS WAKTU PRESENSI TERLAMPAUI');

    // 3. Today's date MUST SUCCEED
    $today = Carbon::today()->toDateString();
    $jurnal = $presensiService->recordJurnalAndPresensi($kelas, $today, 'Materi Valid', [['mahasiswa_id' => $mhs->id, 'status' => 'hadir']], $dosenUser->id);
    expect($jurnal->materi)->toBe('Materi Valid');
});

test('PenilaianService enforces 100% total weight constraint for grade composition', function () {
    $penilaianService = app(PenilaianService::class);
    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();

    $mk = Matakuliah::create(['kode' => 'MKBOBOT', 'nama' => 'Matakuliah Bobot Test', 'sks' => 3, 'jenis' => 'wajib']);
    $kurikulum = KurikulumProdi::create(['program_studi_id' => $prodi->id, 'tahun_kurikulum' => '2026', 'is_active' => true]);
    $km = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk->id, 'semester' => 1]);
    $kelas = KelasKuliah::create(['kurikulum_matakuliah_id' => $km->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'nama_kelas' => 'A', 'kuota' => 30]);

    // 1. Total weight 90% MUST FAIL
    $invalidComp = [
        ['komponen' => 'tugas', 'bobot_persen' => 20],
        ['komponen' => 'uts', 'bobot_persen' => 30],
        ['komponen' => 'uas', 'bobot_persen' => 40], // Sum = 90%
    ];
    expect(fn () => $penilaianService->saveKomposisiNilai($kelas, $invalidComp))
        ->toThrow(DomainException::class, 'TOTAL BOBOT HARUS 100%');

    // 2. Total weight 100% MUST SUCCEED
    $validComp = [
        ['komponen' => 'tugas', 'bobot_persen' => 20],
        ['komponen' => 'uts', 'bobot_persen' => 30],
        ['komponen' => 'uas', 'bobot_persen' => 40],
        ['komponen' => 'presensi', 'bobot_persen' => 10], // Sum = 100%
    ];
    $penilaianService->saveKomposisiNilai($kelas, $validComp);
    expect(KomposisiNilai::where('kelas_kuliah_id', $kelas->id)->count())->toBe(4);
});

test('finalized grade cannot be edited directly and requires whitewash Service with activity log', function () {
    $penilaianService = app(PenilaianService::class);
    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();
    $ruang = RuangKuliah::firstOrCreate(['kode' => 'RK801', 'nama' => 'Ruang 801', 'kapasitas' => 40]);

    $dosenUser = User::factory()->create(['user_type' => 'dosen']);
    $dosen = Dosen::create(['user_id' => $dosenUser->id, 'program_studi_id' => $prodi->id, 'nidn' => '0011998866', 'nama_lengkap' => 'Dr. Nilai Test']);

    $mk = Matakuliah::create(['kode' => 'MKNILAI', 'nama' => 'Matakuliah Nilai Test', 'sks' => 3, 'jenis' => 'wajib']);
    $kurikulum = KurikulumProdi::create(['program_studi_id' => $prodi->id, 'tahun_kurikulum' => '2026', 'is_active' => true]);
    $km = KurikulumMatakuliah::create(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk->id, 'semester' => 1]);

    $kelas = KelasKuliah::create(['kurikulum_matakuliah_id' => $km->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'nama_kelas' => 'A', 'kuota' => 30]);
    DosenPengajar::create(['kelas_kuliah_id' => $kelas->id, 'dosen_id' => $dosen->id, 'peran' => 'utama']);
    JadwalPerkuliahan::create(['kelas_kuliah_id' => $kelas->id, 'ruang_kuliah_id' => $ruang->id, 'hari' => 'Senin', 'jam_mulai' => '08:00:00', 'jam_selesai' => '10:30:00']);

    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026NILAI01', 'nama_lengkap' => 'Student Nilai', 'tahun_masuk' => 2026]);

    $krs = Krs::create(['mahasiswa_id' => $mhs->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'status' => 'disetujui_wali']);
    $detail = KrsDetail::create(['krs_id' => $krs->id, 'kelas_kuliah_id' => $kelas->id]);

    // 1. Dosen inputs draft score
    $penilaianService->inputNilaiByDosen($kelas, $detail->id, ['tugas' => 70, 'uts' => 75, 'uas' => 80], $dosenUser->id);

    // 2. Finalize grades
    $penilaianService->finalizeNilai($kelas, $dosenUser->id);
    expect(Nilai::where('krs_detail_id', $detail->id)->first()->is_final)->toBeTrue();

    // 3. Direct edit after finalization MUST BE BLOCKED
    expect(fn () => $penilaianService->inputNilaiByDosen($kelas, $detail->id, ['uas' => 95], $dosenUser->id))
        ->toThrow(DomainException::class, 'NILAI SUDAH FINAL');

    // 4. Admin Whitewash Service MUST SUCCEED and record ActivityLog
    $adminUser = User::factory()->create(['user_type' => 'pegawai']);
    $adminUser->assignRole('admin_akademik');

    $nilaiUas = Nilai::where('krs_detail_id', $detail->id)->where('komponen', 'uas')->first();
    $updatedNilai = $penilaianService->whitewashNilai($nilaiUas, 95.00, 'Perbaikan Ujian Susulan SK 101', $adminUser->id);

    expect((float) $updatedNilai->nilai_angka)->toBe(95.00);
    expect(ActivityLog::where('action', 'nilai.whitewash')->exists())->toBeTrue();
});

test('IDOR check prevents student from viewing another student KHS', function () {
    $khsService = app(KhsService::class);
    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();

    $userMhsA = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhsA = Mahasiswa::create(['user_id' => $userMhsA->id, 'program_studi_id' => $prodi->id, 'nim' => '2026IDORA', 'nama_lengkap' => 'Student A', 'tahun_masuk' => 2026]);

    $userMhsB = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhsB = Mahasiswa::create(['user_id' => $userMhsB->id, 'program_studi_id' => $prodi->id, 'nim' => '2026IDORB', 'nama_lengkap' => 'Student B', 'tahun_masuk' => 2026]);

    // Student A viewing Student B KHS MUST BE REJECTED WITH HTTP 403 / DomainException
    $this->actingAs($userMhsA);
    $this->get("/khs/mahasiswa/{$mhsB->id}")->assertStatus(403);

    expect(fn () => $khsService->generateKhs($mhsB, $tahunAjaran->id, $userMhsA->id))
        ->toThrow(DomainException::class, 'AKSES DITOLAK');

    // Student A viewing own KHS MUST SUCCEED
    $this->get('/khs/saya')->assertStatus(200);
});

test('dosen can access penilaian index page', function () {
    $dosenUser = User::factory()->create(['user_type' => 'dosen']);
    $dosenUser->assignRole('dosen');
    $response = $this->actingAs($dosenUser)->get('/akademik/penilaian');
    $response->assertStatus(200);
});
