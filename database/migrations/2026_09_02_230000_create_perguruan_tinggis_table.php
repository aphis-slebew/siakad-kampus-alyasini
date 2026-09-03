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
        Schema::create('perguruan_tinggis', function (Blueprint $table) {
            $table->id();
            $table->string('kode_unit')->default('213048');
            $table->string('nama_unit')->default('STAI Al-Yasini Pasuruan');
            $table->string('nama_unit_en')->nullable()->default('STAI Al-Yasini Pasuruan');
            $table->string('nama_singkat')->nullable()->default('STAI Al-Yasini');
            $table->string('jenis_perguruan_tinggi')->default('Sekolah Tinggi');
            $table->string('lembaga_naungan')->default('PTA Islam Swasta');
            $table->string('periode_berdiri')->nullable();
            $table->string('no_sk_pendirian')->nullable()->default('Dj.I/149/2012');
            $table->date('tanggal_sk_pendirian')->nullable()->default('2012-01-27');

            // Pejabat Perguruan Tinggi
            $table->string('ketua_nama')->nullable()->default('Dr. Akh. Syamsul Muniri, M.S.I');
            $table->string('ketua_nidn')->nullable()->default('2113058301');
            $table->string('wakil_ketua_1')->nullable()->default('2104118501 - Dr. Mohamad Mishbahuddin, M.Pd.I');
            $table->string('wakil_ketua_2')->nullable()->default('LB002 - Muhammad Sholeh, M.Pd');
            $table->string('wakil_ketua_3')->nullable();
            $table->string('wakil_ketua_4')->nullable();

            // Akreditasi Institusi
            $table->string('lembaga_akreditasi')->default('BAN-PT');
            $table->string('peringkat_akreditasi')->default('Baik');
            $table->string('nilai_akreditasi')->nullable();
            $table->string('no_sk_akreditasi')->nullable()->default('481/SK/BAN-PT/Ak/PT/VIII/2022');
            $table->date('tanggal_sk_akreditasi')->nullable()->default('2022-08-30');
            $table->date('tanggal_berlaku_akreditasi')->nullable()->default('2022-08-30');
            $table->date('tanggal_berakhir_akreditasi')->nullable()->default('2027-08-30');
            $table->string('file_sertifikat_akreditasi')->nullable();

            // Informasi & Kontak
            $table->text('visi')->nullable();
            $table->text('misi')->nullable();
            $table->string('alamat')->default('Jl. Pesantren Terpadu Al-Yasini Kec. Wonorejo Kab. Pasuruan 67173');
            $table->string('telepon')->nullable()->default('081333220202');
            $table->string('email')->nullable()->default('info@stai-alyasini.ac.id');
            $table->string('website')->nullable()->default('https://www.stai-alyasini.ac.id');
            $table->string('fax')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perguruan_tinggis');
    }
};
