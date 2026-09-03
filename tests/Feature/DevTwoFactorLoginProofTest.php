<?php

use Database\Seeders\DevDummySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PragmaRX\Google2FA\Google2FA;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => DevDummySeeder::class]);
});

test('METODE A PROOF: Dev B can log in via browser using seeded recovery code DEV-REC-01', function () {
    // 1. Initial Login
    $loginResponse = $this->post('/login', [
        'email' => 'admin@alyasini.ac.id',
        'password' => 'password',
    ]);

    // 2. Verified 2FA Challenge Redirect
    $loginResponse->assertRedirect('/two-factor-challenge');

    // 3. Submit Recovery Code DEV-REC-01
    $challengeResponse = $this->post('/two-factor-challenge', [
        'recovery_code' => 'DEV-REC-01',
    ]);

    // 4. Verified Dashboard Redirect & 200 OK Access
    $challengeResponse->assertRedirect('/dashboard');

    $dashboardResponse = $this->get('/dashboard');
    $dashboardResponse->assertStatus(200);
});

test('METODE B PROOF: Dev B can log in via browser using TOTP OTP code generated from secret JBSWY3DPEHPK3PXP', function () {
    // 1. Initial Login
    $loginResponse = $this->post('/login', [
        'email' => 'admin@alyasini.ac.id',
        'password' => 'password',
    ]);

    // 2. Verified 2FA Challenge Redirect
    $loginResponse->assertRedirect('/two-factor-challenge');

    // 3. Generate Live TOTP OTP Code from Base32 Secret JBSWY3DPEHPK3PXP
    $google2fa = new Google2FA;
    $liveOtpCode = $google2fa->getCurrentOtp('JBSWY3DPEHPK3PXP');

    expect(strlen($liveOtpCode))->toBe(6);

    // 4. Submit TOTP Code to 2FA Challenge
    $challengeResponse = $this->post('/two-factor-challenge', [
        'code' => $liveOtpCode,
    ]);

    // 5. Verified Dashboard Redirect & 200 OK Access
    $challengeResponse->assertRedirect('/dashboard');

    $dashboardResponse = $this->get('/dashboard');
    $dashboardResponse->assertStatus(200);
});
