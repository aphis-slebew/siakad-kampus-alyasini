<?php

namespace Database\Seeders;

use App\Models\Dosen;
use App\Models\DosenPengajar;
use App\Models\KelasKuliah;
use App\Models\KelompokUkt;
use App\Models\Mahasiswa;
use App\Models\MahasiswaUkt;
use App\Models\Pembayaran;
use App\Models\PeriodeRegistrasi;
use App\Models\ProgramStudi;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DevDummySeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the development / testing database with realistic mock data & dummy accounts.
     */
    public function run(): void
    {
        $this->call(RoleAndPermissionSeeder::class);
        $this->call(MasterDataSeeder::class);
        $this->call(SystemConfigSeeder::class);
        $this->call(PmbSeeder::class);

        // 1. Superadmin User (Dev Dummy with pre-enabled 2FA)
        $superadmin = User::firstOrCreate(
            ['email' => 'admin@alyasini.ac.id'],
            [
                'name' => 'Superadmin SIAKAD',
                'password' => Hash::make('password'),
                'user_type' => 'superadmin',
                'status' => 'aktif',
            ]
        );
        $superadmin->update([
            'two_factor_secret' => encrypt('JBSWY3DPEHPK3PXP'),
            'two_factor_recovery_codes' => encrypt(json_encode(['DEV-REC-01', 'DEV-REC-02', 'DEV-REC-03'])),
            'two_factor_confirmed_at' => now(),
        ]);
        $superadmin->assignRole('superadmin');

        // 2. Admin Akademik User (Dev Dummy with pre-enabled 2FA)
        $adminAkademik = User::firstOrCreate(
            ['email' => 'akademik@alyasini.ac.id'],
            [
                'name' => 'Staf Akademik',
                'password' => Hash::make('password'),
                'user_type' => 'pegawai',
                'status' => 'aktif',
            ]
        );
        $adminAkademik->update([
            'two_factor_secret' => encrypt('JBSWY3DPEHPK3PXP'),
            'two_factor_recovery_codes' => encrypt(json_encode(['DEV-REC-01', 'DEV-REC-02', 'DEV-REC-03'])),
            'two_factor_confirmed_at' => now(),
        ]);
        $adminAkademik->assignRole('admin_akademik');

        // 3. Panitia PMB User
        $panitiaPmb = User::firstOrCreate(
            ['email' => 'pmb@alyasini.ac.id'],
            [
                'name' => 'Panitia PMB',
                'password' => Hash::make('password'),
                'user_type' => 'pegawai',
                'status' => 'aktif',
            ]
        );
        $panitiaPmb->assignRole('panitia_pmb');

        // 4. Staf Keuangan User
        $stafKeuangan = User::firstOrCreate(
            ['email' => 'keuangan@alyasini.ac.id'],
            [
                'name' => 'Staf Keuangan',
                'password' => Hash::make('password'),
                'user_type' => 'pegawai',
                'status' => 'aktif',
            ]
        );
        $stafKeuangan->assignRole('staf_keuangan');

        // 5. Kaprodi User
        $kaprodiUser = User::firstOrCreate(
            ['email' => 'kaprodi@alyasini.ac.id'],
            [
                'name' => 'Dr. H. Kaprodi PAI',
                'password' => Hash::make('password'),
                'user_type' => 'dosen',
                'status' => 'aktif',
            ]
        );
        $kaprodiUser->assignRole('kaprodi');

        $kaprodiModel = Dosen::firstOrCreate(
            ['user_id' => $kaprodiUser->id],
            [
                'program_studi_id' => ProgramStudi::first()?->id ?? 1,
                'nidn' => '0712345602',
                'nama_lengkap' => 'Dr. H. Kaprodi PAI, M.Pd.I.',
                'gelar_depan' => 'Dr. H.',
                'gelar_belakang' => 'M.Pd.I.',
                'jenis_kelamin' => 'L',
                'status_kepegawaian' => 'tetap',
            ]
        );

        // 6. Dosen User & Model
        $dosenUser = User::firstOrCreate(
            ['email' => 'dosen@alyasini.ac.id'],
            [
                'name' => 'Dr. Ahmad Dosen',
                'password' => Hash::make('password'),
                'user_type' => 'dosen',
                'status' => 'aktif',
            ]
        );
        $dosenUser->assignRole('dosen');

        $dosenModel = Dosen::firstOrCreate(
            ['user_id' => $dosenUser->id],
            [
                'program_studi_id' => ProgramStudi::first()?->id ?? 1,
                'nidn' => '0712345601',
                'nama_lengkap' => 'Dr. Ahmad Dosen, M.Pd.',
                'gelar_depan' => 'Dr.',
                'gelar_belakang' => 'M.Pd.',
                'jenis_kelamin' => 'L',
                'status_kepegawaian' => 'tetap',
            ]
        );

        $sampleKelas = KelasKuliah::first();
        if ($sampleKelas && $dosenModel) {
            DosenPengajar::firstOrCreate(
                ['kelas_kuliah_id' => $sampleKelas->id, 'dosen_id' => $dosenModel->id],
                ['peran' => 'utama', 'bobot_sks' => 3.0]
            );
        }

        // 7. Staf Kepegawaian User
        $stafKepegawaian = User::firstOrCreate(
            ['email' => 'kepegawaian@alyasini.ac.id'],
            [
                'name' => 'Staf Kepegawaian',
                'password' => Hash::make('password'),
                'user_type' => 'pegawai',
                'status' => 'aktif',
            ]
        );
        $stafKepegawaian->assignRole('staf_kepegawaian');

        // 8. Mahasiswa User & Model
        $userMhs = User::firstOrCreate(
            ['email' => 'mahasiswa@alyasini.ac.id'],
            [
                'name' => 'Budi Mahasiswa',
                'password' => Hash::make('password'),
                'user_type' => 'mahasiswa',
                'status' => 'aktif',
            ]
        );
        $userMhs->assignRole('mahasiswa');

        // 9. Calon Mahasiswa User
        $calonMhs = User::firstOrCreate(
            ['email' => 'calon@alyasini.ac.id'],
            [
                'name' => 'Calon Mahasiswa Pendaftar',
                'password' => Hash::make('password'),
                'user_type' => 'calon_mahasiswa',
                'status' => 'aktif',
            ]
        );
        $calonMhs->assignRole('calon_mahasiswa');

        // 10. Operator Kemahasiswaan User
        $opKemahasiswaan = User::firstOrCreate(
            ['email' => 'kemahasiswaan@alyasini.ac.id'],
            [
                'name' => 'Operator Kemahasiswaan',
                'password' => Hash::make('password'),
                'user_type' => 'pegawai',
                'status' => 'aktif',
            ]
        );
        $opKemahasiswaan->assignRole('operator_kemahasiswaan');

        $prodi = ProgramStudi::first();
        $tahunAjaran = TahunAjaran::first();

        $mahasiswa = Mahasiswa::firstOrCreate(
            ['user_id' => $userMhs->id],
            [
                'program_studi_id' => $prodi->id,
                'nim' => '2026PAI0001',
                'nama_lengkap' => 'Budi Mahasiswa',
                'nik' => '3515000000000088',
                'tahun_masuk' => 2026,
                'status_mahasiswa' => 'aktif',
            ]
        );

        $kelompokUkt = KelompokUkt::firstOrCreate(
            ['program_studi_id' => $prodi->id, 'nama' => 'Kelompok II'],
            ['nominal_per_semester' => 3000000.00]
        );

        MahasiswaUkt::firstOrCreate(
            ['mahasiswa_id' => $mahasiswa->id, 'tahun_ajaran_id' => $tahunAjaran->id],
            ['kelompok_ukt_id' => $kelompokUkt->id, 'status' => 'aktif']
        );

        $periode = PeriodeRegistrasi::firstOrCreate(
            ['tahun_ajaran_id' => $tahunAjaran->id, 'jenis' => 'mahasiswa_lama'],
            ['mulai' => '2026-08-01', 'selesai' => '2026-08-30']
        );

        $tagihan = Tagihan::firstOrCreate(
            ['mahasiswa_id' => $mahasiswa->id, 'tahun_ajaran_id' => $tahunAjaran->id, 'jenis' => 'ukt'],
            ['nominal' => 3000000.00, 'jatuh_tempo' => '2026-08-30', 'status' => 'belum_bayar']
        );

        Pembayaran::firstOrCreate(
            ['tagihan_id' => $tagihan->id, 'nominal_dibayar' => 3000000.00],
            ['tanggal_bayar' => '2026-08-10', 'metode' => 'transfer_manual', 'status_verifikasi' => 'menunggu']
        );
    }
}
