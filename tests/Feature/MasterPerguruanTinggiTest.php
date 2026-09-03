<?php

use App\Models\Fakultas;
use App\Models\ProgramStudi;
use App\Models\User;

beforeEach(function () {
    $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
});

test('superadmin and admin_akademik can view and update perguruan tinggi profile', function () {
    $superadmin = User::factory()->create(['user_type' => 'superadmin', 'two_factor_secret' => encrypt('DEV_2FA')]);
    $superadmin->assignRole('superadmin');

    $this->actingAs($superadmin)
        ->get(route('master.perguruan-tinggi.index'))
        ->assertOk();

    $this->actingAs($superadmin)
        ->post(route('master.perguruan-tinggi.update'), [
            'kode_unit' => '213048',
            'nama_unit' => 'STAI Al-Yasini Pasuruan Baru',
            'nama_unit_en' => 'Al-Yasini Islamic College of Pasuruan',
            'nama_singkat' => 'STAI Al-Yasini',
            'jenis_perguruan_tinggi' => 'Sekolah Tinggi',
            'ketua_nama' => 'Dr. H. Ahmad Fauzi, M.Pd.I',
            'ketua_nidn' => '2108098201',
            'peringkat_akreditasi' => 'Baik Sekali',
            'lembaga_akreditasi' => 'BAN-PT',
            'no_sk_akreditasi' => 'SK-BANPT-2026/01',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('perguruan_tinggis', [
        'nama_unit' => 'STAI Al-Yasini Pasuruan Baru',
        'ketua_nama' => 'Dr. H. Ahmad Fauzi, M.Pd.I',
    ]);
});

test('can view program studi detail page', function () {
    $admin = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $admin->assignRole('admin_akademik');

    $fakultas = Fakultas::create(['kode' => 'FTK', 'nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::create([
        'fakultas_id' => $fakultas->id,
        'kode' => '86231',
        'nama' => 'Manajemen Pendidikan Islam',
        'jenjang' => 'S1',
        'gelar_singkat' => 'S.Pd.',
        'akreditasi' => 'Baik Sekali',
    ]);

    $this->actingAs($admin)
        ->get(route('master.program-studi.show', $prodi->id))
        ->assertOk();
});

test('can view and update fakultas detail page with extended fields', function () {
    $admin = User::factory()->create(['two_factor_secret' => encrypt('DEV_2FA')]);
    $admin->assignRole('admin_akademik');

    $fakultas = Fakultas::create([
        'kode' => 'FEBI',
        'nama' => 'Fakultas Ekonomi dan Bisnis Islam',
        'nama_en' => 'Faculty of Islamic Economics and Business',
        'nama_singkat' => 'FEBI',
        'status' => 'aktif',
    ]);

    $this->actingAs($admin)
        ->get(route('master.fakultas.show', $fakultas->id))
        ->assertOk();

    $this->actingAs($admin)
        ->put(route('master.fakultas.update', $fakultas->id), [
            'kode' => 'FEBI',
            'nama' => 'Fakultas Ekonomi dan Bisnis Islam Al-Yasini',
            'nama_en' => 'Faculty of Islamic Economics and Business Al-Yasini',
            'nama_singkat' => 'FEBI',
            'alamat' => 'Gedung B Lt. 2 Kampus Terpadu',
            'telepon' => '08123456789',
            'status' => 'aktif',
            'dekan_nama' => 'Dr. H. Ahmad Fauzi, M.E',
            'wakil_dekan_1' => 'Dr. Syamsul Arifin, M.Pd',
            'wakil_dekan_2' => 'H. M. Sholeh, M.E',
            'visi' => 'Menjadi fakultas ekonomi Islam unggul dan berdaya saing.',
            'misi' => 'Menyelenggarakan pendidikan ekonomi Islam berbasis riset dan pesantren.',
        ])
        ->assertRedirect();

    $fakultas->refresh();
    expect($fakultas->nama)->toBe('Fakultas Ekonomi dan Bisnis Islam Al-Yasini');
    expect($fakultas->visi)->toContain('Menjadi fakultas ekonomi Islam unggul');
});
