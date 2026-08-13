<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KurikulumProdi extends Model
{
    use HasFactory;

    protected $table = 'kurikulum_prodis';

    protected $fillable = [
        'program_studi_id',
        'tahun_kurikulum',
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
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the program studi that owns the kurikulum prodi.
     *
     * @return BelongsTo<ProgramStudi, $this>
     */
    public function programStudi(): BelongsTo
    {
        return $this->belongsTo(ProgramStudi::class, 'program_studi_id');
    }

    /**
     * Get the kurikulum matakuliahs for the kurikulum.
     *
     * @return HasMany<KurikulumMatakuliah, $this>
     */
    public function kurikulumMatakuliahs(): HasMany
    {
        return $this->hasMany(KurikulumMatakuliah::class, 'kurikulum_prodi_id');
    }
}
