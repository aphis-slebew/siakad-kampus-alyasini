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
        Schema::create('setting_prodis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->foreignId('program_studi_id')->nullable()->constrained('program_studis')->cascadeOnDelete();
            $table->foreignId('kurikulum_id')->nullable()->constrained('kurikulum_prodis')->nullOnDelete();

            // Tab 1: KRS & Validasi
            $table->boolean('buka_krs')->default(true);
            $table->date('tgl_awal_krs')->nullable();
            $table->date('tgl_akhir_krs')->nullable();
            $table->date('tgl_cetak_krs')->nullable();
            $table->boolean('buka_validasi_krs')->default(true);
            $table->date('tgl_awal_validasi_krs')->nullable();
            $table->date('tgl_akhir_validasi_krs')->nullable();
            $table->boolean('dosen_tampil_di_krs')->default(true);
            $table->boolean('buka_cetak_krs')->default(true);

            // Tab 2: KHS & Nilai
            $table->boolean('buka_khs')->default(true);
            $table->date('tgl_awal_khs')->nullable();
            $table->date('tgl_akhir_khs')->nullable();
            $table->date('tgl_cetak_khs')->nullable();
            $table->boolean('buka_pengisian_nilai')->default(true);
            $table->boolean('dosen_isi_persentase_komponen')->default(true);
            $table->date('tgl_awal_pengisian_nilai')->nullable();
            $table->date('tgl_akhir_pengisian_nilai')->nullable();

            // Tab 3: Ujian (UTS & UAS)
            $table->boolean('buka_cetak_uts')->default(true);
            $table->date('tgl_awal_cetak_uts')->nullable();
            $table->date('tgl_akhir_cetak_uts')->nullable();
            $table->date('tgl_cetak_uts')->nullable();
            $table->integer('min_presensi_uts')->default(50);
            $table->integer('min_presensi_uas')->default(75);
            $table->boolean('buka_cetak_uas')->default(false);
            $table->date('tgl_awal_cetak_uas')->nullable();
            $table->date('tgl_akhir_cetak_uas')->nullable();
            $table->date('tgl_cetak_uas')->nullable();

            // Tab 4: Lain-lain
            $table->boolean('buka_ubah_biodata')->default(false);
            $table->boolean('buka_kuesioner')->default(true);
            $table->date('tgl_awal_kuesioner')->nullable();
            $table->date('tgl_akhir_kuesioner')->nullable();
            $table->boolean('dosen_generate_tatap_muka')->default(false);
            $table->integer('jumlah_pertemuan_kuliah')->default(16);
            $table->integer('batas_waktu_perubahan_presensi_hari')->default(3);
            $table->boolean('buka_setting_ketua_kelas')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('setting_prodis');
    }
};
