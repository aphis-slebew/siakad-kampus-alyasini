<?php

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => RoleAndPermissionSeeder::class]);
});

test('superadmin or admin akademik without 2fa is forced to security setup page when visiting dashboard', function () {
    $superadminWithout2FA = User::factory()->withoutTwoFactor()->create([
        'user_type' => 'superadmin',
    ]);

    $superadminWithout2FA->assignRole('superadmin');

    $response = $this->actingAs($superadminWithout2FA)->get('/dashboard');

    $response->assertRedirect(route('security.edit'));
    $response->assertSessionHas('warning', 'Akun dengan hak akses Superadmin/Admin Akademik wajib mengaktifkan Verifikasi 2 Langkah (2FA) sebelum mengakses fitur sistem.');
});

test('superadmin or admin akademik with 2fa enabled can access dashboard and protected routes normally', function () {
    $superadminWith2FA = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('SECRET123'),
    ]);
    $superadminWith2FA->assignRole('superadmin');

    $response = $this->actingAs($superadminWith2FA)->get('/dashboard');

    $response->assertStatus(200);
});

test('other roles like dosen and mahasiswa without 2fa are not affected by mandatory 2fa middleware', function () {
    $dosenWithout2FA = User::factory()->create([
        'user_type' => 'dosen',
        'two_factor_secret' => null,
    ]);
    $dosenWithout2FA->assignRole('dosen');

    $mhsWithout2FA = User::factory()->create([
        'user_type' => 'mahasiswa',
        'two_factor_secret' => null,
    ]);
    $mhsWithout2FA->assignRole('mahasiswa');

    $resDosen = $this->actingAs($dosenWithout2FA)->get('/dashboard');
    $resDosen->assertStatus(200);

    $resMhs = $this->actingAs($mhsWithout2FA)->get('/dashboard');
    $resMhs->assertStatus(200);
});
