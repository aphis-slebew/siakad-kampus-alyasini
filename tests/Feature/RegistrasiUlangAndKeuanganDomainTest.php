<?php

use App\Jobs\GenerateUktTagihanJob;
use App\Models\ActivityLog;
use App\Models\CalonMahasiswa;
use App\Models\CicilanTagihan;
use App\Models\GelombangPendaftaran;
use App\Models\HasilSeleksi;
use App\Models\JalurPendaftaran;
use App\Models\KelompokUkt;
use App\Models\Mahasiswa;
use App\Models\MahasiswaUkt;
use App\Models\Pembayaran;
use App\Models\PeriodeRegistrasi;
use App\Models\ProgramStudi;
use App\Models\RegistrasiUlang;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use App\Models\User;
use App\Services\KrsEligibilityService;
use App\Services\PaymentVerificationService;
use App\Services\PmbStateService;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
    $this->artisan('db:seed', ['--class' => 'MasterDataSeeder']);
    $this->artisan('db:seed', ['--class' => 'PmbSeeder']);
});

test('convertCalonKeMahasiswa strictly fails if RegistrasiUlang status in database is not selesai', function () {
    $pmbService = app(PmbStateService::class);
    $gelombang = GelombangPendaftaran::first();
    $jalur = JalurPendaftaran::first();
    $prodi = ProgramStudi::first();

    $calon = CalonMahasiswa::create([
        'gelombang_pendaftaran_id' => $gelombang->id,
        'jalur_pendaftaran_id' => $jalur->id,
        'program_studi_pilihan_1_id' => $prodi->id,
        'nama_lengkap' => 'Budi Her-Reg Test',
        'nik' => '3515000011112222',
        'status_pendaftaran' => 'lulus_seleksi',
    ]);
    HasilSeleksi::create(['calon_mahasiswa_id' => $calon->id, 'status' => 'lulus']);

    // 1. MUST FAIL because no RegistrasiUlang record exists in database
    expect(fn () => $pmbService->convertCalonKeMahasiswa($calon))
        ->toThrow(DomainException::class, 'Calon mahasiswa belum menyelesaikan proses registrasi ulang');

    // 2. Create RegistrasiUlang with status 'proses_verifikasi' -> MUST STILL FAIL
    $tahunAjaran = TahunAjaran::first();
    $periode = PeriodeRegistrasi::create([
        'tahun_ajaran_id' => $tahunAjaran->id,
        'jenis' => 'mahasiswa_baru',
        'mulai' => '2026-08-01',
        'selesai' => '2026-08-25',
    ]);

    $reg = RegistrasiUlang::create([
        'periode_registrasi_id' => $periode->id,
        'calon_mahasiswa_id' => $calon->id,
        'status' => 'proses_verifikasi',
    ]);

    expect(fn () => $pmbService->convertCalonKeMahasiswa($calon))
        ->toThrow(DomainException::class, 'Calon mahasiswa belum menyelesaikan proses registrasi ulang');

    // 3. Update RegistrasiUlang status to 'selesai' -> MUST SUCCEED CLEANLY!
    $reg->update(['status' => 'selesai', 'selesai_at' => now()]);

    $mahasiswa = $pmbService->convertCalonKeMahasiswa($calon);
    expect($mahasiswa)->not->toBeNull();
    expect($mahasiswa->calon_mahasiswa_id)->toBe($calon->id);
});

test('registrasi_ulang enforces exclusive XOR validation between calon_mahasiswa_id and mahasiswa_id', function () {
    $periode = PeriodeRegistrasi::firstOrCreate([
        'tahun_ajaran_id' => 1,
        'jenis' => 'mahasiswa_baru',
        'mulai' => '2026-08-01',
        'selesai' => '2026-08-25',
    ]);

    $userCalon = User::factory()->create(['user_type' => 'calon_mahasiswa']);
    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);

    $calon = CalonMahasiswa::create(['user_id' => $userCalon->id, 'gelombang_pendaftaran_id' => 1, 'jalur_pendaftaran_id' => 1, 'program_studi_pilihan_1_id' => 1, 'nama_lengkap' => 'Calon XOR']);
    $mahasiswa = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => 1, 'nim' => '2026XOR001', 'nama_lengkap' => 'Mahasiswa XOR', 'tahun_masuk' => 2026]);

    // Submitting both calon_mahasiswa_id and mahasiswa_id must return validation error
    $this->actingAs($userCalon);
    $response = $this->post(route('registrasi-ulang.student.submit'), [
        'periode_registrasi_id' => $periode->id,
        'calon_mahasiswa_id' => $calon->id,
        'mahasiswa_id' => $mahasiswa->id,
    ]);

    $response->assertSessionHasErrors(['registrasi']);
});

test('idempotency of GenerateUktTagihanJob prevents duplicate tagihans when executed multiple times', function () {
    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();

    $kelompokUkt = KelompokUkt::create([
        'program_studi_id' => $prodi->id,
        'nama' => 'Kelompok III',
        'nominal_per_semester' => 3500000.00,
    ]);

    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mahasiswa = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026IDEM001', 'nama_lengkap' => 'Mahasiswa Idempotent', 'tahun_masuk' => 2026]);

    MahasiswaUkt::create([
        'mahasiswa_id' => $mahasiswa->id,
        'kelompok_ukt_id' => $kelompokUkt->id,
        'tahun_ajaran_id' => $tahunAjaran->id,
        'status' => 'aktif',
    ]);

    $periode = PeriodeRegistrasi::create([
        'tahun_ajaran_id' => $tahunAjaran->id,
        'jenis' => 'mahasiswa_lama',
        'mulai' => '2026-08-01',
        'selesai' => '2026-08-30',
    ]);

    // Execute job 1st time
    (new GenerateUktTagihanJob($periode->id))->handle();
    $count1 = Tagihan::where('mahasiswa_id', $mahasiswa->id)->where('jenis', 'ukt')->count();

    // Execute job 2nd time (duplicate trigger / retry)
    (new GenerateUktTagihanJob($periode->id))->handle();
    $count2 = Tagihan::where('mahasiswa_id', $mahasiswa->id)->where('jenis', 'ukt')->count();

    expect($count1)->toBe(1);
    expect($count2)->toBe(1); // PROOF OF IDEMPOTENCY: Exact 1 record retained
});

test('installment division absorbing remainder handles non-divisible odd amounts with zero precision loss', function () {
    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();
    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mahasiswa = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026ROUND001', 'nama_lengkap' => 'Mahasiswa Rounding', 'tahun_masuk' => 2026]);

    // Nominal Rp 1.000.000 (divided by 3 = 333.333,33...)
    $tagihan = Tagihan::create([
        'mahasiswa_id' => $mahasiswa->id,
        'tahun_ajaran_id' => $tahunAjaran->id,
        'jenis' => 'ukt',
        'nominal' => 1000000.00,
        'jatuh_tempo' => '2026-08-30',
        'status' => 'belum_bayar',
    ]);

    $this->actingAs($userMhs);
    $response = $this->post(route('keuangan.cicilan.request', $tagihan), [
        'jumlah_cicilan' => 3,
    ]);

    $response->assertSessionHasNoErrors();

    $cicilans = CicilanTagihan::where('tagihan_id', $tagihan->id)->orderBy('cicilan_ke')->get();
    expect($cicilans)->toHaveCount(3);

    $sumNominal = $cicilans->sum(fn ($c) => (float) $c->nominal);

    // Cicilan 1: 333,333.33
    // Cicilan 2: 333,333.33
    // Cicilan 3: 333,333.34 (Absorbed remainder!)
    expect((float) $cicilans[0]->nominal)->toBe(333333.33);
    expect((float) $cicilans[1]->nominal)->toBe(333333.33);
    expect((float) $cicilans[2]->nominal)->toBe(333333.34);
    expect(round($sumNominal, 2))->toBe(1000000.00); // EXACT MATCH! Zero precision loss
});

test('partial verified payment transitions status to dicicil and cumulative payment reaches lunas', function () {
    $service = app(PaymentVerificationService::class);
    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();

    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mahasiswa = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026PARTIAL01', 'nama_lengkap' => 'Mahasiswa Parsial', 'tahun_masuk' => 2026]);

    $tagihan = Tagihan::create([
        'mahasiswa_id' => $mahasiswa->id,
        'tahun_ajaran_id' => $tahunAjaran->id,
        'jenis' => 'ukt',
        'nominal' => 3000000.00,
        'jatuh_tempo' => '2026-08-30',
        'status' => 'belum_bayar',
    ]);

    $stafKeuangan = User::factory()->create(['user_type' => 'pegawai']);
    $stafKeuangan->assignRole('staf_keuangan');

    // 1. Partial Payment 1: Rp 1.000.000 out of Rp 3.000.000
    $pembayaran1 = Pembayaran::create([
        'tagihan_id' => $tagihan->id,
        'tanggal_bayar' => '2026-08-05',
        'nominal_dibayar' => 1000000.00,
        'metode' => 'transfer_manual',
        'status_verifikasi' => 'menunggu',
    ]);

    $tagihanUpdated1 = $service->verifyPayment($pembayaran1, 'diverifikasi', $stafKeuangan->id);
    expect($tagihanUpdated1->status)->toBe('dicicil'); // MUST BE 'dicicil', NOT 'lunas'!

    // 2. Partial Payment 2: Remaining Rp 2.000.000
    $pembayaran2 = Pembayaran::create([
        'tagihan_id' => $tagihan->id,
        'tanggal_bayar' => '2026-08-10',
        'nominal_dibayar' => 2000000.00,
        'metode' => 'transfer_manual',
        'status_verifikasi' => 'menunggu',
    ]);

    $tagihanUpdated2 = $service->verifyPayment($pembayaran2, 'diverifikasi', $stafKeuangan->id);
    expect($tagihanUpdated2->status)->toBe('lunas'); // NOW Cumulative total Rp 3.000.000 reached -> LUNAS!
});

test('overpayment prevention throws exception when tagihan is already lunas and logs audit event if overpaid', function () {
    $service = app(PaymentVerificationService::class);
    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();

    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mahasiswa = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026OVERPAY01', 'nama_lengkap' => 'Mahasiswa Overpay', 'tahun_masuk' => 2026]);

    $tagihan = Tagihan::create([
        'mahasiswa_id' => $mahasiswa->id,
        'tahun_ajaran_id' => $tahunAjaran->id,
        'jenis' => 'ukt',
        'nominal' => 3000000.00,
        'jatuh_tempo' => '2026-08-30',
        'status' => 'belum_bayar',
    ]);

    $stafKeuangan = User::factory()->create(['user_type' => 'pegawai']);
    $stafKeuangan->assignRole('staf_keuangan');

    // 1. Verify Payment 1: Rp 3.000.000 (Tagihan becomes LUNAS)
    $pembayaran1 = Pembayaran::create([
        'tagihan_id' => $tagihan->id,
        'tanggal_bayar' => '2026-08-05',
        'nominal_dibayar' => 3000000.00,
        'metode' => 'transfer_manual',
        'status_verifikasi' => 'menunggu',
    ]);
    $service->verifyPayment($pembayaran1, 'diverifikasi', $stafKeuangan->id);

    // 2. Staff tries to verify Payment 2: Rp 3.000.000 (Duplicate transfer attempt)
    $pembayaran2 = Pembayaran::create([
        'tagihan_id' => $tagihan->id,
        'tanggal_bayar' => '2026-08-06',
        'nominal_dibayar' => 3000000.00,
        'metode' => 'transfer_manual',
        'status_verifikasi' => 'menunggu',
    ]);

    // PREVENTIVE VALIDATION: Must throw DomainException
    expect(fn () => $service->verifyPayment($pembayaran2, 'diverifikasi', $stafKeuangan->id))
        ->toThrow(DomainException::class, 'PENCEGAHAN OVERPAYMENT: Tagihan ini SUDAH LUNAS');

    // 3. Admin override with allowOverpayment = true -> Verifies payment and logs overpayment_detected
    $service->verifyPayment($pembayaran2, 'diverifikasi', $stafKeuangan->id, true);

    $overpayLog = ActivityLog::where('action', 'keuangan.overpayment_detected')->first();
    expect($overpayLog)->not->toBeNull();
    expect($service->getOverpaymentAmount($tagihan))->toBe(3000000.00); // 3 Juta kelebihan bayar terdeteksi presisi
});

test('KrsEligibilityService rejects eligibility when student has overdue unpaid cicilan', function () {
    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();

    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mahasiswa = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026OVERDUE01', 'nama_lengkap' => 'Mahasiswa Overdue', 'tahun_masuk' => 2026]);

    // Setup Her-Registrasi selesai
    $periode = PeriodeRegistrasi::create(['tahun_ajaran_id' => $tahunAjaran->id, 'jenis' => 'mahasiswa_lama', 'mulai' => '2026-08-01', 'selesai' => '2026-08-30']);
    RegistrasiUlang::create(['periode_registrasi_id' => $periode->id, 'mahasiswa_id' => $mahasiswa->id, 'status' => 'selesai']);

    // Setup Tagihan & Cicilan OVERDUE (jatuh tempo '2026-07-01' past date)
    $tagihan = Tagihan::create(['mahasiswa_id' => $mahasiswa->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'jenis' => 'ukt', 'nominal' => 3000000.00, 'jatuh_tempo' => '2026-08-30', 'status' => 'dicicil']);

    CicilanTagihan::create([
        'tagihan_id' => $tagihan->id,
        'cicilan_ke' => 1,
        'nominal' => 1500000.00,
        'jatuh_tempo' => '2026-07-01', // Past date!
        'status' => 'belum_bayar', // Overdue unpaid!
    ]);

    $eval = KrsEligibilityService::evaluate($mahasiswa, $tahunAjaran->id);

    expect($eval['is_eligible'])->toBeFalse();
    expect($eval['reasons'])->toContain('Mahasiswa memiliki cicilan UKT yang telah melewati tanggal jatuh tempo dan belum dilunasi.');
});

test('RBAC enforces strict 403 forbidden access for unauthorized routes and document downloads', function () {
    $userMhsA = User::factory()->create(['user_type' => 'mahasiswa']);
    $userMhsA->assignRole('mahasiswa');

    $userMhsB = User::factory()->create(['user_type' => 'mahasiswa']);
    $userMhsB->assignRole('mahasiswa');

    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();
    $mhsB = Mahasiswa::create(['user_id' => $userMhsB->id, 'program_studi_id' => $prodi->id, 'nim' => '2026RBAC002', 'nama_lengkap' => 'Mahasiswa B', 'tahun_masuk' => 2026]);

    $tagihanB = Tagihan::create(['mahasiswa_id' => $mhsB->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'jenis' => 'ukt', 'nominal' => 3000000.00, 'jatuh_tempo' => '2026-08-30', 'status' => 'belum_bayar']);
    $pembayaranB = Pembayaran::create(['tagihan_id' => $tagihanB->id, 'tanggal_bayar' => '2026-08-01', 'nominal_dibayar' => 3000000.00, 'bukti_file_path' => 'private/bukti_pembayaran/dummy.jpg']);

    // 1. Mahasiswa A accessing Financial Staff Verification Dashboard -> MUST RETURN 403 FORBIDDEN
    $this->actingAs($userMhsA);
    $this->get('/keuangan/pembayaran')->assertStatus(403);
    $this->get('/keuangan/periode-registrasi')->assertStatus(403);
    $this->get('/keuangan/kelompok-ukt')->assertStatus(403);

    // 2. Mahasiswa A attempting to download Mahasiswa B's proof file -> MUST RETURN 403 FORBIDDEN
    $this->get("/keuangan/pembayaran/{$pembayaranB->id}/bukti")->assertStatus(403);

    // 3. Staf Keuangan accessing Financial Staff Verification Dashboard -> MUST RETURN 200 OK
    $stafKeuangan = User::factory()->create(['user_type' => 'pegawai']);
    $stafKeuangan->assignRole('staf_keuangan');

    $this->actingAs($stafKeuangan);
    $this->get('/keuangan/pembayaran')->assertStatus(200);
    $this->get('/keuangan/periode-registrasi')->assertStatus(200);
    $this->get('/keuangan/kelompok-ukt')->assertStatus(200);
});
