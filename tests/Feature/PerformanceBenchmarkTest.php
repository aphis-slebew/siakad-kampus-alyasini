<?php

use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(MasterDataSeeder::class);
});

test('Performance benchmark of key Web pages', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $routes = [
        'Dashboard' => '/dashboard',
        'User Management' => '/users',
        'Monitoring Audit Log' => '/superadmin/monitoring',
        'Data Mahasiswa' => '/mahasiswa',
        'Kelas Kuliah' => '/akademik/kelas-kuliah',
        'Dosen Wali' => '/akademik/dosen-wali',
        'Kasir Keuangan' => '/keuangan/kasir',
        'Pembayaran UKT' => '/keuangan/pembayaran',
        'Notifikasi' => '/notifications',
        'Master Perguruan Tinggi' => '/master/perguruan-tinggi',
        'Master Tahun Ajaran' => '/master/tahun-ajaran',
    ];

    $out = "\n\n========================================================================================\n";
    $out .= "                   BENCHMARK PERFORMA SISTEM SIAKAD AL-YASINI (AUTOMATED)               \n";
    $out .= "========================================================================================\n";

    foreach ($routes as $label => $uri) {
        DB::flushQueryLog();
        DB::enableQueryLog();
        $start = microtime(true);

        $response = $this->actingAs($superadmin)->get($uri);

        $duration = round((microtime(true) - $start) * 1000, 2);
        $queries = DB::getQueryLog();
        $queryCount = count($queries);
        $totalDbTime = round(array_sum(array_column($queries, 'time')), 2);
        $payloadSize = strlen($response->getContent());

        $status = $response->status();

        $out .= sprintf("%-24s | HTTP: %d | Time: %7.2f ms | DB: %6.2f ms (%2d queries) | HTML: %4d KB\n",
            $label, $status, $duration, $totalDbTime, $queryCount, round($payloadSize / 1024));

        // Slow queries > 10ms
        foreach ($queries as $q) {
            if ($q['time'] > 15) {
                $out .= sprintf("   ⚠ SLOW QUERY (%.2f ms): %s\n", $q['time'], substr($q['query'], 0, 110))."\n";
            }
        }

        // Duplicate queries
        $counts = array_count_values(array_column($queries, 'query'));
        foreach ($counts as $sql => $count) {
            if ($count > 1) {
                $out .= sprintf("   ⚠ DUPLICATE QUERY (%dx): %s\n", $count, substr($sql, 0, 110))."\n";
            }
        }

        expect($status)->toBe(200);
    }

    $out .= "========================================================================================\n\n";
    file_put_contents(storage_path('logs/benchmark_results.txt'), $out);
});
