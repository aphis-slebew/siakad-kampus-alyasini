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
            $table->string('nik_hash', 64)->nullable()->unique()->after('nik');
        });

        Schema::table('mahasiswas', function (Blueprint $table) {
            $table->string('nik_hash', 64)->nullable()->unique()->after('nik');
        });

        if (Schema::hasTable('dosens')) {
            Schema::table('dosens', function (Blueprint $table) {
                $table->string('nik_hash', 64)->nullable()->unique()->after('nik');
                $table->string('nidn_hash', 64)->nullable()->unique()->after('nidn');
            });
        }

        if (Schema::hasTable('pegawais')) {
            Schema::table('pegawais', function (Blueprint $table) {
                $table->string('nik_hash', 64)->nullable()->unique()->after('nik');
                $table->string('nip_hash', 64)->nullable()->unique()->after('nip_internal');
            });
        }

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('calon_mahasiswas', function (Blueprint $table) {
            $table->dropUnique(['nik_hash']);
            $table->dropColumn('nik_hash');
        });

        Schema::table('mahasiswas', function (Blueprint $table) {
            $table->dropUnique(['nik_hash']);
            $table->dropColumn('nik_hash');
        });

        if (Schema::hasTable('dosens')) {
            Schema::table('dosens', function (Blueprint $table) {
                $table->dropUnique(['nik_hash']);
                $table->dropUnique(['nidn_hash']);
                $table->dropColumn(['nik_hash', 'nidn_hash']);
            });
        }

        if (Schema::hasTable('pegawais')) {
            Schema::table('pegawais', function (Blueprint $table) {
                $table->dropUnique(['nik_hash']);
                $table->dropColumn('nik_hash');
            });
        }
    }
};
