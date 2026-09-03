<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SettingProdi extends Model
{
    use HasFactory;

    protected $table = 'setting_prodis';

    protected $fillable = [
        'tahun_ajaran_id',
        'program_studi_id',
        'kurikulum_id',

        // Tab 1: KRS & Validasi
        'buka_krs',
        'tgl_awal_krs',
        'tgl_akhir_krs',
        'tgl_cetak_krs',
        'buka_validasi_krs',
        'tgl_awal_validasi_krs',
        'tgl_akhir_validasi_krs',
        'dosen_tampil_di_krs',
        'buka_cetak_krs',

        // Tab 2: KHS & Nilai
        'buka_khs',
        'tgl_awal_khs',
        'tgl_akhir_khs',
        'tgl_cetak_khs',
        'buka_pengisian_nilai',
        'dosen_isi_persentase_komponen',
        'tgl_awal_pengisian_nilai',
        'tgl_akhir_pengisian_nilai',

        // Tab 3: Ujian
        'buka_cetak_uts',
        'tgl_awal_cetak_uts',
        'tgl_akhir_cetak_uts',
        'tgl_cetak_uts',
        'min_presensi_uts',
        'min_presensi_uas',
        'buka_cetak_uas',
        'tgl_awal_cetak_uas',
        'tgl_akhir_cetak_uas',
        'tgl_cetak_uas',

        // Tab 4: Lain-lain
        'buka_ubah_biodata',
        'buka_kuesioner',
        'tgl_awal_kuesioner',
        'tgl_akhir_kuesioner',
        'dosen_generate_tatap_muka',
        'jumlah_pertemuan_kuliah',
        'batas_waktu_perubahan_presensi_hari',
        'buka_setting_ketua_kelas',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'buka_krs' => 'boolean',
            'tgl_awal_krs' => 'date',
            'tgl_akhir_krs' => 'date',
            'tgl_cetak_krs' => 'date',
            'buka_validasi_krs' => 'boolean',
            'tgl_awal_validasi_krs' => 'date',
            'tgl_akhir_validasi_krs' => 'date',
            'dosen_tampil_di_krs' => 'boolean',
            'buka_cetak_krs' => 'boolean',

            'buka_khs' => 'boolean',
            'tgl_awal_khs' => 'date',
            'tgl_akhir_khs' => 'date',
            'tgl_cetak_khs' => 'date',
            'buka_pengisian_nilai' => 'boolean',
            'dosen_isi_persentase_komponen' => 'boolean',
            'tgl_awal_pengisian_nilai' => 'date',
            'tgl_akhir_pengisian_nilai' => 'date',

            'buka_cetak_uts' => 'boolean',
            'tgl_awal_cetak_uts' => 'date',
            'tgl_akhir_cetak_uts' => 'date',
            'tgl_cetak_uts' => 'date',
            'min_presensi_uts' => 'integer',
            'min_presensi_uas' => 'integer',
            'buka_cetak_uas' => 'boolean',
            'tgl_awal_cetak_uas' => 'date',
            'tgl_akhir_cetak_uas' => 'date',
            'tgl_cetak_uas' => 'date',

            'buka_ubah_biodata' => 'boolean',
            'buka_kuesioner' => 'boolean',
            'tgl_awal_kuesioner' => 'date',
            'tgl_akhir_kuesioner' => 'date',
            'dosen_generate_tatap_muka' => 'boolean',
            'jumlah_pertemuan_kuliah' => 'integer',
            'batas_waktu_perubahan_presensi_hari' => 'integer',
            'buka_setting_ketua_kelas' => 'boolean',
        ];
    }

    /**
     * Get the tahun ajaran that owns the setting.
     *
     * @return BelongsTo<TahunAjaran, $this>
     */
    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }

    /**
     * Get the program studi that owns the setting (nullable for institute-wide).
     *
     * @return BelongsTo<ProgramStudi, $this>
     */
    public function programStudi(): BelongsTo
    {
        return $this->belongsTo(ProgramStudi::class, 'program_studi_id');
    }

    /**
     * Get the kurikulum prodi.
     *
     * @return BelongsTo<KurikulumProdi, $this>
     */
    public function kurikulumProdi(): BelongsTo
    {
        return $this->belongsTo(KurikulumProdi::class, 'kurikulum_id');
    }
}
