<?php

use App\Models\DataOrangTua;
use App\Models\Dosen;
use App\Models\Fakultas;
use App\Models\Mahasiswa;
use App\Models\Pegawai;
use App\Models\ProgramStudi;
use App\Models\ReferensiBiodata;
use App\Models\RiwayatJabatanFungsional;
use App\Models\RiwayatPendidikanDosen;
use App\Models\StatusAkademikHistoris;
use App\Models\TahunAjaran;
use App\Models\UnitKerja;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('pegawai and unit kerja models function with relationships', function () {
    $user = User::factory()->create([
        'user_type' => 'pegawai',
    ]);

    $unitKerja = UnitKerja::create([
        'kode' => 'BAA',
        'nama' => 'Biro Administrasi Akademik',
    ]);

    $pegawai = Pegawai::create([
        'user_id' => $user->id,
        'unit_kerja_id' => $unitKerja->id,
        'nip_internal' => 'PEG-001',
        'nama_lengkap' => 'Ahmad Staf BAA',
        'nik' => '3575010101900001',
        'status_kepegawaian' => 'tetap',
    ]);

    expect($unitKerja->pegawais)->toHaveCount(1);
    expect($pegawai->user->id)->toBe($user->id);
    expect($pegawai->unitKerja->kode)->toBe('BAA');
    // Verify encrypted cast
    expect($pegawai->nik)->toBe('3575010101900001');
});

test('dosen model functions with educational and functional job history', function () {
    $user = User::factory()->create(['user_type' => 'dosen']);

    $fakultas = Fakultas::firstOrCreate(['kode' => 'FTI'], ['nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::firstOrCreate([
        'kode' => 'PAI',
    ], [
        'fakultas_id' => $fakultas->id,
        'nama' => 'Pendidikan Agama Islam',
        'jenjang' => 'S1',
    ]);

    $dosen = Dosen::create([
        'user_id' => $user->id,
        'program_studi_id' => $prodi->id,
        'nidn' => '2101018501',
        'gelar_depan' => 'Dr.',
        'nama_lengkap' => 'Muhammad Dosen',
        'gelar_belakang' => 'M.Pd.',
        'nik' => '3575010202850002',
        'jabatan_fungsional_saat_ini' => 'lektor',
    ]);

    RiwayatPendidikanDosen::create([
        'dosen_id' => $dosen->id,
        'jenjang' => 'S2',
        'institusi' => 'UIN Maulana Malik Ibrahim',
        'program_studi' => 'Pendidikan Agama Islam',
        'tahun_lulus' => 2012,
    ]);

    RiwayatJabatanFungsional::create([
        'dosen_id' => $dosen->id,
        'jabatan' => 'Lektor',
        'tmt' => '2020-01-01',
        'nomor_sk' => 'SK/2020/001',
    ]);

    expect($dosen->riwayatPendidikans)->toHaveCount(1);
    expect($dosen->riwayatJabatanFungsionals)->toHaveCount(1);
    expect($dosen->programStudi->kode)->toBe('PAI');
});

test('mahasiswa model functions with parent data and status history', function () {
    $user = User::factory()->create(['user_type' => 'mahasiswa']);

    $fakultas = Fakultas::firstOrCreate(['kode' => 'FTI'], ['nama' => 'Fakultas Tarbiyah']);
    $prodi = ProgramStudi::firstOrCreate([
        'kode' => 'PAI',
    ], [
        'fakultas_id' => $fakultas->id,
        'nama' => 'Pendidikan Agama Islam',
        'jenjang' => 'S1',
    ]);

    $agama = ReferensiBiodata::create(['tipe' => 'agama', 'nama' => 'Islam']);
    $pekerjaan = ReferensiBiodata::create(['tipe' => 'pekerjaan', 'nama' => 'Wiraswasta']);

    $mahasiswa = Mahasiswa::create([
        'user_id' => $user->id,
        'program_studi_id' => $prodi->id,
        'nim' => '202601001',
        'nama_lengkap' => 'Siti Mahasiswi',
        'nik' => '3575010303040003',
        'agama_referensi_biodata_id' => $agama->id,
        'tahun_masuk' => 2026,
        'status_mahasiswa' => 'aktif',
    ]);

    DataOrangTua::create([
        'mahasiswa_id' => $mahasiswa->id,
        'nama_ayah' => 'Ayah Siti',
        'nama_ibu' => 'Ibu Siti',
        'pekerjaan_ayah_referensi_id' => $pekerjaan->id,
    ]);

    $tahunAjaran = TahunAjaran::create([
        'nama' => '2026/2027 Ganjil',
        'mulai' => '2026-09-01',
        'selesai' => '2027-01-31',
    ]);

    StatusAkademikHistoris::create([
        'mahasiswa_id' => $mahasiswa->id,
        'tahun_ajaran_id' => $tahunAjaran->id,
        'status' => 'aktif',
    ]);

    expect($mahasiswa->dataOrangTua->nama_ayah)->toBe('Ayah Siti');
    expect($mahasiswa->statusAkademikHistoris)->toHaveCount(1);
    expect($mahasiswa->agama->nama)->toBe('Islam');
});
