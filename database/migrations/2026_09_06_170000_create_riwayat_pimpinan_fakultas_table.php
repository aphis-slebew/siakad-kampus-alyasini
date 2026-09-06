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
        Schema::create('riwayat_pimpinan_fakultas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fakultas_id')->constrained('fakultas')->cascadeOnDelete();
            $table->foreignId('dosen_id')->constrained('dosens')->cascadeOnDelete();
            $table->enum('jabatan', [
                'dekan',
                'wakil_dekan_1',
                'wakil_dekan_2',
                'wakil_dekan_3',
                'wakil_dekan_4',
                'ketua_gpmf',
            ])->default('dekan');
            $table->date('periode_mulai');
            $table->date('periode_selesai')->nullable();
            $table->string('no_sk_pelantikan', 100)->nullable();
            $table->string('file_sk_pelantikan_path')->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();

            $table->index(['fakultas_id', 'jabatan', 'is_aktif'], 'rpf_fakultas_jabatan_aktif_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayat_pimpinan_fakultas');
    }
};
