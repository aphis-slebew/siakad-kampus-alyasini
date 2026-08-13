<?php

namespace Database\Seeders;

use App\Models\GelombangPendaftaran;
use App\Models\JalurPendaftaran;
use Illuminate\Database\Seeder;

class PmbSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        GelombangPendaftaran::firstOrCreate(['nama' => 'Gelombang 1 TA 2026/2027'], [
            'mulai_pendaftaran' => '2026-01-01',
            'selesai_pendaftaran' => '2026-06-30',
            'kuota' => 150,
            'is_active' => true,
        ]);

        JalurPendaftaran::firstOrCreate(['nama' => 'Reguler'], [
            'biaya_pendaftaran' => 250000,
        ]);

        JalurPendaftaran::firstOrCreate(['nama' => 'Prestasi Akademik / Hafidz'], [
            'biaya_pendaftaran' => 0,
        ]);

        JalurPendaftaran::firstOrCreate(['nama' => 'Beasiswa KIP-K'], [
            'biaya_pendaftaran' => 0,
        ]);
    }
}
