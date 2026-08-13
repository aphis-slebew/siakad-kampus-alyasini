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
        Schema::create('aktivitas_mahasiswas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswas')->cascadeOnDelete();
            $table->foreignId('jenis_aktivitas_id')->nullable()->constrained('referensi_biodatas')->nullOnDelete();
            $table->string('nama_kegiatan');
            $table->boolean('divalidasi')->default(false);
            $table->timestamps();
        });

        Schema::create('pelanggaran_mahasiswas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswas')->cascadeOnDelete();
            $table->foreignId('jenis_pelanggaran_id')->nullable()->constrained('referensi_biodatas')->nullOnDelete();
            $table->foreignId('sanksi_id')->nullable()->constrained('referensi_biodatas')->nullOnDelete();
            $table->date('tanggal');
            $table->timestamps();
        });

        Schema::create('beasiswa_mahasiswas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswas')->cascadeOnDelete();
            $table->foreignId('jenis_beasiswa_id')->nullable()->constrained('referensi_biodatas')->nullOnDelete();
            $table->string('status')->default('diajukan'); // diajukan|diterima|ditolak
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beasiswa_mahasiswas');
        Schema::dropIfExists('pelanggaran_mahasiswas');
        Schema::dropIfExists('aktivitas_mahasiswas');
    }
};
