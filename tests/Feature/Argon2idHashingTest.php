<?php

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => RoleAndPermissionSeeder::class]);
});

test('existing user with legacy bcrypt password can login seamlessly and is auto rehashed to argon2id', function () {
    // 1. Create user with legacy bcrypt password hash ($2y$)
    $bcryptHash = Hash::driver('bcrypt')->make('password123');
    expect(str_starts_with($bcryptHash, '$2y$'))->toBeTrue();

    $user = User::factory()->create([
        'password' => $bcryptHash,
        'user_type' => 'superadmin',
    ]);

    expect(str_starts_with($user->password, '$2y$'))->toBeTrue();

    // 2. User logs in with existing password
    $loginSuccess = Auth::attempt(['email' => $user->email, 'password' => 'password123']);
    expect($loginSuccess)->toBeTrue();

    // 3. Verify transparent rehash to Argon2id ($argon2id$)
    $user->refresh();
    expect(str_starts_with($user->password, '$argon2id$'))->toBeTrue();
});

test('new user registration automatically hashes password with argon2id algorithm', function () {
    $newHash = Hash::make('new_secure_password');

    expect(config('hashing.driver'))->toBe('argon2id');
    expect(str_starts_with($newHash, '$argon2id$'))->toBeTrue();

    $newUser = User::factory()->create([
        'password' => Hash::make('new_secure_password'),
        'user_type' => 'mahasiswa',
    ]);

    expect(str_starts_with($newUser->password, '$argon2id$'))->toBeTrue();
});

test('corrupted or invalid hash strings are strictly rejected by fallback hasher', function () {
    $hasher = app('hash');

    // 1. Invalid plain random string (not a hash)
    expect($hasher->check('password123', 'invalid_random_string_1234567890'))->toBeFalse();

    // 2. Corrupted Bcrypt hash
    expect($hasher->check('password123', '$2y$12$invalidcorruptedbcryptstring123456789012345678901234567890'))->toBeFalse();

    // 3. Corrupted Argon2id hash
    expect($hasher->check('password123', '$argon2id$v=19$m=65536,t=4,p=1$invalidcorruptedargonstring1234567890'))->toBeFalse();

    // 4. Empty string
    expect($hasher->check('password123', ''))->toBeFalse();
});
