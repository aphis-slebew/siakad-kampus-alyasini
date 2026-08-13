<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PeriodeWisuda extends Model
{
    use HasFactory;

    protected $table = 'periode_wisudas';

    protected $fillable = [
        'nama',
        'tanggal_wisuda',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal_wisuda' => 'date',
        ];
    }

    /**
     * Get the yudisiums for the wisuda period.
     *
     * @return HasMany<Yudisium, $this>
     */
    public function yudisiums(): HasMany
    {
        return $this->hasMany(Yudisium::class, 'periode_wisuda_id');
    }
}
