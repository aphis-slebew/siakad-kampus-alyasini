<?php

use App\Models\KalenderAkademik;
use App\Models\TahunAjaran;
use App\Models\User;
use App\Services\AcademicTimelineService;
use Carbon\Carbon;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
});

test('Superadmin can view master kalender akademik list', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $ta = TahunAjaran::create([
        'nama' => '2026/2027 Ganjil',
        'mulai' => '2026-09-01',
        'selesai' => '2027-01-31',
        'is_active' => true,
    ]);

    KalenderAkademik::create([
        'tahun_ajaran_id' => $ta->id,
        'kegiatan' => 'Pengisian KRS',
        'tipe_kegiatan' => KalenderAkademik::TIPE_KRS,
        'mulai' => '2026-09-01',
        'selesai' => '2026-09-15',
        'is_published' => true,
    ]);

    $response = $this->actingAs($superadmin)->get(route('master.kalender-akademik.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('master/kalender-akademik/index')
        ->has('kalenderAkademiks')
        ->has('availableTypes')
    );
});

test('Superadmin can store, update, and delete kalender akademik', function () {
    $superadmin = User::factory()->create([
        'user_type' => 'superadmin',
        'two_factor_secret' => encrypt('DEV_2FA'),
    ]);
    $superadmin->assignRole('superadmin');

    $ta = TahunAjaran::create([
        'nama' => '2026/2027 Ganjil',
        'mulai' => '2026-09-01',
        'selesai' => '2027-01-31',
        'is_active' => true,
    ]);

    // Store
    $storeResponse = $this->actingAs($superadmin)->post(route('master.kalender-akademik.store'), [
        'tahun_ajaran_id' => $ta->id,
        'kegiatan' => 'Ujian Akhir Semester',
        'tipe_kegiatan' => KalenderAkademik::TIPE_UAS,
        'mulai' => '2026-12-20',
        'selesai' => '2026-12-31',
        'deskripsi' => 'Ujian akhir semester ganjil',
        'is_published' => true,
    ]);
    $storeResponse->assertRedirect();
    $this->assertDatabaseHas('kalender_akademiks', [
        'kegiatan' => 'Ujian Akhir Semester',
        'tipe_kegiatan' => KalenderAkademik::TIPE_UAS,
    ]);

    $item = KalenderAkademik::where('kegiatan', 'Ujian Akhir Semester')->first();

    // Update
    $updateResponse = $this->actingAs($superadmin)->put(route('master.kalender-akademik.update', $item), [
        'tahun_ajaran_id' => $ta->id,
        'kegiatan' => 'UAS Revisi',
        'tipe_kegiatan' => KalenderAkademik::TIPE_UAS,
        'mulai' => '2026-12-22',
        'selesai' => '2026-12-31',
        'deskripsi' => 'Revisi tanggal ujian',
        'is_published' => true,
    ]);
    $updateResponse->assertRedirect();
    $this->assertDatabaseHas('kalender_akademiks', [
        'id' => $item->id,
        'kegiatan' => 'UAS Revisi',
    ]);

    // Delete
    $deleteResponse = $this->actingAs($superadmin)->delete(route('master.kalender-akademik.destroy', $item));
    $deleteResponse->assertRedirect();
    $this->assertDatabaseMissing('kalender_akademiks', ['id' => $item->id]);
});

test('AcademicTimelineService evaluates event status accurately', function () {
    $ta = TahunAjaran::create([
        'nama' => '2026/2027 Ganjil',
        'mulai' => '2026-08-01',
        'selesai' => '2027-01-31',
        'is_active' => true,
    ]);

    // Active event: Aug 1 to Sep 30
    KalenderAkademik::create([
        'tahun_ajaran_id' => $ta->id,
        'kegiatan' => 'KRS Active',
        'tipe_kegiatan' => KalenderAkademik::TIPE_KRS,
        'mulai' => '2026-08-01',
        'selesai' => '2026-09-30',
        'is_published' => true,
    ]);

    // Upcoming event: Dec 1 to Dec 15
    KalenderAkademik::create([
        'tahun_ajaran_id' => $ta->id,
        'kegiatan' => 'UAS Upcoming',
        'tipe_kegiatan' => KalenderAkademik::TIPE_UAS,
        'mulai' => '2026-12-01',
        'selesai' => '2026-12-15',
        'is_published' => true,
    ]);

    // Test on Sep 6, 2026
    $now = Carbon::parse('2026-09-06');

    $krsStatus = AcademicTimelineService::getTimelineStatus($ta->id, KalenderAkademik::TIPE_KRS, $now);
    expect($krsStatus['is_open'])->toBeTrue();
    expect($krsStatus['status'])->toBe('active');

    $uasStatus = AcademicTimelineService::getTimelineStatus($ta->id, KalenderAkademik::TIPE_UAS, $now);
    expect($uasStatus['is_open'])->toBeFalse();
    expect($uasStatus['status'])->toBe('upcoming');
});
