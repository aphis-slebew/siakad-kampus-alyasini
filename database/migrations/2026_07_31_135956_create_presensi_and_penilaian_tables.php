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
        Schema::create('jurnal_perkuliahans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_kuliah_id')->constrained('kelas_kuliahs')->cascadeOnDelete();
            $table->date('tanggal');
            $table->text('materi');
            $table->foreignId('dosen_pengajar_id')->constrained('dosen_pengajars')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('presensis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jurnal_perkuliahan_id')->constrained('jurnal_perkuliahans')->cascadeOnDelete();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswas')->cascadeOnDelete();
            $table->string('status'); // hadir|izin|sakit|alpa
            $table->timestamps();
        });

        Schema::create('komposisi_nilais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_kuliah_id')->constrained('kelas_kuliahs')->cascadeOnDelete();
            $table->string('komponen'); // tugas|uts|uas|presensi
            $table->integer('bobot_persen');
            $table->timestamps();
        });

        Schema::create('nilais', function (Blueprint $table) {
            $table->id();
            $table->foreignId('krs_detail_id')->constrained('krs_details')->cascadeOnDelete();
            $table->string('komponen'); // tugas|uts|uas|presensi
            $table->decimal('nilai_angka', 5, 2);
            $table->string('nilai_huruf')->nullable();
            $table->boolean('is_final')->default(false);
            $table->timestamps();
        });

        Schema::create('skala_nilais', function (Blueprint $table) {
            $table->id();
            $table->decimal('min_angka', 5, 2);
            $table->decimal('max_angka', 5, 2);
            $table->string('huruf');
            $table->decimal('bobot', 3, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skala_nilais');
        Schema::dropIfExists('nilais');
        Schema::dropIfExists('komposisi_nilais');
        Schema::dropIfExists('presensis');
        Schema::dropIfExists('jurnal_perkuliahans');
    }
};
