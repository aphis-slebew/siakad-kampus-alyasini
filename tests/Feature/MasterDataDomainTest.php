<?php

use App\Models\Fakultas;
use App\Models\User;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
});

test('guest cannot access master data routes', function () {
    $this->get(route('master.fakultas.index'))->assertRedirect(route('login'));
    $this->get(route('master.program-studi.index'))->assertRedirect(route('login'));
    $this->get(route('master.tahun-ajaran.index'))->assertRedirect(route('login'));
    $this->get(route('master.ruang-kuliah.index'))->assertRedirect(route('login'));
    $this->get(route('master.referensi-biodata.index'))->assertRedirect(route('login'));
});

test('user without master_data.manage permission gets 403 forbidden', function () {
    $mahasiswa = User::factory()->create();
    $mahasiswa->assignRole('mahasiswa');

    $this->actingAs($mahasiswa)
        ->get(route('master.fakultas.index'))
        ->assertForbidden();
});

test('admin_akademik can view and manage master data fakultas', function () {
    $admin = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $admin->assignRole('admin_akademik');

    $this->actingAs($admin)
        ->get(route('master.fakultas.index'))
        ->assertOk();

    $this->actingAs($admin)
        ->post(route('master.fakultas.store'), [
            'kode' => 'FTK-TEST',
            'nama' => 'Fakultas Tarbiyah Uji',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('fakultas', [
        'kode' => 'FTK-TEST',
    ]);
});

test('superadmin can create and update program studi', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');


    $fakultas = Fakultas::create(['kode' => 'F1', 'nama' => 'Fakultas Satu']);

    $this->actingAs($superadmin)
        ->post(route('master.program-studi.store'), [
            'fakultas_id' => $fakultas->id,
            'kode' => 'PRODI-1',
            'nama' => 'Prodi Tes',
            'jenjang' => 'S1',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('program_studis', [
        'kode' => 'PRODI-1',
    ]);
});

test('master data validation errors work correctly', function () {
    $admin = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $admin->assignRole('admin_akademik');


    $this->actingAs($admin)
        ->post(route('master.fakultas.store'), [
            'kode' => '',
            'nama' => '',
        ])
        ->assertSessionHasErrors(['kode', 'nama']);
});
