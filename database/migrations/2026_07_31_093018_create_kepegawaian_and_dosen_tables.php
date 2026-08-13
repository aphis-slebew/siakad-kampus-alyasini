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
        Schema::create('unit_kerjas', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->timestamps();
        });

        Schema::create('pegawais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('unit_kerja_id')->nullable()->constrained('unit_kerjas')->nullOnDelete();
            $table->string('nip_internal')->nullable();
            $table->string('nama_lengkap');
            $table->string('nik')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('jenis_kelamin')->nullable();
            $table->text('alamat')->nullable();
            $table->string('no_hp')->nullable();
            $table->string('jabatan_struktural')->nullable();
            $table->string('status_kepegawaian')->default('tetap'); // tetap|kontrak|honorer
            $table->string('foto_path')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('dosens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('program_studi_id')->nullable()->constrained('program_studis')->nullOnDelete();
            $table->string('nidn')->nullable()->unique();
            $table->string('gelar_depan')->nullable();
            $table->string('nama_lengkap');
            $table->string('gelar_belakang')->nullable();
            $table->string('nik')->nullable();
            $table->string('tempat_lahir')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('jenis_kelamin')->nullable();
            $table->text('alamat')->nullable();
            $table->string('no_hp')->nullable();
            $table->string('email_pribadi')->nullable();
            $table->string('jabatan_fungsional_saat_ini')->nullable(); // asisten_ahli|lektor|lektor_kepala|guru_besar
            $table->string('status_kepegawaian')->default('tetap'); // tetap|tidak_tetap|dpk
            $table->boolean('sertifikasi_pendidik')->default(false);
            $table->string('foto_path')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('riwayat_pendidikan_dosens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dosen_id')->constrained('dosens')->cascadeOnDelete();
            $table->string('jenjang'); // S1|S2|S3
            $table->string('institusi');
            $table->string('program_studi');
            $table->integer('tahun_lulus');
            $table->timestamps();
        });

        Schema::create('riwayat_jabatan_fungsionals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dosen_id')->constrained('dosens')->cascadeOnDelete();
            $table->string('jabatan');
            $table->date('tmt'); // terhitung mulai tanggal
            $table->string('nomor_sk')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayat_jabatan_fungsionals');
        Schema::dropIfExists('riwayat_pendidikan_dosens');
        Schema::dropIfExists('dosens');
        Schema::dropIfExists('pegawais');
        Schema::dropIfExists('unit_kerjas');
    }
};
