<?php

use App\Models\Fakultas;
use App\Models\Mahasiswa;
use App\Models\ProgramStudi;
use App\Models\SystemConfig;
use App\Models\User;
use Database\Seeders\DevDummySeeder;
use Database\Seeders\ProductionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

test('production seeder seeds only essential structural data and single superadmin without dummy users or mock models', function () {
    $this->artisan('db:seed', ['--class' => ProductionSeeder::class]);

    // 1. Roles & Permissions exist
    expect(Role::where('name', 'superadmin')->exists())->toBeTrue();
    expect(Role::where('name', 'mahasiswa')->exists())->toBeTrue();

    // 2. Default System Configs exist
    expect(SystemConfig::where('key', 'MAX_SKS_DEFAULT')->exists())->toBeTrue();

    // 3. Exactly 1 user exists (Superadmin)
    expect(User::count())->toBe(1);
    $superadmin = User::first();
    expect($superadmin->email)->toBe('admin@alyasini.ac.id');
    expect($superadmin->hasRole('superadmin'))->toBeTrue();

    // 4. Zero dummy users exist
    expect(User::where('email', 'akademik@alyasini.ac.id')->exists())->toBeFalse();
    expect(User::where('email', 'keuangan@alyasini.ac.id')->exists())->toBeFalse();
    expect(User::where('email', 'dosen@alyasini.ac.id')->exists())->toBeFalse();
    expect(User::where('email', 'mahasiswa@alyasini.ac.id')->exists())->toBeFalse();

    // 5. Zero mock models exist (Fakultas, ProgramStudi, Mahasiswa)
    expect(Fakultas::count())->toBe(0);
    expect(ProgramStudi::count())->toBe(0);
    expect(Mahasiswa::count())->toBe(0);
});

test('dev dummy seeder seeds realistic mock data and sample dev accounts for local development', function () {
    $this->artisan('db:seed', ['--class' => DevDummySeeder::class]);

    // 1. All dev dummy accounts exist
    expect(User::where('email', 'admin@alyasini.ac.id')->exists())->toBeTrue();
    expect(User::where('email', 'akademik@alyasini.ac.id')->exists())->toBeTrue();
    expect(User::where('email', 'keuangan@alyasini.ac.id')->exists())->toBeTrue();
    expect(User::where('email', 'dosen@alyasini.ac.id')->exists())->toBeTrue();
    expect(User::where('email', 'mahasiswa@alyasini.ac.id')->exists())->toBeTrue();

    // 2. Mock domain models exist
    expect(Fakultas::count())->toBeGreaterThan(0);
    expect(ProgramStudi::count())->toBeGreaterThan(0);
    expect(Mahasiswa::count())->toBeGreaterThan(0);
});

test('database seeder automatically delegates to dev dummy seeder in testing environment', function () {
    $this->artisan('db:seed');

    expect(User::where('email', 'mahasiswa@alyasini.ac.id')->exists())->toBeTrue();
    expect(Mahasiswa::count())->toBeGreaterThan(0);
});
