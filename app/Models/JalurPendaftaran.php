<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JalurPendaftaran extends Model
{
    use HasFactory;

    protected $table = 'jalur_pendaftarans';

    protected $fillable = [
        'nama',
        'biaya_pendaftaran',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'biaya_pendaftaran' => 'decimal:2',
        ];
    }

    /**
     * Get the calon mahasiswas for the jalur.
     *
     * @return HasMany<CalonMahasiswa, $this>
     */
    public function calonMahasiswas(): HasMany
    {
        return $this->hasMany(CalonMahasiswa::class, 'jalur_pendaftaran_id');
    }
}
