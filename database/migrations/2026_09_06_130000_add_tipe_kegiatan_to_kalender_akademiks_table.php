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
        Schema::table('kalender_akademiks', function (Blueprint $table) {
            $table->string('tipe_kegiatan', 50)->default('lainnya')->after('kegiatan')->index();
            $table->text('deskripsi')->nullable()->after('selesai');
            $table->boolean('is_published')->default(true)->after('deskripsi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kalender_akademiks', function (Blueprint $table) {
            $table->dropColumn(['tipe_kegiatan', 'deskripsi', 'is_published']);
        });
    }
};
