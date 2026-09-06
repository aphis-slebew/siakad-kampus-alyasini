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
            $table->foreignId('wakil_dekan_1_dosen_id')->nullable()->after('wakil_dekan_dosen_id')->constrained('dosens')->nullOnDelete();
            $table->foreignId('wakil_dekan_2_dosen_id')->nullable()->after('wakil_dekan_1_dosen_id')->constrained('dosens')->nullOnDelete();
            $table->foreignId('wakil_dekan_3_dosen_id')->nullable()->after('wakil_dekan_2_dosen_id')->constrained('dosens')->nullOnDelete();
            $table->foreignId('wakil_dekan_4_dosen_id')->nullable()->after('wakil_dekan_3_dosen_id')->constrained('dosens')->nullOnDelete();
            $table->foreignId('ketua_gpmf_dosen_id')->nullable()->after('wakil_dekan_4_dosen_id')->constrained('dosens')->nullOnDelete();
            $table->foreignId('kepala_tata_usaha_pegawai_id')->nullable()->after('ketua_gpmf_dosen_id')->constrained('pegawais')->nullOnDelete();

            $table->string('file_sk_pendirian_path')->nullable()->after('tanggal_sk_pendirian');
            $table->string('file_sk_izin_operasional_path')->nullable()->after('tanggal_sk_izin_operasional');

            $table->uuid('id_feeder')->nullable()->unique()->after('misi');
            $table->timestamp('last_synced_at')->nullable()->after('id_feeder');
            $table->enum('sync_status', ['belum_sinkron', 'sinkron', 'gagal_sinkron'])->default('belum_sinkron')->after('last_synced_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fakultas', function (Blueprint $table) {
            $table->dropForeign(['wakil_dekan_1_dosen_id']);
            $table->dropForeign(['wakil_dekan_2_dosen_id']);
            $table->dropForeign(['wakil_dekan_3_dosen_id']);
            $table->dropForeign(['wakil_dekan_4_dosen_id']);
            $table->dropForeign(['ketua_gpmf_dosen_id']);
            $table->dropForeign(['kepala_tata_usaha_pegawai_id']);

            $table->dropColumn([
                'wakil_dekan_1_dosen_id',
                'wakil_dekan_2_dosen_id',
                'wakil_dekan_3_dosen_id',
                'wakil_dekan_4_dosen_id',
                'ketua_gpmf_dosen_id',
                'kepala_tata_usaha_pegawai_id',
                'file_sk_pendirian_path',
                'file_sk_izin_operasional_path',
                'id_feeder',
                'last_synced_at',
                'sync_status',
            ]);
        });
    }
};
