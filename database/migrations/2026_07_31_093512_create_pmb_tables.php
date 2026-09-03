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
        Schema::create('gelombang_pendaftarans', function (Blueprint $table) {
            $table->id();
            $table->string('nama'); // Gelombang 1 2026/2027
            $table->date('mulai_pendaftaran');
            $table->date('selesai_pendaftaran');
            $table->integer('kuota');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('jalur_pendaftarans', function (Blueprint $table) {
            $table->id();
            $table->string('nama'); // reguler|prestasi|beasiswa
            $table->decimal('biaya_pendaftaran', 12, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('calon_mahasiswas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('gelombang_pendaftaran_id')->constrained('gelombang_pendaftarans');
            $table->foreignId('jalur_pendaftaran_id')->constrained('jalur_pendaftarans');
            $table->foreignId('program_studi_pilihan_1_id')->constrained('program_studis');
            $table->foreignId('program_studi_pilihan_2_id')->nullable()->constrained('program_studis');
            $table->string('nama_lengkap');
            $table->string('nik')->nullable();
            $table->string('tempat_lahir')->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->string('jenis_kelamin')->nullable();
            $table->text('alamat')->nullable();
            $table->string('no_hp')->nullable();
            $table->string('email')->nullable();
            $table->string('asal_sekolah')->nullable();
            $table->integer('tahun_lulus_sekolah')->nullable();
            $table->string('status_pendaftaran')->default('draft');
            // draft|diajukan|verifikasi_berkas|lolos_verifikasi|dijadwalkan_tes|lulus_seleksi|tidak_lulus
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('berkas_pendaftarans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calon_mahasiswa_id')->constrained('calon_mahasiswas')->cascadeOnDelete();
            $table->string('jenis_berkas'); // ijazah_skl|kk|ktp_akta|foto|dokumen_prestasi
            $table->string('file_path');
            $table->string('status_verifikasi')->default('diajukan'); // diajukan|diverifikasi|ditolak
            $table->text('catatan_verifikasi')->nullable();
            $table->foreignId('diverifikasi_oleh_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('jadwal_seleksis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calon_mahasiswa_id')->constrained('calon_mahasiswas')->cascadeOnDelete();
            $table->string('jenis_tes'); // tulis|wawancara
            $table->date('tanggal');
            $table->string('lokasi_atau_link')->nullable();
            $table->timestamps();
        });

        Schema::create('hasil_seleksis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calon_mahasiswa_id')->constrained('calon_mahasiswas')->cascadeOnDelete();
            $table->decimal('nilai_tes', 5, 2)->nullable();
            $table->string('status'); // lulus|tidak_lulus
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        Schema::table('mahasiswas', function (Blueprint $table) {
            $table->foreign('calon_mahasiswa_id')->references('id')->on('calon_mahasiswas')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mahasiswas', function (Blueprint $table) {
            $table->dropForeign(['calon_mahasiswa_id']);
        });

        Schema::dropIfExists('hasil_seleksis');
        Schema::dropIfExists('jadwal_seleksis');
        Schema::dropIfExists('berkas_pendaftarans');
        Schema::dropIfExists('calon_mahasiswas');
        Schema::dropIfExists('jalur_pendaftarans');
        Schema::dropIfExists('gelombang_pendaftarans');
    }
};
