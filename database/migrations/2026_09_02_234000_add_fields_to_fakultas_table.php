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
            $table->string('nama_en')->nullable()->after('nama');
            $table->string('telepon')->nullable()->after('alamat');
            $table->string('periode_berdiri')->nullable()->after('tahun_berdiri');
            $table->text('visi')->nullable()->after('wakil_dekan_4');
            $table->text('misi')->nullable()->after('visi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fakultas', function (Blueprint $table) {
            $table->dropColumn(['nama_en', 'telepon', 'periode_berdiri', 'visi', 'misi']);
        });
    }
};
