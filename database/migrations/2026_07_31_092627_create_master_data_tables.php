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
        Schema::create('fakultas', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('program_studis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fakultas_id')->constrained('fakultas')->cascadeOnDelete();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->string('jenjang'); // S1, S2, etc.
            $table->integer('sks_lulus_min')->default(144);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('konsentrasis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_studi_id')->constrained('program_studis')->cascadeOnDelete();
            $table->string('nama');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('tahun_ajarans', function (Blueprint $table) {
            $table->id();
            $table->string('nama'); // e.g. 2026/2027 Ganjil
            $table->date('mulai');
            $table->date('selesai');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        Schema::create('kalender_akademiks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->string('kegiatan');
            $table->date('mulai');
            $table->date('selesai');
            $table->timestamps();
        });

        Schema::create('ruang_kuliahs', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->integer('kapasitas')->default(0);
            $table->timestamps();
        });

        Schema::create('referensi_biodatas', function (Blueprint $table) {
            $table->id();
            $table->string('tipe'); // agama|pekerjaan|suku|penghasilan
            $table->string('nama');
            $table->string('pddikti_ref_id')->nullable();
            $table->timestamps();
        });

        Schema::create('wilayahs', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->integer('level')->nullable(); // 1: Provinsi, 2: Kab/Kota, 3: Kec, 4: Desa/Kel
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('pddikti_ref_id')->nullable();
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('wilayahs')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wilayahs');
        Schema::dropIfExists('referensi_biodatas');
        Schema::dropIfExists('ruang_kuliahs');
        Schema::dropIfExists('kalender_akademiks');
        Schema::dropIfExists('tahun_ajarans');
        Schema::dropIfExists('konsentrasis');
        Schema::dropIfExists('program_studis');
        Schema::dropIfExists('fakultas');
    }
};
