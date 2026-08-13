<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Matakuliah extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'matakuliahs';

    protected $fillable = [
        'kode',
        'nama',
        'sks',
        'jenis',
        'bidang_ilmu_id',
    ];

    /**
     * Get the bidang ilmu referensi for the matakuliah.
     *
     * @return BelongsTo<ReferensiBiodata, $this>
     */
    public function bidangIlmu(): BelongsTo
    {
        return $this->belongsTo(ReferensiBiodata::class, 'bidang_ilmu_id');
    }

    /**
     * Get the prasyarats for the matakuliah.
     *
     * @return HasMany<PrasyaratMatakuliah, $this>
     */
    public function prasyarats(): HasMany
    {
        return $this->hasMany(PrasyaratMatakuliah::class, 'matakuliah_id');
    }

    /**
     * Get the kurikulum matakuliahs for the matakuliah.
     *
     * @return HasMany<KurikulumMatakuliah, $this>
     */
    public function kurikulumMatakuliahs(): HasMany
    {
        return $this->hasMany(KurikulumMatakuliah::class, 'matakuliah_id');
    }
}
