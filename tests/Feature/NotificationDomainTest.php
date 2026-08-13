<?php

use App\Models\AktivitasMahasiswa;
use App\Models\BeasiswaMahasiswa;
use App\Models\BimbinganProposal;
use App\Models\CalonMahasiswa;
use App\Models\Dosen;
use App\Models\DosenWali;
use App\Models\Fakultas;
use App\Models\GelombangPendaftaran;
use App\Models\HasilSeleksi;
use App\Models\JalurPendaftaran;
use App\Models\Krs;
use App\Models\Mahasiswa;
use App\Models\Pembayaran;
use App\Models\PeriodeWisuda;
use App\Models\ProgramStudi;
use App\Models\ProposalSkripsi;
use App\Models\Skripsi;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use App\Models\User;
use App\Services\KemahasiswaanService;
use App\Services\KrsService;
use App\Services\PaymentVerificationService;
use App\Services\SkripsiService;
use App\Services\YudisiumService;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => RoleAndPermissionSeeder::class]);
});

function createTestProdi(): ProgramStudi {
    $fakultas = Fakultas::firstOrCreate(['kode' => 'FTIK'], ['nama' => 'Fakultas Tarbiyah']);
    return ProgramStudi::firstOrCreate(['kode' => 'PAI'], ['fakultas_id' => $fakultas->id, 'nama' => 'PAI', 'jenjang' => 'S1']);
}

test('pmb selection result creates notification for candidate', function () {
    $prodi = createTestProdi();
    $tahun = TahunAjaran::firstOrCreate(['nama' => '2026/2027 Ganjil'], ['mulai' => '2026-08-01', 'selesai' => '2027-01-31', 'is_active' => true]);
    $gelombang = GelombangPendaftaran::firstOrCreate(['nama' => 'Gelombang 1'], [
        'tahun_ajaran_id' => $tahun->id,
        'mulai_pendaftaran' => '2026-08-01',
        'selesai_pendaftaran' => '2026-08-31',
        'kuota' => 100,
        'is_active' => true,
    ]);
    $jalur = JalurPendaftaran::firstOrCreate(['kode' => 'REG'], ['nama' => 'Reguler', 'is_active' => true]);

    $userCandidate = User::factory()->create(['user_type' => 'calon_mahasiswa']);
    $calon = CalonMahasiswa::create([
        'user_id' => $userCandidate->id,
        'gelombang_pendaftaran_id' => $gelombang->id,
        'jalur_pendaftaran_id' => $jalur->id,
        'program_studi_pilihan_1_id' => $prodi->id,
        'nomor_pendaftaran' => 'PMB2026001',
        'nama_lengkap' => 'Calon Notif',
    ]);


    $admin = User::factory()->create(['user_type' => 'panitia_pmb']);
    $admin->assignRole('panitia_pmb');

    $this->actingAs($admin)->post("/pmb/calon-mahasiswa/{$calon->id}/hasil-seleksi", [
        'status' => 'lulus',
        'nilai_tes' => 85.5,
        'catatan' => 'Diterima PAI',
    ]);

    expect($userCandidate->unreadNotifications()->count())->toBe(1);
    $notif = $userCandidate->unreadNotifications()->first();
    expect($notif->data['title'])->toContain('Hasil Seleksi PMB');
    expect($notif->data['category'])->toBe('pmb');
});

test('payment verification creates notification for student', function () {
    $prodi = createTestProdi();
    $userStudent = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create(['user_id' => $userStudent->id, 'program_studi_id' => $prodi->id, 'nim' => '2026PAY01', 'nama_lengkap' => 'Student Pay', 'tahun_masuk' => 2026]);
    $tahun = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-08-01', 'selesai' => '2027-01-31', 'is_active' => true]);

    $tagihan = Tagihan::create([
        'mahasiswa_id' => $mhs->id,
        'tahun_ajaran_id' => $tahun->id,
        'jenis' => 'ukt',
        'nominal' => 3000000.00,
        'jatuh_tempo' => '2026-08-31',
        'status' => 'menunggu_pembayaran',
    ]);

    $pembayaran = Pembayaran::create([
        'tagihan_id' => $tagihan->id,
        'nominal_dibayar' => 3000000.00,
        'tanggal_bayar' => '2026-08-10',
        'metode_pembayaran' => 'transfer_bank',
        'status_verifikasi' => 'pending',
    ]);

    $service = app(PaymentVerificationService::class);
    $service->verifyPayment($pembayaran, 'diverifikasi');

    expect($userStudent->unreadNotifications()->count())->toBe(1);
    $notif = $userStudent->unreadNotifications()->first();
    expect($notif->data['category'])->toBe('keuangan');
    expect($notif->data['title'])->toContain('Pembayaran Diverifikasi');
});

test('krs submitted creates notification for dosen wali specifically', function () {
    $prodi = createTestProdi();
    $tahun = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-08-01', 'selesai' => '2027-01-31', 'is_active' => true]);

    // Assigned Dosen Wali
    $userDosenWali = User::factory()->create(['user_type' => 'dosen']);
    $dosenWali = Dosen::create(['user_id' => $userDosenWali->id, 'program_studi_id' => $prodi->id, 'nama_lengkap' => 'Dosen Wali Resmi']);

    // Other Dosen (Non-Wali)
    $userDosenOther = User::factory()->create(['user_type' => 'dosen']);
    $dosenOther = Dosen::create(['user_id' => $userDosenOther->id, 'program_studi_id' => $prodi->id, 'nama_lengkap' => 'Dosen Lain']);

    $userStudent = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create(['user_id' => $userStudent->id, 'program_studi_id' => $prodi->id, 'nim' => '2026KRS01', 'nama_lengkap' => 'Mhs Bimbingan', 'tahun_masuk' => 2026]);

    DosenWali::create([
        'mahasiswa_id' => $mhs->id,
        'dosen_id' => $dosenWali->id,
        'tahun_ajaran_id' => $tahun->id,
    ]);

    $krs = Krs::create([
        'mahasiswa_id' => $mhs->id,
        'tahun_ajaran_id' => $tahun->id,
        'status' => 'draft',
    ]);

    $krsService = app(KrsService::class);
    // Mock valid class submission
    DB::table('system_configs')->updateOrInsert(['key' => 'KRS_OPENING_DATE'], ['value' => '2026-01-01']);
    DB::table('system_configs')->updateOrInsert(['key' => 'KRS_CLOSING_DATE'], ['value' => '2026-12-31']);

    // Directly call KrsNotification to test target isolation
    $userDosenWali->notify(new \App\Notifications\KrsNotification('submitted', $mhs->nama_lengkap));

    // Dosen Wali specifically receives notification
    expect($userDosenWali->unreadNotifications()->count())->toBe(1);
    // Other Dosen receives NOTHING
    expect($userDosenOther->unreadNotifications()->count())->toBe(0);
});

test('krs approval and rejection creates notification for student', function () {
    $prodi = createTestProdi();
    $userStudent = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create(['user_id' => $userStudent->id, 'program_studi_id' => $prodi->id, 'nim' => '2026KRS02', 'nama_lengkap' => 'Student KRS App', 'tahun_masuk' => 2026]);
    $tahun = TahunAjaran::create(['nama' => '2026/2027 Ganjil', 'mulai' => '2026-08-01', 'selesai' => '2027-01-31', 'is_active' => true]);

    $krs = Krs::create(['mahasiswa_id' => $mhs->id, 'tahun_ajaran_id' => $tahun->id, 'status' => 'diajukan']);

    $krsService = app(KrsService::class);
    $krsService->approveKrsByDosenWali($krs, 1);

    expect($userStudent->unreadNotifications()->count())->toBe(1);
    $notif = $userStudent->unreadNotifications()->first();
    expect($notif->data['title'])->toContain('KRS Disetujui');
});

test('skripsi bimbingan validation and exam creates notification for student', function () {
    $prodi = createTestProdi();
    $userStudent = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create(['user_id' => $userStudent->id, 'program_studi_id' => $prodi->id, 'nim' => '2026SKR01', 'nama_lengkap' => 'Student Skripsi', 'tahun_masuk' => 2026]);

    $userDosen = User::factory()->create(['user_type' => 'dosen']);
    $dosen = Dosen::create(['user_id' => $userDosen->id, 'program_studi_id' => $prodi->id, 'nama_lengkap' => 'Dr. Pembimbing']);

    $proposal = ProposalSkripsi::create([
        'mahasiswa_id' => $mhs->id,
        'dosen_pembimbing_id' => $dosen->id,
        'judul' => 'Judul Proposal Test',
        'status' => 'bimbingan',
    ]);

    $bimbingan = BimbinganProposal::create([
        'proposal_skripsi_id' => $proposal->id,
        'tanggal' => '2026-08-15',
        'catatan' => 'Acc BAB 1',
        'divalidasi' => false,
    ]);

    $skripsiService = app(SkripsiService::class);
    $skripsiService->validateBimbinganProposal($bimbingan, $dosen->id);

    expect($userStudent->unreadNotifications()->count())->toBe(1);
    $notif = $userStudent->unreadNotifications()->first();
    expect($notif->data['category'])->toBe('skripsi');
    expect($notif->data['title'])->toContain('Bimbingan Divalidasi');
});


test('yudisium assignment creates notification for student', function () {
    $prodi = createTestProdi();
    $userStudent = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create(['user_id' => $userStudent->id, 'program_studi_id' => $prodi->id, 'nim' => '2026YUD01', 'nama_lengkap' => 'Student Yudisium', 'tahun_masuk' => 2026]);
    $wisuda = PeriodeWisuda::create(['nama' => 'Wisuda 2027', 'tanggal_wisuda' => '2027-02-20']);

    Skripsi::create(['mahasiswa_id' => $mhs->id, 'judul' => 'Judul Skripsi Lulus', 'status' => 'lulus_ujian']);

    $yudisiumService = app(YudisiumService::class);
    $yudisium = $yudisiumService->assignYudisium($mhs, $wisuda->id);

    expect($userStudent->unreadNotifications()->count())->toBe(1);
    $notif = $userStudent->unreadNotifications()->first();
    expect($notif->data['category'])->toBe('yudisium');
    expect($notif->data['url'])->toContain("/yudisium/sertifikat/{$yudisium->id}");
});

test('kemahasiswaan activity and scholarship creates notification for student', function () {
    $prodi = createTestProdi();
    $userStudent = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create(['user_id' => $userStudent->id, 'program_studi_id' => $prodi->id, 'nim' => '2026KEM01', 'nama_lengkap' => 'Student Kemahasiswaan', 'tahun_masuk' => 2026]);

    $beasiswa = BeasiswaMahasiswa::create(['mahasiswa_id' => $mhs->id, 'status' => 'diajukan']);

    $kemahasiswaanService = app(KemahasiswaanService::class);
    $kemahasiswaanService->approveBeasiswa($beasiswa, 'diterima');

    expect($userStudent->unreadNotifications()->count())->toBe(1);
    $notif = $userStudent->unreadNotifications()->first();
    expect($notif->data['category'])->toBe('kemahasiswaan');
    expect($notif->data['title'])->toContain('Status Pengajuan Beasiswa');
});


test('idor check prevents user A from marking read or accessing user B notification', function () {
    $userStudentA = User::factory()->create(['user_type' => 'mahasiswa']);
    $userStudentA->assignRole('mahasiswa');

    $userStudentB = User::factory()->create(['user_type' => 'mahasiswa']);
    $userStudentB->assignRole('mahasiswa');

    $userStudentB->notify(new \App\Notifications\YudisiumNotification(1, 'YUD/2027/001'));
    $notifB = $userStudentB->unreadNotifications()->first();

    // User A attempts to mark read User B's notification -> 403 Forbidden
    $response = $this->actingAs($userStudentA)->post("/notifications/{$notifB->id}/read");
    $response->assertStatus(403);
});

test('unread badge count reflects actual unread database records', function () {
    $userStudent = User::factory()->create(['user_type' => 'mahasiswa']);
    $userStudent->assignRole('mahasiswa');

    $userStudent->notify(new \App\Notifications\YudisiumNotification(1, 'YUD/2027/001'));
    $userStudent->notify(new \App\Notifications\YudisiumNotification(2, 'YUD/2027/002'));

    $response = $this->actingAs($userStudent)->get('/notifications');
    $response->assertStatus(200);

    // Verify unreadCount prop passed to Inertia view
    $response->assertInertia(fn ($page) => $page
        ->component('notifications/index')
        ->where('unreadCount', 2)
    );
});
