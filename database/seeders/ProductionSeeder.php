<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProductionSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the production database with essential structural data ONLY.
     */
    public function run(): void
    {
        // 1. Roles & Permissions (Spatie Permission structure)
        $this->call(RoleAndPermissionSeeder::class);

        // 2. Default System Configs
        $this->call(SystemConfigSeeder::class);

        // 3. Initial Superadmin Account with Random Password
        $randomPassword = Str::random(16);

        $superadmin = User::firstOrCreate(
            ['email' => 'admin@alyasini.ac.id'],
            [
                'name' => 'Superadmin SIAKAD',
                'password' => Hash::make($randomPassword),
                'user_type' => 'superadmin',
                'status' => 'aktif',
            ]
        );
        $superadmin->assignRole('superadmin');

        // Output initial superadmin password to console
        if ($this->command) {
            $this->command->warn('================================================================');
            $this->command->warn("  PASSWORD AWAL SUPERADMIN PRODUKSI: {$randomPassword}");
            $this->command->warn('  SIMPAN DAN GANTI SEGERA SETELAH LOGIN PERTAMA!');
            $this->command->warn('================================================================');
        }
    }
}
