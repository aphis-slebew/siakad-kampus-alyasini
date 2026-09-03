<?php

namespace Database\Seeders;

use App\Models\SystemConfig;
use Illuminate\Database\Seeder;

class SystemConfigSeeder extends Seeder
{
    /**
     * Predefined SystemConfig Whitelist parameters for SIAKAD Al-Yasini.
     */
    public static array $whitelist = [
        'MAX_SKS_DEFAULT' => [
            'value' => '24',
            'type' => 'number',
            'description' => 'Batas maksimal SKS perkuliahan standar per semester',
        ],
        'KRS_OPENING_DATE' => [
            'value' => '2026-08-01',
            'type' => 'date',
            'description' => 'Tanggal pembukaan akses pengajuan KRS oleh mahasiswa',
        ],
        'KRS_CLOSING_DATE' => [
            'value' => '2026-08-31',
            'type' => 'date',
            'description' => 'Tanggal penutupan akses pengajuan KRS oleh mahasiswa',
        ],
        'DENDA_UKT_PER_HARI' => [
            'value' => '5000.00',
            'type' => 'decimal',
            'description' => 'Nominal denda keterlambatan pembayaran UKT per hari',
        ],
        'MIN_BIMBINGAN_PROPOSAL' => [
            'value' => '8',
            'type' => 'number',
            'description' => 'Syarat minimal log konsultasi bimbingan proposal skripsi',
        ],
        'MIN_BIMBINGAN_SKRIPSI' => [
            'value' => '8',
            'type' => 'number',
            'description' => 'Syarat minimal log konsultasi bimbingan skripsi penuh',
        ],
        'MIN_IPK_YUDISIUM' => [
            'value' => '2.00',
            'type' => 'decimal',
            'description' => 'Syarat minimal IPK kumulatif kelulusan yudisium',
        ],
        'MIN_SKS_YUDISIUM' => [
            'value' => '138',
            'type' => 'number',
            'description' => 'Syarat minimal total SKS lulus untuk penetapan yudisium',
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (static::$whitelist as $key => $meta) {
            SystemConfig::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $meta['value'],
                    'description' => $meta['description'],
                ]
            );
        }
    }
}
