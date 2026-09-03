<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KurikulumMatakuliah extends Model
{
    use HasFactory;

    protected $table = 'kurikulum_matakuliahs';

    protected $fillable = [
        'kurikulum_prodi_id',
        'matakuliah_id',
        'semester',
    ];

    /**
     * Get the kurikulum prodi.
     *
     * @return BelongsTo<KurikulumProdi, $this>
     */
    public function kurikulumProdi(): BelongsTo
    {
        return $this->belongsTo(KurikulumProdi::class, 'kurikulum_prodi_id');
    }

    /**
     * Get the matakuliah.
     *
     * @return BelongsTo<Matakuliah, $this>
     */
    public function matakuliah(): BelongsTo
    {
        return $this->belongsTo(Matakuliah::class, 'matakuliah_id');
    }

    /**
     * Get the kelas kuliahs opened from this kurikulum matakuliah.
     *
     * @return HasMany<KelasKuliah, $this>
     */
    public function kelasKuliahs(): HasMany
    {
        return $this->hasMany(KelasKuliah::class, 'kurikulum_matakuliah_id');
    }
}
