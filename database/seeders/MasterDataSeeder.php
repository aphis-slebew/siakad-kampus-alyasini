<?php

namespace Database\Seeders;

use App\Models\Fakultas;
use App\Models\ProgramStudi;
use App\Models\ReferensiBiodata;
use App\Models\RuangKuliah;
use App\Models\TahunAjaran;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Fakultas
        $tarbiyah = Fakultas::firstOrCreate(['kode' => 'FTIK'], ['nama' => 'Fakultas Tarbiyah dan Ilmu Keguruan']);
        $syariah = Fakultas::firstOrCreate(['kode' => 'FASYA'], ['nama' => 'Fakultas Syariah dan Ekonomi Islam']);

        // 2. Program Studi
        ProgramStudi::withTrashed()->firstOrCreate(['kode' => 'PAI'], [
            'fakultas_id' => $tarbiyah->id,
            'nama' => 'Pendidikan Agama Islam',
            'jenjang' => 'S1',
        ]);
        $pba = ProgramStudi::withTrashed()->firstOrCreate(['kode' => 'PBA'], [
            'fakultas_id' => $tarbiyah->id,
            'nama' => 'Pendidikan Bahasa Arab',
            'jenjang' => 'S1',
        ]);
        if ($pba->trashed()) {
            $pba->restore();
        }
        ProgramStudi::withTrashed()->firstOrCreate(['kode' => 'PGMI'], [
            'fakultas_id' => $tarbiyah->id,
            'nama' => 'Pendidikan Guru Madrasah Ibtidaiyah',
            'jenjang' => 'S1',
        ]);

        // 3. Tahun Ajaran
        TahunAjaran::firstOrCreate(['nama' => '2026/2027 Ganjil'], [
            'mulai' => '2026-08-01',
            'selesai' => '2027-01-31',
            'is_active' => true,
        ]);
        TahunAjaran::firstOrCreate(['nama' => '2025/2026 Genap'], [
            'mulai' => '2026-02-01',
            'selesai' => '2026-07-31',
            'is_active' => false,
        ]);

        // 4. Ruang Kuliah
        RuangKuliah::firstOrCreate(['kode' => 'RK-01'], ['nama' => 'Ruang Kuliah 01 Gedung A', 'kapasitas' => 40]);
        RuangKuliah::firstOrCreate(['kode' => 'RK-02'], ['nama' => 'Ruang Kuliah 02 Gedung A', 'kapasitas' => 40]);
        RuangKuliah::firstOrCreate(['kode' => 'LAB-KOM'], ['nama' => 'Laboratorium Komputer', 'kapasitas' => 30]);

        // 5. Referensi Biodata
        ReferensiBiodata::firstOrCreate(['tipe' => 'agama', 'nama' => 'Islam']);
        ReferensiBiodata::firstOrCreate(['tipe' => 'pekerjaan', 'nama' => 'Pegawai Negeri Sipil (PNS)']);
        ReferensiBiodata::firstOrCreate(['tipe' => 'pekerjaan', 'nama' => 'Wiraswasta']);
        ReferensiBiodata::firstOrCreate(['tipe' => 'penghasilan', 'nama' => 'Rp 1.000.000 - Rp 3.000.000']);
    }
}
