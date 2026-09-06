<?php

use App\Models\Fakultas;
use App\Models\Konsentrasi;
use App\Models\ProgramStudi;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
});

test('Superadmin can store, update, and delete konsentrasi prodi', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $fakultas = Fakultas::create(['kode' => 'FTIK', 'nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::create([
        'fakultas_id' => $fakultas->id,
        'kode' => 'PAI',
        'nama' => 'Pendidikan Agama Islam',
        'jenjang' => 'S1',
    ]);

    // Store
    $storeResponse = $this->actingAs($superadmin)->post(route('master.konsentrasi.store'), [
        'program_studi_id' => $prodi->id,
        'nama' => 'Pendidikan Transformatif',
    ]);
    $storeResponse->assertRedirect();
    $this->assertDatabaseHas('konsentrasis', [
        'program_studi_id' => $prodi->id,
        'nama' => 'Pendidikan Transformatif',
    ]);

    $item = Konsentrasi::where('nama', 'Pendidikan Transformatif')->first();

    // Update
    $updateResponse = $this->actingAs($superadmin)->put(route('master.konsentrasi.update', $item), [
        'nama' => 'Pendidikan Inklusif',
    ]);
    $updateResponse->assertRedirect();
    $this->assertDatabaseHas('konsentrasis', [
        'id' => $item->id,
        'nama' => 'Pendidikan Inklusif',
    ]);

    // Delete
    $deleteResponse = $this->actingAs($superadmin)->delete(route('master.konsentrasi.destroy', $item));
    $deleteResponse->assertRedirect();
    $this->assertSoftDeleted('konsentrasis', ['id' => $item->id]);
});

test('Program studi show page includes konsentrasis', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $fakultas = Fakultas::create(['kode' => 'FTIK', 'nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::create([
        'fakultas_id' => $fakultas->id,
        'kode' => 'PAI',
        'nama' => 'Pendidikan Agama Islam',
        'jenjang' => 'S1',
    ]);

    Konsentrasi::create([
        'program_studi_id' => $prodi->id,
        'nama' => 'Konsentrasi Uji',
    ]);

    $response = $this->actingAs($superadmin)->get(route('master.program-studi.show', $prodi));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('master/program-studi/show')
        ->has('programStudi.konsentrasis', 1)
    );
});
