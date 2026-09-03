<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Define all 10 roles
        $roles = [
            'superadmin',
            'admin_akademik',
            'panitia_pmb',
            'staf_keuangan',
            'kaprodi',
            'dosen',
            'staf_kepegawaian',
            'mahasiswa',
            'calon_mahasiswa',
            'operator_kemahasiswaan',
        ];

        foreach ($roles as $roleName) {
            Role::findOrCreate($roleName, 'web');
        }

        // 2. Define initial permissions grouped by domain
        $permissions = [
            // Master Data & Referensi
            'master_data.view',
            'master_data.manage',

            // PMB
            'pmb.manage',
            'pmb.manage_gelombang',
            'pmb.verify_berkas',
            'pmb.input_jadwal_seleksi',
            'pmb.input_hasil_seleksi',

            // Keuangan & UKT
            'keuangan.manage',
            'keuangan.manage_ukt',
            'keuangan.generate_tagihan',
            'keuangan.verify_pembayaran',
            'keuangan.view_piutang',

            'akademik.view_kurikulum',
            'akademik.manage_kurikulum',

            'akademik.manage_kelas',
            'krs.submit',
            'krs.approve',

            // Perkuliahan & Nilai
            'nilai.input',
            'nilai.approve',
            'nilai.pemutihan',

            // Kepegawaian
            'kepegawaian.manage_dosen',
            'kepegawaian.manage_pegawai',

            // Skripsi & Yudisium
            'skripsi.bimbingan',
            'skripsi.approve',
            'yudisium.manage',

            // Kemahasiswaan
            'kemahasiswaan.manage_aktivitas',
            'kemahasiswaan.manage_pelanggaran',
            'kemahasiswaan.manage_beasiswa',

            // PD-DIKTI Neo Feeder
            'pddikti.view',
            'pddikti.manage',
        ];

        foreach ($permissions as $permissionName) {
            Permission::findOrCreate($permissionName, 'web');
        }

        // Flush cache so syncPermissions can resolve newly created permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 3. Assign initial permissions to roles
        $adminAkademik = Role::findByName('admin_akademik', 'web');
        $adminAkademik->syncPermissions([
            'master_data.view',
            'master_data.manage',
            'akademik.view_kurikulum',
            'akademik.manage_kurikulum',
            'akademik.manage_kelas',
            'nilai.approve',
            'nilai.pemutihan',
            'skripsi.approve',
            'yudisium.manage',
            'pddikti.view',
            'pddikti.manage',
        ]);

        $panitiaPmb = Role::findByName('panitia_pmb', 'web');
        $panitiaPmb->syncPermissions([
            'pmb.manage',
            'pmb.manage_gelombang',
            'pmb.verify_berkas',
            'pmb.input_jadwal_seleksi',
            'pmb.input_hasil_seleksi',
        ]);

        $stafKeuangan = Role::findByName('staf_keuangan', 'web');
        $stafKeuangan->syncPermissions([
            'keuangan.manage',
            'keuangan.manage_ukt',
            'keuangan.generate_tagihan',
            'keuangan.verify_pembayaran',
            'keuangan.view_piutang',
        ]);

        $kaprodi = Role::findByName('kaprodi', 'web');
        $kaprodi->syncPermissions([
            'master_data.view',
            'akademik.view_kurikulum',
            'krs.approve',
            'nilai.input',
            'nilai.approve',
            'skripsi.bimbingan',
            'skripsi.approve',
        ]);

        $dosen = Role::findByName('dosen', 'web');
        $dosen->syncPermissions([
            'akademik.view_kurikulum',
            'krs.approve',
            'nilai.input',
            'skripsi.bimbingan',
        ]);

        $stafKepegawaian = Role::findByName('staf_kepegawaian', 'web');
        $stafKepegawaian->syncPermissions([
            'kepegawaian.manage_dosen',
            'kepegawaian.manage_pegawai',
        ]);

        $mahasiswa = Role::findByName('mahasiswa', 'web');
        $mahasiswa->syncPermissions([
            'krs.submit',
        ]);

        $operatorKemahasiswaan = Role::findByName('operator_kemahasiswaan', 'web');
        $operatorKemahasiswaan->syncPermissions([
            'kemahasiswaan.manage_aktivitas',
            'kemahasiswaan.manage_pelanggaran',
            'kemahasiswaan.manage_beasiswa',
        ]);
    }
}
