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
        Schema::create('kelas_kuliahs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kurikulum_matakuliah_id')->constrained('kurikulum_matakuliahs')->cascadeOnDelete();
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->string('nama_kelas'); // A|B|C
            $table->integer('kuota');
            $table->timestamps();
        });

        Schema::create('dosen_pengajars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_kuliah_id')->constrained('kelas_kuliahs')->cascadeOnDelete();
            $table->foreignId('dosen_id')->constrained('dosens')->cascadeOnDelete();
            $table->string('peran')->default('utama'); // utama|asisten
            $table->timestamps();
        });

        Schema::create('jadwal_perkuliahans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_kuliah_id')->constrained('kelas_kuliahs')->cascadeOnDelete();
            $table->foreignId('ruang_kuliah_id')->constrained('ruang_kuliahs')->cascadeOnDelete();
            $table->string('hari');
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwal_perkuliahans');
        Schema::dropIfExists('dosen_pengajars');
        Schema::dropIfExists('kelas_kuliahs');
    }
};
