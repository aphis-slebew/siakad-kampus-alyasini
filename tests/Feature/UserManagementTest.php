<?php

use App\Models\User;
use App\Notifications\PasswordResetByAdminNotification;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
});

test('Superadmin can view user management list', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $response = $this->actingAs($superadmin)->get(route('users.index'));
    $response->assertOk();
});

test('Superadmin can search users by name and email without database error', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'name' => 'Super Administrator',
        'email' => 'admin@test.ac.id',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $target = User::factory()->create([
        'name' => 'Fulan bin Fulan',
        'email' => 'fulan@test.ac.id',
        'user_type' => 'mahasiswa',
    ]);
    $target->assignRole('mahasiswa');

    $response = $this->actingAs($superadmin)->get(route('users.index', ['search' => 'Fulan']));
    $response->assertOk();

    $responseEmail = $this->actingAs($superadmin)->get(route('users.index', ['search' => 'fulan@test.ac.id']));
    $responseEmail->assertOk();
});

test('Non-superadmin cannot access user management', function () {
    $mahasiswa = User::factory()->create([
        'user_type' => 'mahasiswa',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $mahasiswa->assignRole('mahasiswa');

    $response = $this->actingAs($mahasiswa)->get(route('users.index'));
    $response->assertForbidden();
});

test('Superadmin can create new user and assign role', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $response = $this->actingAs($superadmin)->post(route('users.store'), [
        'name' => 'Staf Baru',
        'email' => 'staf.baru@alyasini.ac.id',
        'password' => 'password123',
        'user_type' => 'pegawai',
        'role' => 'staf_keuangan',
        'status' => 'aktif',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'email' => 'staf.baru@alyasini.ac.id',
        'name' => 'Staf Baru',
    ]);

    $created = User::where('email', 'staf.baru@alyasini.ac.id')->first();
    expect($created->hasRole('staf_keuangan'))->toBeTrue();
});

test('Superadmin can reset any user password', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $targetUser = User::factory()->create([
        'user_type' => 'dosen',
        'password' => Hash::make('oldpassword'),
    ]);

    $response = $this->actingAs($superadmin)->post(route('users.reset-password', $targetUser), [
        'password' => 'newSecretPassword123',
        'password_confirmation' => 'newSecretPassword123',
    ]);

    $response->assertRedirect();
    $targetUser->refresh();
    expect(Hash::check('newSecretPassword123', $targetUser->password))->toBeTrue();
});

test('Superadmin can impersonate another user and leave impersonation', function () {
    $superadmin = User::factory()->create([
        'name' => 'Super Admin',
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $targetUser = User::factory()->create([
        'name' => 'Dosen Ahmad',
        'user_type' => 'dosen',
    ]);
    $targetUser->assignRole('dosen');

    // 1. Impersonate
    $impersonateResponse = $this->actingAs($superadmin)->post(route('users.impersonate', $targetUser));
    $impersonateResponse->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($targetUser);
    expect(session('impersonator_id'))->toEqual($superadmin->id);

    // 2. Leave impersonation
    $leaveResponse = $this->post(route('users.leave-impersonate'));
    $leaveResponse->assertRedirect(route('users.index'));
    $this->assertAuthenticatedAs($superadmin);
    expect(session()->has('impersonator_id'))->toBeFalse();
});

test('Superadmin cannot create user with incompatible user_type and role', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $response = $this->actingAs($superadmin)->post(route('users.store'), [
        'name' => 'Mahasiswa Palsu',
        'email' => 'palsu@alyasini.ac.id',
        'password' => 'password123',
        'user_type' => 'mahasiswa',
        'role' => 'superadmin',
        'status' => 'aktif',
    ]);

    $response->assertSessionHasErrors('role');
    $this->assertDatabaseMissing('users', [
        'email' => 'palsu@alyasini.ac.id',
    ]);
});

test('Superadmin cannot update user to incompatible user_type and role', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $targetUser = User::factory()->create([
        'user_type' => 'dosen',
    ]);
    $targetUser->assignRole('dosen');

    $response = $this->actingAs($superadmin)->put(route('users.update', $targetUser), [
        'name' => $targetUser->name,
        'email' => $targetUser->email,
        'user_type' => 'dosen',
        'role' => 'staf_keuangan',
        'status' => 'aktif',
    ]);

    $response->assertSessionHasErrors('role');
});

test('Password reset sends in-app notification to target user', function () {
    Notification::fake();

    $superadmin = User::factory()->create([
        'name' => 'Super Admin',
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $targetUser = User::factory()->create([
        'user_type' => 'mahasiswa',
        'password' => Hash::make('oldpassword'),
    ]);
    $targetUser->assignRole('mahasiswa');

    $response = $this->actingAs($superadmin)->post(route('users.reset-password', $targetUser), [
        'password' => 'newSecretPassword123',
        'password_confirmation' => 'newSecretPassword123',
    ]);

    $response->assertRedirect();
    Notification::assertSentTo(
        $targetUser,
        PasswordResetByAdminNotification::class,
        function ($notification) use ($superadmin) {
            return $notification->resetByName === $superadmin->name;
        }
    );
});

test('Leave impersonation redirects to login safely if impersonator no longer exists', function () {
    $targetUser = User::factory()->create([
        'user_type' => 'mahasiswa',
    ]);
    $targetUser->assignRole('mahasiswa');

    $response = $this->actingAs($targetUser)
        ->withSession([
            'impersonator_id' => 999999,
            'impersonator_name' => 'Deleted Admin',
        ])
        ->post(route('users.leave-impersonate'));

    $response->assertRedirect(route('login'));
    $response->assertSessionHas('error');
    $this->assertGuest();
});
