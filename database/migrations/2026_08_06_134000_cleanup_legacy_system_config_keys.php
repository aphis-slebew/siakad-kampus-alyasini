<?php

use App\Models\SystemConfig;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        SystemConfig::whereIn('key', ['MIN_IPK_SKRIPSI', 'MIN_SKS_SKRIPSI'])->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
