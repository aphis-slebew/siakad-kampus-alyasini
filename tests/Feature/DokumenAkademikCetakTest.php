<?php

use App\Models\Dosen;
use App\Models\Fakultas;
use App\Models\KelasKuliah;
use App\Models\Krs;
use App\Models\KrsDetail;
use App\Models\KurikulumMatakuliah;
use App\Models\KurikulumProdi;
use App\Models\Mahasiswa;
use App\Models\Matakuliah;
use App\Models\Nilai;
use App\Models\ProgramStudi;
use App\Models\TahunAjaran;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
});

test('Mahasiswa can view and print their own KRS, KHS, Transkrip, and Kartu Ujian', function () {
    $fakultas = Fakultas::create(['kode' => 'TAR', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create([
        'fakultas_id' => $fakultas->id,
        'kode' => 'PAI',
        'nama' => 'Pendidikan Agama Islam',
        'jenjang' => 'S1',
    ]);

    $tahun = TahunAjaran::create([
        'nama' => '2026/2027 Ganjil',
        'mulai' => '2026-09-01',
        'selesai' => '2027-02-28',
        'is_active' => true,
    ]);

    $user = User::factory()->create([
        'user_type' => 'mahasiswa',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $user->assignRole('mahasiswa');

    $mahasiswa = Mahasiswa::create([
        'user_id' => $user->id,
        'program_studi_id' => $prodi->id,
        'nim' => '202601001',
        'nama_lengkap' => 'Ahmad Santri',
        'tahun_masuk' => 2026,
        'status_akademik' => 'aktif',
    ]);

    $kurikulum = KurikulumProdi::create([
        'program_studi_id' => $prodi->id,
        'tahun_kurikulum' => '2026',
        'is_active' => true,
    ]);
    $matakuliah = Matakuliah::create([
        'kode' => 'PAI101',
        'nama' => 'Ilmu Pendidikan Islam',
        'sks' => 3,
    ]);
    $kurikulumMk = KurikulumMatakuliah::create([
        'kurikulum_prodi_id' => $kurikulum->id,
        'matakuliah_id' => $matakuliah->id,
        'semester' => 1,
    ]);
    $kelas = KelasKuliah::create([
        'kurikulum_matakuliah_id' => $kurikulumMk->id,
        'tahun_ajaran_id' => $tahun->id,
        'nama_kelas' => 'PAI-1A',
        'kuota' => 40,
    ]);

    $krs = Krs::create([
        'mahasiswa_id' => $mahasiswa->id,
        'tahun_ajaran_id' => $tahun->id,
        'status' => 'disetujui_wali',
        'approved_by_wali' => true,
    ]);
    $krsDetail = KrsDetail::create([
        'krs_id' => $krs->id,
        'kelas_kuliah_id' => $kelas->id,
    ]);

    $nilai = Nilai::create([
        'krs_detail_id' => $krsDetail->id,
        'komponen' => 'akhir',
        'nilai_angka' => 88.5,
        'nilai_huruf' => 'A',
        'is_final' => true,
    ]);

    // 1. Cetak KRS
    $krsRes = $this->actingAs($user)->get(route('dokumen.krs'));
    $krsRes->assertOk();

    // 2. Cetak KHS
    $khsRes = $this->actingAs($user)->get(route('dokumen.khs'));
    $khsRes->assertOk();

    // 3. Cetak Transkrip
    $transkripRes = $this->actingAs($user)->get(route('dokumen.transkrip'));
    $transkripRes->assertOk();

    // 4. Cetak Kartu Ujian (UTS & UAS)
    $utsRes = $this->actingAs($user)->get(route('dokumen.kartu-ujian', ['jenis' => 'UTS']));
    $utsRes->assertOk();

    $uasRes = $this->actingAs($user)->get(route('dokumen.kartu-ujian', ['jenis' => 'UAS']));
    $uasRes->assertOk();
});

test('Mahasiswa cannot print other student documents (Anti-IDOR protection)', function () {
    $fakultas = Fakultas::create(['kode' => 'TAR', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create([
        'fakultas_id' => $fakultas->id,
        'kode' => 'PAI',
        'nama' => 'Pendidikan Agama Islam',
        'jenjang' => 'S1',
    ]);

    $user1 = User::factory()->create([
        'user_type' => 'mahasiswa',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $user1->assignRole('mahasiswa');
    $mhs1 = Mahasiswa::create([
        'user_id' => $user1->id,
        'program_studi_id' => $prodi->id,
        'nim' => '202601001',
        'nama_lengkap' => 'Mahasiswa Satu',
        'tahun_masuk' => 2026,
    ]);

    $user2 = User::factory()->create([
        'user_type' => 'mahasiswa',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $user2->assignRole('mahasiswa');
    $mhs2 = Mahasiswa::create([
        'user_id' => $user2->id,
        'program_studi_id' => $prodi->id,
        'nim' => '202601002',
        'nama_lengkap' => 'Mahasiswa Dua',
        'tahun_masuk' => 2026,
    ]);

    // Mahasiswa 1 attempts to access Mahasiswa 2's documents -> must return 403
    $krsAttempt = $this->actingAs($user1)->get(route('dokumen.krs', $mhs2));
    $krsAttempt->assertForbidden();

    $khsAttempt = $this->actingAs($user1)->get(route('dokumen.khs', $mhs2));
    $khsAttempt->assertForbidden();

    $transkripAttempt = $this->actingAs($user1)->get(route('dokumen.transkrip', $mhs2));
    $transkripAttempt->assertForbidden();

    $kartuAttempt = $this->actingAs($user1)->get(route('dokumen.kartu-ujian', $mhs2));
    $kartuAttempt->assertForbidden();
});

test('Admin and Dosen can print student documents and Berita Acara Perkuliahan', function () {
    $admin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $admin->assignRole('superadmin');

    $fakultas = Fakultas::create(['kode' => 'TAR', 'nama' => 'Tarbiyah']);
    $prodi = ProgramStudi::create([
        'fakultas_id' => $fakultas->id,
        'kode' => 'PAI',
        'nama' => 'Pendidikan Agama Islam',
        'jenjang' => 'S1',
    ]);

    $tahun = TahunAjaran::create([
        'nama' => '2026/2027 Ganjil',
        'mulai' => '2026-09-01',
        'selesai' => '2027-02-28',
        'is_active' => true,
    ]);

    $mhsUser = User::factory()->create(['user_type' => 'mahasiswa']);
    $mhs = Mahasiswa::create([
        'user_id' => $mhsUser->id,
        'program_studi_id' => $prodi->id,
        'nim' => '202601009',
        'nama_lengkap' => 'Siti Aisyah',
        'tahun_masuk' => 2026,
    ]);

    $dosenUser = User::factory()->create([
        'user_type' => 'dosen',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $dosenUser->assignRole('dosen');
    $dosen = Dosen::create([
        'user_id' => $dosenUser->id,
        'program_studi_id' => $prodi->id,
        'nama_lengkap' => 'Dr. H. Ahmad Fauzi',
    ]);

    $kurikulum = KurikulumProdi::create([
        'program_studi_id' => $prodi->id,
        'tahun_kurikulum' => '2026',
        'is_active' => true,
    ]);
    $matakuliah = Matakuliah::create([
        'kode' => 'PAI102',
        'nama' => 'Filsafat Pendidikan Islam',
        'sks' => 3,
    ]);
    $kurikulumMk = KurikulumMatakuliah::create([
        'kurikulum_prodi_id' => $kurikulum->id,
        'matakuliah_id' => $matakuliah->id,
        'semester' => 1,
    ]);
    $kelas = KelasKuliah::create([
        'kurikulum_matakuliah_id' => $kurikulumMk->id,
        'tahun_ajaran_id' => $tahun->id,
        'nama_kelas' => 'PAI-1B',
        'kuota' => 40,
    ]);
    $kelas->dosenPengajars()->create([
        'dosen_id' => $dosen->id,
        'rencana_tatap_muka' => 16,
    ]);

    // Admin can access student documents
    $adminKrs = $this->actingAs($admin)->get(route('dokumen.krs', $mhs));
    $adminKrs->assertOk();

    $adminTranskrip = $this->actingAs($admin)->get(route('dokumen.transkrip', $mhs));
    $adminTranskrip->assertOk();

    // Dosen can print Berita Acara for their class
    $dosenBap = $this->actingAs($dosenUser)->get(route('dokumen.kelas.berita-acara', $kelas));
    $dosenBap->assertOk();

    // Admin can print Berita Acara for any class
    $adminBap = $this->actingAs($admin)->get(route('dokumen.kelas.berita-acara', $kelas));
    $adminBap->assertOk();
});
