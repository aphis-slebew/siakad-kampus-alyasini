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
        Schema::table('fakultas', function (Blueprint $table) {
            $table->string('nama_singkat')->nullable()->after('nama');
            $table->string('alamat')->nullable()->after('nama_singkat');
            $table->integer('tahun_berdiri')->nullable()->after('alamat');
            $table->string('status')->default('aktif')->after('tahun_berdiri');
            $table->string('luas_m2')->nullable()->after('status');

            // Pejabat Fakultas
            $table->string('dekan_nama')->nullable()->after('luas_m2');
            $table->string('dekan_nidn')->nullable()->after('dekan_nama');
            $table->string('wakil_dekan_1')->nullable()->after('dekan_nidn');
            $table->string('wakil_dekan_2')->nullable()->after('wakil_dekan_1');
            $table->string('wakil_dekan_3')->nullable()->after('wakil_dekan_2');
            $table->string('wakil_dekan_4')->nullable()->after('wakil_dekan_3');
        });

        Schema::table('program_studis', function (Blueprint $table) {
            $table->string('nama_en')->nullable()->after('nama');
            $table->string('nama_singkat')->nullable()->after('nama_en');
            $table->string('periode_berdiri')->nullable()->after('nama_singkat');
            $table->string('gelar')->nullable()->after('jenjang'); // e.g. Sarjana Pendidikan
            $table->string('gelar_singkat')->nullable()->after('gelar'); // e.g. S.Pd.
            $table->string('gelar_en')->nullable()->after('gelar_singkat');
            $table->string('gelar_singkat_en')->nullable()->after('gelar_en');
            $table->string('status')->default('aktif')->after('gelar_singkat_en');
            $table->string('status_spmb')->default('aktif')->after('status');
            $table->boolean('terdaftar_lptk')->default(false)->after('status_spmb');

            // Pejabat Program Studi
            $table->string('ketua_prodi_nama')->nullable()->after('terdaftar_lptk');
            $table->string('ketua_prodi_nidn')->nullable()->after('ketua_prodi_nama');
            $table->string('sekretaris_prodi_nama')->nullable()->after('ketua_prodi_nidn');

            // Informasi Akademik
            $table->decimal('ipk_lulus_min', 3, 2)->default(2.00)->after('sks_lulus_min');
            $table->boolean('tugas_akhir_syarat')->default(true)->after('ipk_lulus_min');
            $table->string('jenis_tugas_akhir')->default('Skripsi')->after('tugas_akhir_syarat');
            $table->string('pengaturan_transfer_nilai')->default('Masuk Transkrip Akademik')->after('jenis_tugas_akhir');
            $table->integer('max_dosen_pembimbing')->default(2)->after('pengaturan_transfer_nilai');
            $table->integer('max_dosen_penguji')->default(2)->after('max_dosen_pembimbing');
            $table->string('periode_hitung_ips')->default('Periode terakhir mahasiswa aktif')->after('max_dosen_penguji');

            // Akreditasi Program Studi
            $table->string('lembaga_akreditasi')->nullable()->default('LAMDIK')->after('periode_hitung_ips');
            $table->string('akreditasi')->nullable()->default('Baik Sekali')->after('lembaga_akreditasi');
            $table->string('nilai_akreditasi')->nullable()->after('akreditasi');
            $table->string('no_sk_akreditasi')->nullable()->after('nilai_akreditasi');
            $table->date('tanggal_sk_akreditasi')->nullable()->after('no_sk_akreditasi');
            $table->date('tanggal_berlaku_akreditasi')->nullable()->after('tanggal_sk_akreditasi');
            $table->date('tanggal_berakhir_akreditasi')->nullable()->after('tanggal_berlaku_akreditasi');
            $table->string('file_sertifikat_akreditasi')->nullable()->after('tanggal_berakhir_akreditasi');

            // Kontak
            $table->string('alamat')->nullable()->after('file_sertifikat_akreditasi');
            $table->string('telepon')->nullable()->after('alamat');
            $table->string('email')->nullable()->after('telepon');
            $table->string('website')->nullable()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fakultas', function (Blueprint $table) {
            $table->dropColumn([
                'nama_singkat', 'alamat', 'tahun_berdiri', 'status', 'luas_m2',
                'dekan_nama', 'dekan_nidn', 'wakil_dekan_1', 'wakil_dekan_2', 'wakil_dekan_3', 'wakil_dekan_4',
            ]);
        });

        Schema::table('program_studis', function (Blueprint $table) {
            $table->dropColumn([
                'nama_en', 'nama_singkat', 'periode_berdiri', 'gelar', 'gelar_singkat', 'gelar_en', 'gelar_singkat_en',
                'status', 'status_spmb', 'terdaftar_lptk', 'ketua_prodi_nama', 'ketua_prodi_nidn', 'sekretaris_prodi_nama',
                'ipk_lulus_min', 'tugas_akhir_syarat', 'jenis_tugas_akhir', 'pengaturan_transfer_nilai',
                'max_dosen_pembimbing', 'max_dosen_penguji', 'periode_hitung_ips',
                'lembaga_akreditasi', 'akreditasi', 'nilai_akreditasi', 'no_sk_akreditasi',
                'tanggal_sk_akreditasi', 'tanggal_berlaku_akreditasi', 'tanggal_berakhir_akreditasi', 'file_sertifikat_akreditasi',
                'alamat', 'telepon', 'email', 'website',
            ]);
        });
    }
};
