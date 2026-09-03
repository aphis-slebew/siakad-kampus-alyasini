<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GelombangPendaftaran extends Model
{
    use HasFactory;

    protected $table = 'gelombang_pendaftarans';

    protected $fillable = [
        'nama',
        'mulai_pendaftaran',
        'selesai_pendaftaran',
        'kuota',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'mulai_pendaftaran' => 'date',
            'selesai_pendaftaran' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the calon mahasiswas for the gelombang.
     *
     * @return HasMany<CalonMahasiswa, $this>
     */
    public function calonMahasiswas(): HasMany
    {
        return $this->hasMany(CalonMahasiswa::class, 'gelombang_pendaftaran_id');
    }
}
