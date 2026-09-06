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
        Schema::table('perguruan_tinggis', function (Blueprint $table) {
            $table->foreignId('ketua_dosen_id')
                ->nullable()
                ->after('id')
                ->constrained('dosens')
                ->nullOnDelete();

            $table->foreignId('wakil_ketua_1_dosen_id')
                ->nullable()
                ->after('ketua_dosen_id')
                ->constrained('dosens')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('perguruan_tinggis', function (Blueprint $table) {
            $table->dropConstrainedForeignId('ketua_dosen_id');
            $table->dropConstrainedForeignId('wakil_ketua_1_dosen_id');
        });
    }
};
