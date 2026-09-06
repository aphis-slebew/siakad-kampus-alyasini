<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KrsDetail extends Model
{
    use HasFactory;

    protected $table = 'krs_details';

    protected $fillable = [
        'krs_id',
        'kelas_kuliah_id',
    ];

    /**
     * Get the KRS.
     *
     * @return BelongsTo<Krs, $this>
     */
    public function krs(): BelongsTo
    {
        return $this->belongsTo(Krs::class, 'krs_id');
    }

    /**
     * Get the kelas kuliah.
     *
     * @return BelongsTo<KelasKuliah, $this>
     */
    public function kelasKuliah(): BelongsTo
    {
        return $this->belongsTo(KelasKuliah::class, 'kelas_kuliah_id');
    }

    /**
     * Get the nilais for this KRS detail.
     *
     * @return HasMany<Nilai, $this>
     */
    public function nilais(): HasMany
    {
        return $this->hasMany(Nilai::class, 'krs_detail_id');
    }
}
