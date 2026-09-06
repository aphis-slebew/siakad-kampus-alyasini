<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('perguruan_tinggis', function (Blueprint $table) {
            // PDDIKTI & Legalitas
            $table->string('status_milik', 50)->default('Swasta')->after('jenis_perguruan_tinggi');
            $table->string('no_sk_operasional', 150)->nullable()->after('tanggal_sk_pendirian');
            $table->date('tanggal_sk_operasional')->nullable()->after('no_sk_operasional');

            // Domisili Rinci
            $table->string('jalan', 255)->nullable()->after('alamat');
            $table->string('rt_rw', 50)->nullable()->after('jalan');
            $table->string('dusun', 100)->nullable()->after('rt_rw');
            $table->string('kelurahan', 100)->nullable()->after('dusun');
            $table->string('kecamatan', 100)->nullable()->after('kelurahan');
            $table->string('kota_kabupaten', 100)->nullable()->after('kecamatan');
            $table->string('provinsi', 100)->nullable()->after('kota_kabupaten');
            $table->string('kode_pos', 20)->nullable()->after('provinsi');

            // Kontak Tambahan & Titik Geo-Fencing Presensi
            $table->string('telepon_2', 50)->nullable()->after('telepon');
            $table->decimal('lintang', 10, 7)->nullable()->after('fax');
            $table->decimal('bujur', 10, 7)->nullable()->after('lintang');
            $table->integer('radius_presensi')->nullable()->default(100)->after('bujur'); // dalam meter

            // Aset Branding Resmi
            $table->string('logo_path', 255)->nullable()->after('radius_presensi');
            $table->string('logo_kop_path', 255)->nullable()->after('logo_path');
            $table->string('stempel_path', 255)->nullable()->after('logo_kop_path');
            $table->string('ttd_ketua_path', 255)->nullable()->after('stempel_path');

            // Pimpinan & Penandatangan Dokumen
            $table->string('ketua_gelar_depan', 50)->nullable()->after('ketua_nama');
            $table->string('ketua_gelar_belakang', 50)->nullable()->after('ketua_gelar_depan');
            $table->string('ketua_nip_niy', 50)->nullable()->after('ketua_nidn');
            $table->string('wakil_ketua_1_nama', 255)->nullable()->after('wakil_ketua_1');
            $table->string('wakil_ketua_1_nidn', 50)->nullable()->after('wakil_ketua_1_nama');
            $table->string('wakil_ketua_1_gelar_depan', 50)->nullable()->after('wakil_ketua_1_nidn');
            $table->string('wakil_ketua_1_gelar_belakang', 50)->nullable()->after('wakil_ketua_1_gelar_depan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('perguruan_tinggis', function (Blueprint $table) {
            $table->dropColumn([
                'status_milik',
                'no_sk_operasional',
                'tanggal_sk_operasional',
                'jalan',
                'rt_rw',
                'dusun',
                'kelurahan',
                'kecamatan',
                'kota_kabupaten',
                'provinsi',
                'kode_pos',
                'telepon_2',
                'lintang',
                'bujur',
                'radius_presensi',
                'logo_path',
                'logo_kop_path',
                'stempel_path',
                'ttd_ketua_path',
                'ketua_gelar_depan',
                'ketua_gelar_belakang',
                'ketua_nip_niy',
                'wakil_ketua_1_nama',
                'wakil_ketua_1_nidn',
                'wakil_ketua_1_gelar_depan',
                'wakil_ketua_1_gelar_belakang',
            ]);
        });
    }
};
