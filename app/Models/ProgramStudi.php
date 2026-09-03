<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProgramStudi extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'program_studis';

    protected $fillable = [
        'fakultas_id',
        'kode',
        'nama',
        'nama_en',
        'nama_singkat',
        'jenjang',
        'periode_berdiri',
        'gelar',
        'gelar_singkat',
        'gelar_en',
        'gelar_singkat_en',
        'status',
        'status_spmb',
        'terdaftar_lptk',
        'ketua_prodi_nama',
        'ketua_prodi_nidn',
        'sekretaris_prodi_nama',
        'sks_lulus_min',
        'ipk_lulus_min',
        'tugas_akhir_syarat',
        'jenis_tugas_akhir',
        'pengaturan_transfer_nilai',
        'max_dosen_pembimbing',
        'max_dosen_penguji',
        'periode_hitung_ips',
        'lembaga_akreditasi',
        'akreditasi',
        'nilai_akreditasi',
        'no_sk_akreditasi',
        'tanggal_sk_akreditasi',
        'tanggal_berlaku_akreditasi',
        'tanggal_berakhir_akreditasi',
        'file_sertifikat_akreditasi',
        'alamat',
        'telepon',
        'email',
        'website',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'terdaftar_lptk' => 'boolean',
            'tugas_akhir_syarat' => 'boolean',
            'ipk_lulus_min' => 'decimal:2',
            'tanggal_sk_akreditasi' => 'date',
            'tanggal_berlaku_akreditasi' => 'date',
            'tanggal_berakhir_akreditasi' => 'date',
        ];
    }

    /**
     * Get the fakultas that owns the program studi.
     *
     * @return BelongsTo<Fakultas, $this>
     */
    public function fakultas(): BelongsTo
    {
        return $this->belongsTo(Fakultas::class, 'fakultas_id');
    }

    /**
     * Get the konsentrasis for the program studi.
     *
     * @return HasMany<Konsentrasi, $this>
     */
    public function konsentrasis(): HasMany
    {
        return $this->hasMany(Konsentrasi::class, 'program_studi_id');
    }

    /**
     * Get the mahasiswas for the program studi.
     *
     * @return HasMany<Mahasiswa, $this>
     */
    public function mahasiswas(): HasMany
    {
        return $this->hasMany(Mahasiswa::class, 'program_studi_id');
    }

    /**
     * Get the dosens for the program studi.
     *
     * @return HasMany<Dosen, $this>
     */
    public function dosens(): HasMany
    {
        return $this->hasMany(Dosen::class, 'program_studi_id');
    }

    /**
     * Get the kurikulum prodis for the program studi.
     *
     * @return HasMany<KurikulumProdi, $this>
     */
    public function kurikulumProdis(): HasMany
    {
        return $this->hasMany(KurikulumProdi::class, 'program_studi_id');
    }
}
