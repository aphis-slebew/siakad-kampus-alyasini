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
        Schema::table('calon_mahasiswas', function (Blueprint $table) {
            $table->unique('nik', 'calon_mahasiswas_nik_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('calon_mahasiswas', function (Blueprint $table) {
            $table->dropUnique('calon_mahasiswas_nik_unique');
        });
    }
};
