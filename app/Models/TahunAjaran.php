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
}
