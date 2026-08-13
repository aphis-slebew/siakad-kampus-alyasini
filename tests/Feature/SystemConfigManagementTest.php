<?php

use App\Models\ActivityLog;
use App\Models\SystemConfig;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Database\Seeders\SystemConfigSeeder;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => RoleAndPermissionSeeder::class]);
    $this->artisan('db:seed', ['--class' => SystemConfigSeeder::class]);
});

test('superadmin can access system configs index page', function () {
    $superadmin = User::firstOrCreate(
        ['email' => 'superadmin@alyasini.ac.id'],
        [
            'name' => 'Superadmin User',
            'password' => Hash::make('password'),
            'user_type' => 'superadmin',
            'two_factor_secret' => encrypt('DEV_2FA'),
        ]
    );
    $superadmin->update(['two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');


    $response = $this->actingAs($superadmin)->get('/settings/system-configs');

    $response->assertStatus(200);
});

test('non-superadmin users receive 403 forbidden when accessing system configs', function () {
    $rolesToTest = ['staf_keuangan', 'dosen', 'mahasiswa'];

    foreach ($rolesToTest as $roleName) {
        $user = User::factory()->create(['user_type' => $roleName]);
        $user->assignRole($roleName);

        $responseIndex = $this->actingAs($user)->get('/settings/system-configs');
        $responseIndex->assertStatus(403);

        $config = SystemConfig::first();
        $responseUpdate = $this->actingAs($user)->put("/settings/system-configs/{$config->id}", [
            'value' => '99',
        ]);
        $responseUpdate->assertStatus(403);
    }
});

test('superadmin can update system config value and trigger activity log entry', function () {
    $superadmin = User::firstOrCreate(
        ['email' => 'superadmin@alyasini.ac.id'],
        [
            'name' => 'Superadmin User',
            'password' => Hash::make('password'),
            'user_type' => 'superadmin',
            'two_factor_secret' => encrypt('DEV_2FA'),
        ]
    );
    $superadmin->update(['two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');


    $config = SystemConfig::where('key', 'MAX_SKS_DEFAULT')->firstOrFail();
    $oldVal = $config->value;

    $response = $this->actingAs($superadmin)->put("/settings/system-configs/{$config->id}", [
        'value' => '20',
    ]);

    $response->assertRedirect();
    $config->refresh();
    expect($config->value)->toBe('20');

    // Assert Activity Log Recorded
    $log = ActivityLog::where('action', 'system_config.update')
        ->where('entity_type', 'SystemConfig')
        ->where('entity_id', (string) $config->id)
        ->latest()
        ->first();

    expect($log)->not->toBeNull();
    expect($log->user_id)->toBe($superadmin->id);
    expect($log->old_values['value'])->toBe($oldVal);
    expect($log->new_values['value'])->toBe('20');
});

test('validation fails on invalid data type input for system configs', function () {
    $superadmin = User::firstOrCreate(
        ['email' => 'superadmin@alyasini.ac.id'],
        [
            'name' => 'Superadmin User',
            'password' => Hash::make('password'),
            'user_type' => 'superadmin',
            'two_factor_secret' => encrypt('DEV_2FA'),
        ]
    );
    $superadmin->update(['two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');


    $numberConfig = SystemConfig::where('key', 'MIN_BIMBINGAN_PROPOSAL')->firstOrFail();
    $responseNumber = $this->actingAs($superadmin)->put("/settings/system-configs/{$numberConfig->id}", [
        'value' => 'bukan_angka',
    ]);
    $responseNumber->assertSessionHasErrors('value');

    $dateConfig = SystemConfig::where('key', 'KRS_OPENING_DATE')->firstOrFail();
    $responseDate = $this->actingAs($superadmin)->put("/settings/system-configs/{$dateConfig->id}", [
        'value' => 'tanggal-salah',
    ]);
    $responseDate->assertSessionHasErrors('value');
});
