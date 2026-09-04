<?php

use App\Models\TahunAjaran;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
});

test('Superadmin can view master tahun ajaran list', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $response = $this->actingAs($superadmin)->get(route('master.tahun-ajaran.index'));
    $response->assertOk();
});

test('Non-authorized user cannot access master tahun ajaran', function () {
    $mahasiswa = User::factory()->create([
        'user_type' => 'mahasiswa',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $mahasiswa->assignRole('mahasiswa');

    $response = $this->actingAs($mahasiswa)->get(route('master.tahun-ajaran.index'));
    $response->assertForbidden();
});

test('Superadmin can search tahun ajaran by name without database error', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    TahunAjaran::create([
        'nama' => '2026/2027 Ganjil',
        'mulai' => '2026-09-01',
        'selesai' => '2027-01-31',
        'is_active' => true,
    ]);

    TahunAjaran::create([
        'nama' => '2026/2027 Genap',
        'mulai' => '2027-02-01',
        'selesai' => '2027-06-30',
        'is_active' => false,
    ]);

    $responseSearch = $this->actingAs($superadmin)->get(route('master.tahun-ajaran.index', ['search' => 'Ganjil']));
    $responseSearch->assertOk();

    $responseFilterActive = $this->actingAs($superadmin)->get(route('master.tahun-ajaran.index', ['status' => 'active']));
    $responseFilterActive->assertOk();

    $responseFilterInactive = $this->actingAs($superadmin)->get(route('master.tahun-ajaran.index', ['status' => 'inactive']));
    $responseFilterInactive->assertOk();
});
