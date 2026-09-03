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
        Schema::create('kelompok_ukts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_studi_id')->constrained('program_studis')->cascadeOnDelete();
            $table->string('nama'); // Kelompok I|II|III|dst
            $table->decimal('nominal_per_semester', 12, 2);
            $table->timestamps();
        });

        Schema::create('mahasiswa_ukts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswas')->cascadeOnDelete();
            $table->foreignId('kelompok_ukt_id')->constrained('kelompok_ukts')->cascadeOnDelete();
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->string('status')->default('aktif'); // aktif|pengajuan_keringanan|disetujui_keringanan
            $table->timestamps();
        });

        Schema::create('tagihans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswas')->cascadeOnDelete();
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->string('jenis'); // ukt|her_registrasi|denda|pendaftaran_pmb
            $table->decimal('nominal', 12, 2);
            $table->date('jatuh_tempo');
            $table->string('status')->default('belum_bayar'); // belum_bayar|dicicil|lunas|terlambat
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('pembayarans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tagihan_id')->constrained('tagihans')->cascadeOnDelete();
            $table->date('tanggal_bayar');
            $table->decimal('nominal_dibayar', 12, 2);
            $table->string('metode')->default('transfer_manual'); // transfer_manual|virtual_account
            $table->string('bukti_file_path')->nullable();
            $table->string('status_verifikasi')->default('menunggu'); // menunggu|diverifikasi|ditolak
            $table->foreignId('diverifikasi_oleh_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('diverifikasi_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('cicilan_tagihans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tagihan_id')->constrained('tagihans')->cascadeOnDelete();
            $table->integer('cicilan_ke');
            $table->decimal('nominal', 12, 2);
            $table->date('jatuh_tempo');
            $table->string('status')->default('belum_bayar'); // belum_bayar|lunas
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cicilan_tagihans');
        Schema::dropIfExists('pembayarans');
        Schema::dropIfExists('tagihans');
        Schema::dropIfExists('mahasiswa_ukts');
        Schema::dropIfExists('kelompok_ukts');
    }
};
