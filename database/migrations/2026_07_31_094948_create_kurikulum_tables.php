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
        Schema::create('kurikulum_prodis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_studi_id')->constrained('program_studis')->cascadeOnDelete();
            $table->string('tahun_kurikulum');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('matakuliahs', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->integer('sks');
            $table->string('jenis')->default('wajib'); // wajib|pilihan
            $table->foreignId('bidang_ilmu_id')->nullable()->constrained('referensi_biodatas')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('kurikulum_matakuliahs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kurikulum_prodi_id')->constrained('kurikulum_prodis')->cascadeOnDelete();
            $table->foreignId('matakuliah_id')->constrained('matakuliahs')->cascadeOnDelete();
            $table->integer('semester');
            $table->timestamps();
        });

        Schema::create('prasyarat_matakuliahs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('matakuliah_id')->constrained('matakuliahs')->cascadeOnDelete();
            $table->foreignId('matakuliah_prasyarat_id')->constrained('matakuliahs')->cascadeOnDelete();
            $table->string('minimal_nilai')->default('D');
            $table->timestamps();
        });

        Schema::create('ekivalensi_matakuliahs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('matakuliah_lama_id')->constrained('matakuliahs')->cascadeOnDelete();
            $table->foreignId('matakuliah_baru_id')->constrained('matakuliahs')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ekivalensi_matakuliahs');
        Schema::dropIfExists('prasyarat_matakuliahs');
        Schema::dropIfExists('kurikulum_matakuliahs');
        Schema::dropIfExists('matakuliahs');
        Schema::dropIfExists('kurikulum_prodis');
    }
};
