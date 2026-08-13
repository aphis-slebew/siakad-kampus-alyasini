<?php

use App\Models\BeasiswaMahasiswa;
use App\Models\BimbinganProposal;
use App\Models\BimbinganSkripsi;
use App\Models\Dosen;
use App\Models\Fakultas;
use App\Models\Mahasiswa;
use App\Models\PeriodeWisuda;
use App\Models\ProgramStudi;
use App\Models\ProposalSkripsi;
use App\Models\Skripsi;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use App\Models\User;
use App\Models\Yudisium;
use App\Services\KemahasiswaanService;
use App\Services\SkripsiService;
use App\Services\YudisiumService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
});

test('skripsi, proposal, guidance logs, and yudisium function correctly', function () {
    $fakultas = Fakultas::firstOrCreate(['kode' => 'FTI'], ['nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::firstOrCreate(['kode' => 'PAI'], ['fakultas_id' => $fakultas->id, 'nama' => 'PAI', 'jenjang' => 'S1']);

    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mahasiswa = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '202601030', 'nama_lengkap' => 'Mahasiswa Skripsi', 'tahun_masuk' => 2026]);

    $userDosen = User::factory()->create(['user_type' => 'dosen']);
    $dosen = Dosen::create(['user_id' => $userDosen->id, 'program_studi_id' => $prodi->id, 'nama_lengkap' => 'Dr. Pembimbing']);

    $proposal = ProposalSkripsi::create([
        'mahasiswa_id' => $mahasiswa->id,
        'dosen_pembimbing_id' => $dosen->id,
        'judul' => 'Metode Pembelajaran Fiqih Berbasis Digital',
        'status' => 'disetujui',
    ]);

    $bimbinganProp = BimbinganProposal::create([
        'proposal_skripsi_id' => $proposal->id,
        'tanggal' => '2026-10-01',
        'catatan' => 'Perbaiki latar belakang masalah',
        'divalidasi' => true,
    ]);

    $skripsi = Skripsi::create([
        'mahasiswa_id' => $mahasiswa->id,
        'dosen_pembimbing_id' => $dosen->id,
        'judul' => 'Metode Pembelajaran Fiqih Berbasis Digital di Pesantren',
        'status' => 'lulus_ujian',
        'tanggal_ujian' => '2026-12-15',
    ]);

    $bimbinganSkr = BimbinganSkripsi::create([
        'skripsi_id' => $skripsi->id,
        'tanggal' => '2026-11-10',
        'catatan' => 'BAB IV Analisis Data disetujui',
        'divalidasi' => true,
    ]);

    $wisuda = PeriodeWisuda::create(['nama' => 'Wisuda Periode I 2027', 'tanggal_wisuda' => '2027-02-20']);

    $yudisium = Yudisium::create([
        'mahasiswa_id' => $mahasiswa->id,
        'periode_wisuda_id' => $wisuda->id,
        'ipk_akhir' => 3.85,
        'nomor_dokumen' => 'YUD/2027/001',
    ]);

    expect($proposal->bimbinganProposals)->toHaveCount(1);
    expect($skripsi->bimbinganSkripsis)->toHaveCount(1);
    expect($yudisium->periodeWisuda->nama)->toBe('Wisuda Periode I 2027');
    expect($yudisium->ipk_akhir)->toBe('3.85');
});

test('yudisium service rejects student with unpaid UKT debt', function () {
    $yudisiumService = app(YudisiumService::class);

    $fakultas = Fakultas::firstOrCreate(['kode' => 'FTI'], ['nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::firstOrCreate(['kode' => 'PAI'], ['fakultas_id' => $fakultas->id, 'nama' => 'PAI', 'jenjang' => 'S1']);
    $tahun = TahunAjaran::firstOrCreate(['nama' => '2026/2027 Ganjil'], ['mulai' => '2026-08-01', 'selesai' => '2027-01-31', 'is_active' => true]);

    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mahasiswa = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026DEBT01', 'nama_lengkap' => 'Mahasiswa Utang UKT', 'tahun_masuk' => 2026]);

    $userDosen = User::factory()->create(['user_type' => 'dosen']);
    $dosen = Dosen::create(['user_id' => $userDosen->id, 'program_studi_id' => $prodi->id, 'nama_lengkap' => 'Dr. Pembimbing']);

    Skripsi::create([
        'mahasiswa_id' => $mahasiswa->id,
        'dosen_pembimbing_id' => $dosen->id,
        'judul' => 'Judul Skripsi Lulus',
        'status' => 'lulus_ujian',
    ]);

    $wisuda = PeriodeWisuda::create(['nama' => 'Wisuda 2027', 'tanggal_wisuda' => '2027-02-20']);

    // Create UNPAID UKT tagihan overdue
    Tagihan::create([
        'mahasiswa_id' => $mahasiswa->id,
        'tahun_ajaran_id' => $tahun->id,
        'jenis' => 'ukt',
        'nominal' => 3500000.00,
        'jatuh_tempo' => '2026-08-01',
        'status' => 'menunggu_pembayaran',
    ]);

    expect(fn () => $yudisiumService->assignYudisium($mahasiswa, $wisuda->id))
        ->toThrow(DomainException::class, 'TUNGGAKAN UKT');
});

test('IDOR check prevents Mahasiswa A from viewing certificate of Mahasiswa B', function () {
    $fakultas = Fakultas::firstOrCreate(['kode' => 'FTI'], ['nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::firstOrCreate(['kode' => 'PAI'], ['fakultas_id' => $fakultas->id, 'nama' => 'PAI', 'jenjang' => 'S1']);
    $wisuda = PeriodeWisuda::create(['nama' => 'Wisuda 2027', 'tanggal_wisuda' => '2027-02-20']);

    $userMhsA = User::factory()->create(['user_type' => 'mahasiswa']);
    $userMhsA->assignRole('mahasiswa');
    $mhsA = Mahasiswa::create(['user_id' => $userMhsA->id, 'program_studi_id' => $prodi->id, 'nim' => '2026IDOR01', 'nama_lengkap' => 'Student A', 'tahun_masuk' => 2026]);

    $userMhsB = User::factory()->create(['user_type' => 'mahasiswa']);
    $userMhsB->assignRole('mahasiswa');
    $mhsB = Mahasiswa::create(['user_id' => $userMhsB->id, 'program_studi_id' => $prodi->id, 'nim' => '2026IDOR02', 'nama_lengkap' => 'Student B', 'tahun_masuk' => 2026]);

    $yudisiumB = Yudisium::create([
        'mahasiswa_id' => $mhsB->id,
        'periode_wisuda_id' => $wisuda->id,
        'ipk_akhir' => 3.90,
        'nomor_dokumen' => 'YUD/2027/PAI/0002',
    ]);

    // Student A tries to view Student B certificate -> 403 Forbidden
    $this->actingAs($userMhsA)
        ->get("/yudisium/sertifikat/{$yudisiumB->id}")
        ->assertStatus(403);
});

test('yudisium service generates unique sequential document numbers for multiple students in same prodi and year without duplication', function () {
    $yudisiumService = app(YudisiumService::class);

    $fakultas = Fakultas::firstOrCreate(['kode' => 'FTI'], ['nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::firstOrCreate(['kode' => 'PAI'], ['fakultas_id' => $fakultas->id, 'nama' => 'PAI', 'jenjang' => 'S1']);
    $wisuda = PeriodeWisuda::create(['nama' => 'Wisuda 2027', 'tanggal_wisuda' => '2027-02-20']);

    $userMhs1 = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs1 = Mahasiswa::create(['user_id' => $userMhs1->id, 'program_studi_id' => $prodi->id, 'nim' => '2027SEQ001', 'nama_lengkap' => 'Mahasiswa Seq 1', 'tahun_masuk' => 2027]);

    $userMhs2 = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs2 = Mahasiswa::create(['user_id' => $userMhs2->id, 'program_studi_id' => $prodi->id, 'nim' => '2027SEQ002', 'nama_lengkap' => 'Mahasiswa Seq 2', 'tahun_masuk' => 2027]);

    $dosenUser = User::factory()->create(['user_type' => 'dosen']);
    $dosen = Dosen::create(['user_id' => $dosenUser->id, 'program_studi_id' => $prodi->id, 'nama_lengkap' => 'Dr. Pembimbing']);

    Skripsi::create(['mahasiswa_id' => $mhs1->id, 'dosen_pembimbing_id' => $dosen->id, 'judul' => 'Judul 1', 'status' => 'lulus_ujian']);
    Skripsi::create(['mahasiswa_id' => $mhs2->id, 'dosen_pembimbing_id' => $dosen->id, 'judul' => 'Judul 2', 'status' => 'lulus_ujian']);

    $yudisium1 = $yudisiumService->assignYudisium($mhs1, $wisuda->id);
    $yudisium2 = $yudisiumService->assignYudisium($mhs2, $wisuda->id);

    expect($yudisium1->nomor_dokumen)->toBe('YUD/2027/PAI/0001');
    expect($yudisium2->nomor_dokumen)->toBe('YUD/2027/PAI/0002');
    expect($yudisium1->nomor_dokumen)->not->toBe($yudisium2->nomor_dokumen);
});

test('illegal status transition jump for proposal skripsi is rejected', function () {
    $skripsiService = app(SkripsiService::class);
    $fakultas = Fakultas::firstOrCreate(['kode' => 'FTI'], ['nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::firstOrCreate(['kode' => 'PAI'], ['fakultas_id' => $fakultas->id, 'nama' => 'PAI', 'jenjang' => 'S1']);
    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026STATE01', 'nama_lengkap' => 'Student State', 'tahun_masuk' => 2026]);

    $proposal = ProposalSkripsi::create([
        'mahasiswa_id' => $mhs->id,
        'judul' => 'Judul State Machine Test',
        'status' => 'diajukan',
    ]);

    expect(fn () => $skripsiService->scheduleUjianProposal($proposal, '2026-10-10'))
        ->toThrow(DomainException::class, 'TRANSISI STATUS INVALID');
});

test('scheduling exam before reaching MIN_BIMBINGAN threshold is rejected by service', function () {
    $skripsiService = app(SkripsiService::class);
    $fakultas = Fakultas::firstOrCreate(['kode' => 'FTI'], ['nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::firstOrCreate(['kode' => 'PAI'], ['fakultas_id' => $fakultas->id, 'nama' => 'PAI', 'jenjang' => 'S1']);
    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026MINBIM01', 'nama_lengkap' => 'Student Min Bim', 'tahun_masuk' => 2026]);
    $userDosen = User::factory()->create(['user_type' => 'dosen']);
    $dosen = Dosen::create(['user_id' => $userDosen->id, 'program_studi_id' => $prodi->id, 'nama_lengkap' => 'Dr. Pembimbing']);

    $proposal = ProposalSkripsi::create([
        'mahasiswa_id' => $mhs->id,
        'dosen_pembimbing_id' => $dosen->id,
        'judul' => 'Judul Proposal Min Bim',
        'status' => 'bimbingan',
    ]);

    // Only 2 validated bimbingan logs (below MIN_BIMBINGAN_PROPOSAL threshold of 8)
    BimbinganProposal::create(['proposal_skripsi_id' => $proposal->id, 'tanggal' => '2026-09-01', 'catatan' => 'Bimbingan 1', 'divalidasi' => true]);
    BimbinganProposal::create(['proposal_skripsi_id' => $proposal->id, 'tanggal' => '2026-09-05', 'catatan' => 'Bimbingan 2', 'divalidasi' => true]);

    expect(fn () => $skripsiService->scheduleUjianProposal($proposal, '2026-10-10'))
        ->toThrow(DomainException::class, 'SYARAT BIMBINGAN BELUM TERPENUHI');
});

test('IDOR check prevents Mahasiswa A from adding guidance log to proposal of Mahasiswa B', function () {
    $fakultas = Fakultas::firstOrCreate(['kode' => 'FTI'], ['nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::firstOrCreate(['kode' => 'PAI'], ['fakultas_id' => $fakultas->id, 'nama' => 'PAI', 'jenjang' => 'S1']);

    $userMhsA = User::factory()->create(['user_type' => 'mahasiswa']);
    $userMhsA->assignRole('mahasiswa');
    $mhsA = Mahasiswa::create(['user_id' => $userMhsA->id, 'program_studi_id' => $prodi->id, 'nim' => '2026IDORBIM01', 'nama_lengkap' => 'Student IDOR A', 'tahun_masuk' => 2026]);

    $userMhsB = User::factory()->create(['user_type' => 'mahasiswa']);
    $userMhsB->assignRole('mahasiswa');
    $mhsB = Mahasiswa::create(['user_id' => $userMhsB->id, 'program_studi_id' => $prodi->id, 'nim' => '2026IDORBIM02', 'nama_lengkap' => 'Student IDOR B', 'tahun_masuk' => 2026]);

    $proposalB = ProposalSkripsi::create([
        'mahasiswa_id' => $mhsB->id,
        'judul' => 'Judul Mahasiswa B',
        'status' => 'bimbingan',
    ]);

    // Student A tries to post bimbingan log to Student B's proposal -> 403 Forbidden
    $this->actingAs($userMhsA)
        ->post("/skripsi/proposal/{$proposalB->id}/bimbingan", [
            'tanggal' => '2026-09-12',
            'catatan' => 'Bimbingan bajakan',
        ])
        ->assertStatus(403);
});

test('activity log records entries in activity_logs database table for pelanggaran, beasiswa approval, and aktivitas validation', function () {
    $kemahasiswaanService = app(KemahasiswaanService::class);
    $fakultas = Fakultas::firstOrCreate(['kode' => 'FTI'], ['nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::firstOrCreate(['kode' => 'PAI'], ['fakultas_id' => $fakultas->id, 'nama' => 'PAI', 'jenjang' => 'S1']);
    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create(['user_id' => $userMhs->id, 'program_studi_id' => $prodi->id, 'nim' => '2026ACTLOG01', 'nama_lengkap' => 'Student ActLog', 'tahun_masuk' => 2026]);

    $pelanggaran = $kemahasiswaanService->createPelanggaran($mhs, null, null, '2026-08-05');
    $this->assertDatabaseHas('activity_logs', [
        'action' => 'kemahasiswaan.pelanggaran.create',
        'entity_type' => 'PelanggaranMahasiswa',
        'entity_id' => (string) $pelanggaran->id,
    ]);

    $beasiswa = BeasiswaMahasiswa::create(['mahasiswa_id' => $mhs->id, 'status' => 'diajukan']);
    $kemahasiswaanService->approveBeasiswa($beasiswa, 'diterima');
    $this->assertDatabaseHas('activity_logs', [
        'action' => 'kemahasiswaan.beasiswa.approve',
        'entity_type' => 'BeasiswaMahasiswa',
        'entity_id' => (string) $beasiswa->id,
    ]);
});
