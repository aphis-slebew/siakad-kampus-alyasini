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
        Schema::create('periode_registrasis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->string('jenis'); // mahasiswa_baru|mahasiswa_lama
            $table->date('mulai');
            $table->date('selesai');
            $table->timestamps();
        });

        Schema::create('registrasi_ulangs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('periode_registrasi_id')->constrained('periode_registrasis')->cascadeOnDelete();
            $table->foreignId('calon_mahasiswa_id')->nullable()->constrained('calon_mahasiswas')->nullOnDelete();
            $table->foreignId('mahasiswa_id')->nullable()->constrained('mahasiswas')->nullOnDelete();
            $table->string('status')->default('belum'); // belum|proses_verifikasi|menunggu_pembayaran|selesai
            $table->timestamp('selesai_at')->nullable();
            $table->timestamps();
        });

        Schema::create('dokumen_registrasis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registrasi_ulang_id')->constrained('registrasi_ulangs')->cascadeOnDelete();
            $table->string('jenis_dokumen'); // ijazah_asli|kk|pas_foto
            $table->string('file_path');
            $table->string('status_verifikasi')->default('diajukan'); // diajukan|diverifikasi|ditolak
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dokumen_registrasis');
        Schema::dropIfExists('registrasi_ulangs');
        Schema::dropIfExists('periode_registrasis');
    }
};
