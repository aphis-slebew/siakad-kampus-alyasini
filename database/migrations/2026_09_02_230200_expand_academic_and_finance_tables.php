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
        Schema::table('tahun_ajarans', function (Blueprint $table) {
            // Jendela Waktu Periode Akademik Global
            $table->date('krs_mulai')->nullable()->after('is_active');
            $table->date('krs_selesai')->nullable()->after('krs_mulai');
            $table->date('krs_batal_tambah_mulai')->nullable()->after('krs_selesai');
            $table->date('krs_batal_tambah_selesai')->nullable()->after('krs_batal_tambah_mulai');
            $table->date('penilaian_mulai')->nullable()->after('krs_batal_tambah_selesai');
            $table->date('penilaian_selesai')->nullable()->after('penilaian_mulai');
            $table->date('pembayaran_mulai')->nullable()->after('penilaian_selesai');
            $table->date('pembayaran_selesai')->nullable()->after('pembayaran_mulai');
            $table->date('uts_mulai')->nullable()->after('pembayaran_selesai');
            $table->date('uts_selesai')->nullable()->after('uts_mulai');
            $table->date('uas_mulai')->nullable()->after('uts_selesai');
            $table->date('uas_selesai')->nullable()->after('uas_mulai');
        });

        Schema::table('dosens', function (Blueprint $table) {
            $table->string('nuptk')->nullable()->after('nidn_hash');
            $table->string('niy_nip')->nullable()->after('nuptk');
            $table->string('pangkat_golongan')->nullable()->after('jabatan_fungsional_saat_ini'); // e.g. Penata Muda Tk. I / III/b
            $table->string('sk_kepangkatan_path')->nullable()->after('pangkat_golongan');
        });

        Schema::table('kelas_kuliahs', function (Blueprint $table) {
            $table->string('sistem_kuliah')->default('reguler')->after('kuota'); // reguler, hibrida, online
        });

        Schema::create('komponen_biayas', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama'); // e.g. UKT Semesteran, Biaya UTS, Biaya KKN/PBL, Biaya Ujian Skripsi, Biaya Wisuda, Biaya PMB
            $table->string('kategori')->default('akademik'); // akademik, kegiatan, pendaftaran, kelulusan
            $table->foreignId('program_studi_id')->nullable()->constrained('program_studis')->nullOnDelete();
            $table->integer('angkatan')->nullable(); // null means all angkatans
            $table->decimal('nominal', 15, 2);
            $table->boolean('is_active')->default(true);
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('komponen_biayas');

        Schema::table('kelas_kuliahs', function (Blueprint $table) {
            $table->dropColumn('sistem_kuliah');
        });

        Schema::table('dosens', function (Blueprint $table) {
            $table->dropColumn(['nuptk', 'niy_nip', 'pangkat_golongan', 'sk_kepangkatan_path']);
        });

        Schema::table('tahun_ajarans', function (Blueprint $table) {
            $table->dropColumn([
                'krs_mulai', 'krs_selesai',
                'krs_batal_tambah_mulai', 'krs_batal_tambah_selesai',
                'penilaian_mulai', 'penilaian_selesai',
                'pembayaran_mulai', 'pembayaran_selesai',
                'uts_mulai', 'uts_selesai',
                'uas_mulai', 'uas_selesai',
            ]);
        });
    }
};
