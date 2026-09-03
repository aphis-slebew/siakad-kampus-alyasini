<?php

use App\Models\AktivitasMahasiswa;
use App\Models\BeasiswaMahasiswa;
use App\Models\BimbinganProposal;
use App\Models\BimbinganSkripsi;
use App\Models\Dosen;
use App\Models\DosenPengajar;
use App\Models\DosenWali;
use App\Models\JadwalPerkuliahan;
use App\Models\JurnalPerkuliahan;
use App\Models\KelasKuliah;
use App\Models\KomposisiNilai;
use App\Models\Krs;
use App\Models\KrsDetail;
use App\Models\KurikulumMatakuliah;
use App\Models\KurikulumProdi;
use App\Models\Mahasiswa;
use App\Models\Matakuliah;
use App\Models\Nilai;
use App\Models\PelanggaranMahasiswa;
use App\Models\PeriodeRegistrasi;
use App\Models\PeriodeWisuda;
use App\Models\Presensi;
use App\Models\ProgramStudi;
use App\Models\ProposalSkripsi;
use App\Models\ReferensiBiodata;
use App\Models\RegistrasiUlang;
use App\Models\RuangKuliah;
use App\Models\SkalaNilai;
use App\Models\Skripsi;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use App\Models\User;
use App\Models\Yudisium;
use App\Notifications\YudisiumNotification;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
    $this->artisan('db:seed', ['--class' => 'MasterDataSeeder']);
    $this->artisan('db:seed', ['--class' => 'PmbSeeder']);
});

/**
 * Helper function to build a complete, fully-chained realistic domain dataset.
 */
function seedRealisticDomainChain(): array
{
    $prodi = ProgramStudi::first();
    $tahunAjaran = TahunAjaran::first();
    $ruang = RuangKuliah::firstOrCreate(['kode' => 'RKSMOKE', 'nama' => 'Ruang Smoke', 'kapasitas' => 50]);

    // 1. Dosen & Assignment
    $userDosen = User::factory()->create(['user_type' => 'dosen']);
    $userDosen->assignRole('dosen');
    $dosen = Dosen::firstOrCreate(['user_id' => $userDosen->id], [

        'program_studi_id' => $prodi->id,
        'nidn' => '9988776655',
        'nama_lengkap' => 'Dr. Smoke Test Real',
    ]);

    // 2. Student, Tagihan, Registrasi Ulang, Dosen Wali
    $userMhs = User::factory()->create(['user_type' => 'mahasiswa']);
    $userMhs->assignRole('mahasiswa');
    $mahasiswa = Mahasiswa::firstOrCreate(['user_id' => $userMhs->id], [
        'program_studi_id' => $prodi->id,
        'nim' => '2026REALSMOKE',
        'nama_lengkap' => 'Student Smoke Real',
        'tahun_masuk' => 2026,
    ]);

    Tagihan::firstOrCreate(['mahasiswa_id' => $mahasiswa->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'jenis' => 'ukt'], [
        'nominal' => 3500000.00,
        'jatuh_tempo' => '2026-08-30',
        'status' => 'lunas',
    ]);

    $periode = PeriodeRegistrasi::first();
    if ($periode) {
        RegistrasiUlang::firstOrCreate(['periode_registrasi_id' => $periode->id, 'mahasiswa_id' => $mahasiswa->id], [
            'status' => 'selesai',
            'status_verifikasi_dokumen' => 'disetujui',
        ]);
    }

    DosenWali::firstOrCreate(['mahasiswa_id' => $mahasiswa->id, 'dosen_id' => $dosen->id, 'tahun_ajaran_id' => $tahunAjaran->id]);

    // 3. Curriculum, Class, Lecture, Schedule
    $mk = Matakuliah::firstOrCreate(['kode' => 'MKREAL1'], ['nama' => 'Matakuliah Real Smoke', 'sks' => 3, 'jenis' => 'wajib']);
    $kurikulum = KurikulumProdi::firstOrCreate(['program_studi_id' => $prodi->id, 'tahun_kurikulum' => '2026'], ['is_active' => true]);
    $km = KurikulumMatakuliah::firstOrCreate(['kurikulum_prodi_id' => $kurikulum->id, 'matakuliah_id' => $mk->id], ['semester' => 1]);

    $kelas = KelasKuliah::firstOrCreate(['kurikulum_matakuliah_id' => $km->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'nama_kelas' => 'A'], ['kuota' => 30]);

    DosenPengajar::firstOrCreate(['kelas_kuliah_id' => $kelas->id], ['dosen_id' => $dosen->id, 'peran' => 'utama']);
    JadwalPerkuliahan::firstOrCreate(['kelas_kuliah_id' => $kelas->id], [
        'ruang_kuliah_id' => $ruang->id,
        'hari' => 'Senin',
        'jam_mulai' => '08:00:00',
        'jam_selesai' => '10:30:00',
    ]);

    // 4. KRS & Approved Details
    $krs = Krs::firstOrCreate(['mahasiswa_id' => $mahasiswa->id, 'tahun_ajaran_id' => $tahunAjaran->id], ['status' => 'disetujui_wali']);
    $krs->update(['status' => 'disetujui_wali']);
    $detail = KrsDetail::firstOrCreate(['krs_id' => $krs->id, 'kelas_kuliah_id' => $kelas->id]);

    // 5. Journal & Attendance
    $jurnal = JurnalPerkuliahan::firstOrCreate(['kelas_kuliah_id' => $kelas->id, 'tanggal' => date('Y-m-d')], [
        'materi' => 'Pengantar Perkuliahan Smoke',
        'dosen_pengajar_id' => $dosen->id,
    ]);
    Presensi::firstOrCreate(['jurnal_perkuliahan_id' => $jurnal->id, 'mahasiswa_id' => $mahasiswa->id], ['status' => 'hadir']);

    // 6. Grade Composition & Scores
    KomposisiNilai::updateOrCreate(['kelas_kuliah_id' => $kelas->id, 'komponen' => 'tugas'], ['bobot_persen' => 20]);
    KomposisiNilai::updateOrCreate(['kelas_kuliah_id' => $kelas->id, 'komponen' => 'uts'], ['bobot_persen' => 30]);
    KomposisiNilai::updateOrCreate(['kelas_kuliah_id' => $kelas->id, 'komponen' => 'uas'], ['bobot_persen' => 40]);
    KomposisiNilai::updateOrCreate(['kelas_kuliah_id' => $kelas->id, 'komponen' => 'presensi'], ['bobot_persen' => 10]);

    Nilai::updateOrCreate(['krs_detail_id' => $detail->id, 'komponen' => 'tugas'], ['nilai_angka' => 85, 'nilai_huruf' => 'A', 'is_final' => true]);
    Nilai::updateOrCreate(['krs_detail_id' => $detail->id, 'komponen' => 'uts'], ['nilai_angka' => 80, 'nilai_huruf' => 'B+', 'is_final' => true]);

    // 7. Modul 8: Skripsi, Yudisium, Kemahasiswaan
    $proposal = ProposalSkripsi::firstOrCreate(['mahasiswa_id' => $mahasiswa->id], [
        'dosen_pembimbing_id' => $dosen->id,
        'judul' => 'Judul Proposal Smoke Test',
        'status' => 'lulus_ujian',
        'tanggal_ujian' => '2026-10-01',
    ]);
    BimbinganProposal::firstOrCreate(['proposal_skripsi_id' => $proposal->id, 'tanggal' => '2026-09-15'], [
        'catatan' => 'ACC Proposal',
        'divalidasi' => true,
    ]);

    $skripsi = Skripsi::firstOrCreate(['mahasiswa_id' => $mahasiswa->id], [
        'dosen_pembimbing_id' => $dosen->id,
        'judul' => 'Judul Skripsi Full Smoke Test',
        'status' => 'lulus_ujian',
        'tanggal_ujian' => '2026-11-01',
    ]);
    BimbinganSkripsi::firstOrCreate(['skripsi_id' => $skripsi->id, 'tanggal' => '2026-10-15'], [
        'catatan' => 'ACC Skripsi',
        'divalidasi' => true,
    ]);

    $wisuda = PeriodeWisuda::firstOrCreate(['nama' => 'Wisuda Smoke 2026'], [
        'tanggal_wisuda' => '2026-12-01',
    ]);
    $yudisium = Yudisium::firstOrCreate(['mahasiswa_id' => $mahasiswa->id], [
        'periode_wisuda_id' => $wisuda->id,
        'ipk_akhir' => 3.85,
        'nomor_dokumen' => 'YUD/2026/PAI/0001',
    ]);

    $jenisAkt = ReferensiBiodata::firstOrCreate(['tipe' => 'jenis_aktivitas', 'nama' => 'Pramuka']);
    AktivitasMahasiswa::firstOrCreate(['mahasiswa_id' => $mahasiswa->id, 'nama_kegiatan' => 'Kemah Bakti'], [
        'jenis_aktivitas_id' => $jenisAkt->id,
        'divalidasi' => true,
    ]);

    $jenisPel = ReferensiBiodata::firstOrCreate(['tipe' => 'jenis_pelanggaran', 'nama' => 'Terlambat']);
    $sanksi = ReferensiBiodata::firstOrCreate(['tipe' => 'sanksi_pelanggaran', 'nama' => 'Teguran']);
    PelanggaranMahasiswa::firstOrCreate(['mahasiswa_id' => $mahasiswa->id, 'tanggal' => '2026-08-01'], [
        'jenis_pelanggaran_id' => $jenisPel->id,
        'sanksi_id' => $sanksi->id,
    ]);

    $jenisBeasiswa = ReferensiBiodata::firstOrCreate(['tipe' => 'jenis_beasiswa', 'nama' => 'KIP Kuliah']);
    BeasiswaMahasiswa::firstOrCreate(['mahasiswa_id' => $mahasiswa->id, 'jenis_beasiswa_id' => $jenisBeasiswa->id], [
        'status' => 'diterima',
    ]);

    SkalaNilai::firstOrCreate(['huruf' => 'A'], ['min_angka' => 85, 'max_angka' => 100, 'bobot' => 4.00]);
    SkalaNilai::firstOrCreate(['huruf' => 'B+'], ['min_angka' => 75, 'max_angka' => 84.99, 'bobot' => 3.50]);

    return [
        'userDosen' => $userDosen,
        'userMhs' => $userMhs,
        'mahasiswa' => $mahasiswa,
        'dosen' => $dosen,
        'kelas' => $kelas,
        'krs' => $krs,
        'yudisium' => $yudisium,
    ];
}

test('all 30 page routes (Langkah 2 - Langkah 8) return 200 OK with populated realistic data', function () {
    $seeded = seedRealisticDomainChain();
    $admin = User::firstOrCreate(['email' => 'admin@alyasini.ac.id'], [
        'name' => 'Superadmin SIAKAD',
        'password' => Hash::make('password'),
        'user_type' => 'pegawai',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $admin->update(['two_factor_secret' => encrypt('DEV_2FA')]);
    $admin->assignRole('superadmin');

    $dosenUser = $seeded['userDosen'];
    $mhsUser = $seeded['userMhs'];
    $yudisium = $seeded['yudisium'];

    $adminRoutes = [
        '/master/fakultas',
        '/master/program-studi',
        '/master/tahun-ajaran',
        '/master/ruang-kuliah',
        '/master/referensi-biodata',
        '/pmb/calon-mahasiswa',
        '/pmb/jalur',
        '/pmb/gelombang',
        '/keuangan/periode-registrasi',
        '/keuangan/kelompok-ukt',
        '/keuangan/pembayaran',
        '/keuangan/registrasi-ulang',
        '/akademik/matakuliah',
        '/akademik/kurikulum',
        '/akademik/kelas-kuliah',
        '/akademik/dosen-wali',
        '/perwalian/krs',
        '/skripsi/proposal',
        '/skripsi/bimbingan',
        '/yudisium',
        '/kemahasiswaan/aktivitas',
        '/kemahasiswaan/beasiswa',
        '/kemahasiswaan/pelanggaran',
        '/kepegawaian/dosen',
        '/kepegawaian/pegawai',
        '/kepegawaian/unit-kerja',
        '/mahasiswa',
        '/mahasiswa/'.$seeded['mahasiswa']->id,
        '/settings/system-configs',
        '/superadmin/monitoring',
        '/users',
        '/pddikti',
        '/notifications',
        '/laporan/krs',
        '/laporan/rekap-nilai',
        '/laporan/piutang-ukt',
        '/dashboard',
    ];

    $admin->notify(new YudisiumNotification($yudisium->id, $yudisium->nomor_dokumen));

    foreach ($adminRoutes as $r) {
        $this->actingAs($admin)->get($r)->assertStatus(200);
    }

    $this->actingAs($dosenUser)->get('/akademik/presensi')->assertStatus(200);
    $this->actingAs($dosenUser)->get('/akademik/penilaian')->assertStatus(200);

    $this->actingAs($mhsUser)->get('/registrasi-ulang/saya')->assertStatus(200);
    $this->actingAs($mhsUser)->get('/keuangan/bayar')->assertStatus(200);
    $this->actingAs($mhsUser)->get('/krs/saya')->assertStatus(200);
    $this->actingAs($mhsUser)->get('/khs/saya')->assertStatus(200);
    $this->actingAs($mhsUser)->get('/pmb/daftar')->assertStatus(200);
    $this->actingAs($mhsUser)->get('/mahasiswa/profil')->assertStatus(200);
    $this->actingAs($mhsUser)->get('/mahasiswa/jadwal')->assertStatus(200);
    $this->actingAs($mhsUser)->get('/mahasiswa/presensi')->assertStatus(200);
    $this->actingAs($mhsUser)->get('/mahasiswa/riwayat-pembayaran')->assertStatus(200);
    $this->actingAs($mhsUser)->get('/dokumen/transkrip')->assertStatus(200);
    $this->actingAs($mhsUser)->get('/dokumen/kartu-ujian')->assertStatus(200);
    $this->actingAs($mhsUser)->get('/dokumen/khs')->assertStatus(200);
    $this->actingAs($mhsUser)->get('/dokumen/krs')->assertStatus(200);
});
