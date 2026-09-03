<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TahunAjaran extends Model
{
    use HasFactory;

    protected $table = 'tahun_ajarans';

    protected $fillable = [
        'nama',
        'mulai',
        'selesai',
        'is_active',
        'krs_mulai',
        'krs_selesai',
        'krs_batal_tambah_mulai',
        'krs_batal_tambah_selesai',
        'penilaian_mulai',
        'penilaian_selesai',
        'pembayaran_mulai',
        'pembayaran_selesai',
        'uts_mulai',
        'uts_selesai',
        'uas_mulai',
        'uas_selesai',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'mulai' => 'date',
            'selesai' => 'date',
            'is_active' => 'boolean',
            'krs_mulai' => 'date',
            'krs_selesai' => 'date',
            'krs_batal_tambah_mulai' => 'date',
            'krs_batal_tambah_selesai' => 'date',
            'penilaian_mulai' => 'date',
            'penilaian_selesai' => 'date',
            'pembayaran_mulai' => 'date',
            'pembayaran_selesai' => 'date',
            'uts_mulai' => 'date',
            'uts_selesai' => 'date',
            'uas_mulai' => 'date',
            'uas_selesai' => 'date',
        ];
    }

    /**
     * Get the kalender akademiks for the tahun ajaran.
     *
     * @return HasMany<KalenderAkademik, $this>
     */
    public function kalenderAkademiks(): HasMany
    {
        return $this->hasMany(KalenderAkademik::class, 'tahun_ajaran_id');
    }

    /**
     * Get the kelas kuliahs for the tahun ajaran.
     *
     * @return HasMany<KelasKuliah, $this>
     */
    public function kelasKuliahs(): HasMany
    {
        return $this->hasMany(KelasKuliah::class, 'tahun_ajaran_id');
    }

    /**
     * Get the krss for the tahun ajaran.
     *
     * @return HasMany<Krs, $this>
     */
    public function krss(): HasMany
    {
        return $this->hasMany(Krs::class, 'tahun_ajaran_id');
    }

    /**
     * Get the tagihans for the tahun ajaran.
     *
     * @return HasMany<Tagihan, $this>
     */
    public function tagihans(): HasMany
    {
        return $this->hasMany(Tagihan::class, 'tahun_ajaran_id');
    }
}
