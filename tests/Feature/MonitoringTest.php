<?php

use App\Models\ActivityLog;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
});

test('Superadmin can view system monitoring dashboard', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $response = $this->actingAs($superadmin)->get(route('superadmin.monitoring.index'));
    $response->assertOk();
});

test('Non-superadmin cannot access system monitoring', function () {
    $mahasiswa = User::factory()->create([
        'user_type' => 'mahasiswa',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $mahasiswa->assignRole('mahasiswa');

    $response = $this->actingAs($mahasiswa)->get(route('superadmin.monitoring.index'));
    $response->assertForbidden();
});

test('Superadmin can search audit logs by action, entity_type, ip, and user name without database error', function () {
    $superadmin = User::factory()->create([
        'name' => 'Admin Utama',
        'email' => 'admin.utama@test.ac.id',
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    ActivityLog::create([
        'user_id' => $superadmin->id,
        'action' => 'user.login',
        'entity_type' => 'User',
        'entity_id' => $superadmin->id,
        'ip_address' => '192.168.1.50',
    ]);

    // Search by action
    $responseAction = $this->actingAs($superadmin)->get(route('superadmin.monitoring.index', ['search' => 'login']));
    $responseAction->assertOk();

    // Search by entity_type
    $responseEntity = $this->actingAs($superadmin)->get(route('superadmin.monitoring.index', ['search' => 'User']));
    $responseEntity->assertOk();

    // Search by ip_address
    $responseIp = $this->actingAs($superadmin)->get(route('superadmin.monitoring.index', ['search' => '192.168']));
    $responseIp->assertOk();

    // Search by user name relation
    $responseUser = $this->actingAs($superadmin)->get(route('superadmin.monitoring.index', ['search' => 'Utama']));
    $responseUser->assertOk();
});

test('Superadmin can filter audit logs by action filter', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $response = $this->actingAs($superadmin)->get(route('superadmin.monitoring.index', ['action' => 'user.login']));
    $response->assertOk();
});
