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
        Schema::create('proposal_skripsis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswas')->cascadeOnDelete();
            $table->foreignId('dosen_pembimbing_id')->nullable()->constrained('dosens')->nullOnDelete();
            $table->text('judul')->nullable();
            $table->string('status')->default('diajukan');
            $table->date('tanggal_ujian')->nullable();
            $table->timestamps();
        });

        Schema::create('bimbingan_proposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_skripsi_id')->constrained('proposal_skripsis')->cascadeOnDelete();
            $table->date('tanggal');
            $table->text('catatan');
            $table->boolean('divalidasi')->default(false);
            $table->timestamps();
        });

        Schema::create('skripsis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswas')->cascadeOnDelete();
            $table->foreignId('dosen_pembimbing_id')->nullable()->constrained('dosens')->nullOnDelete();
            $table->text('judul');
            $table->string('status')->default('bimbingan');
            $table->date('tanggal_ujian')->nullable();
            $table->timestamps();
        });

        Schema::create('bimbingan_skripsis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('skripsi_id')->constrained('skripsis')->cascadeOnDelete();
            $table->date('tanggal');
            $table->text('catatan');
            $table->boolean('divalidasi')->default(false);
            $table->timestamps();
        });

        Schema::create('periode_wisudas', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->date('tanggal_wisuda');
            $table->timestamps();
        });

        Schema::create('yudisiums', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswas')->cascadeOnDelete();
            $table->foreignId('periode_wisuda_id')->nullable()->constrained('periode_wisudas')->nullOnDelete();
            $table->decimal('ipk_akhir', 3, 2);
            $table->string('nomor_dokumen')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('yudisiums');
        Schema::dropIfExists('periode_wisudas');
        Schema::dropIfExists('bimbingan_skripsis');
        Schema::dropIfExists('skripsis');
        Schema::dropIfExists('bimbingan_proposals');
        Schema::dropIfExists('proposal_skripsis');
    }
};
