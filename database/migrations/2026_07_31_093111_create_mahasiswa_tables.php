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
        Schema::create('mahasiswas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('calon_mahasiswa_id')->nullable();
            $table->foreignId('program_studi_id')->constrained('program_studis');
            $table->string('nim')->unique();
            $table->string('nama_lengkap');
            $table->string('nik')->nullable();
            $table->string('tempat_lahir')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('jenis_kelamin')->nullable();
            $table->foreignId('agama_referensi_biodata_id')->nullable()->constrained('referensi_biodatas')->nullOnDelete();
            $table->text('alamat_ktp')->nullable();
            $table->text('alamat_domisili')->nullable();
            $table->string('no_hp')->nullable();
            $table->string('email_pribadi')->nullable();
            $table->string('foto_path')->nullable();
            $table->integer('tahun_masuk');
            $table->string('status_mahasiswa')->default('aktif'); // aktif|cuti|nonaktif|lulus|do
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('data_orang_tuas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswas')->cascadeOnDelete();
            $table->string('nama_ayah')->nullable();
            $table->string('nama_ibu')->nullable();
            $table->foreignId('pekerjaan_ayah_referensi_id')->nullable()->constrained('referensi_biodatas')->nullOnDelete();
            $table->foreignId('pekerjaan_ibu_referensi_id')->nullable()->constrained('referensi_biodatas')->nullOnDelete();
            $table->foreignId('penghasilan_ortu_referensi_id')->nullable()->constrained('referensi_biodatas')->nullOnDelete();
            $table->string('no_hp_kontak_darurat')->nullable();
            $table->timestamps();
        });

        Schema::create('status_akademik_historis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswas')->cascadeOnDelete();
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->string('status'); // aktif|cuti|nonaktif|lulus|do
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('status_akademik_historis');
        Schema::dropIfExists('data_orang_tuas');
        Schema::dropIfExists('mahasiswas');
    }
};
