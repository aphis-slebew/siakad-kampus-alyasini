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
        Schema::table('fakultas', function (Blueprint $table) {
            // Relasi Pimpinan Fakultas (Dekan & Wakil Dekan)
            $table->foreignId('dekan_dosen_id')
                ->nullable()
                ->after('id')
                ->constrained('dosens')
                ->nullOnDelete();

            $table->foreignId('wakil_dekan_dosen_id')
                ->nullable()
                ->after('dekan_dosen_id')
                ->constrained('dosens')
                ->nullOnDelete();

            // Gelar Dekan (mendukung fallback input manual jika non-dosen)
            $table->string('dekan_gelar_depan')->nullable()->after('dekan_nama');
            $table->string('dekan_gelar_belakang')->nullable()->after('dekan_gelar_depan');

            // Legalitas & SK PDDIKTI
            $table->string('no_sk_pendirian')->nullable()->after('nama_singkat');
            $table->date('tanggal_sk_pendirian')->nullable()->after('no_sk_pendirian');
            $table->string('no_sk_izin_operasional')->nullable()->after('tanggal_sk_pendirian');
            $table->date('tanggal_sk_izin_operasional')->nullable()->after('no_sk_izin_operasional');

            // Kontak & Kanal Resmi
            $table->string('email')->nullable()->after('telepon');
            $table->string('website')->nullable()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fakultas', function (Blueprint $table) {
            $table->dropForeign(['dekan_dosen_id']);
            $table->dropForeign(['wakil_dekan_dosen_id']);
            $table->dropColumn([
                'dekan_dosen_id',
                'wakil_dekan_dosen_id',
                'dekan_gelar_depan',
                'dekan_gelar_belakang',
                'no_sk_pendirian',
                'tanggal_sk_pendirian',
                'no_sk_izin_operasional',
                'tanggal_sk_izin_operasional',
                'email',
                'website',
            ]);
        });
    }
};
