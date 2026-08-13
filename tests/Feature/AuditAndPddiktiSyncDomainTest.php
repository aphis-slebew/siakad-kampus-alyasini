<?php

use App\Models\ActivityLog;
use App\Models\PddiktiMapping;
use App\Models\PddiktiSyncLog;
use App\Models\SystemConfig;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('activity logs and system configs function properly', function () {
    $user = User::factory()->create(['user_type' => 'superadmin']);

    $log = ActivityLog::create([
        'user_id' => $user->id,
        'action' => 'UPDATE_NILAI_FINAL',
        'entity_type' => 'App\Models\Nilai',
        'entity_id' => 101,
        'old_values' => ['nilai_angka' => 75.00, 'nilai_huruf' => 'B'],
        'new_values' => ['nilai_angka' => 85.00, 'nilai_huruf' => 'A'],
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Mozilla/5.0 Test Agent',
    ]);

    $config = SystemConfig::create([
        'key' => 'MAX_SKS_DEFAULT',
        'value' => '24',
        'description' => 'Batas maksimal SKS default per semester',
    ]);

    expect($log->user->id)->toBe($user->id);
    expect($log->old_values['nilai_huruf'])->toBe('B');
    expect($log->new_values['nilai_huruf'])->toBe('A');
    expect(SystemConfig::where('key', 'MAX_SKS_DEFAULT')->first()->value)->toBe('24');
});

test('pddikti sync logs and mappings function properly', function () {
    $syncLog = PddiktiSyncLog::create([
        'table_name' => 'mahasiswas',
        'record_id' => 42,
        'action' => 'insert',
        'status' => 'success',
        'pddikti_id' => 'feeder-uuid-99887766',
        'synced_at' => now(),
    ]);

    $mapping = PddiktiMapping::create([
        'local_table' => 'mahasiswas',
        'local_id' => 42,
        'pddikti_table' => 'mahasiswa_pt',
        'pddikti_id' => 'feeder-uuid-99887766',
    ]);

    expect($syncLog->status)->toBe('success');
    expect($syncLog->pddikti_id)->toBe('feeder-uuid-99887766');
    expect($mapping->pddikti_id)->toBe('feeder-uuid-99887766');
});
