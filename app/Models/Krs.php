<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Krs extends Model
{
    use HasFactory;

    protected $table = 'krs';

    protected $fillable = [
        'mahasiswa_id',
        'tahun_ajaran_id',
        'status',
        'diajukan_at',
        'disetujui_at',
        'catatan_penolakan',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'diajukan_at' => 'datetime',
            'disetujui_at' => 'datetime',
        ];
    }

    /**
     * Get the mahasiswa that owns the KRS.
     *
     * @return BelongsTo<Mahasiswa, $this>
     */
    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    /**
     * Get the tahun ajaran that owns the KRS.
     *
     * @return BelongsTo<TahunAjaran, $this>
     */
    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }

    /**
     * Get the krs details.
     *
     * @return HasMany<KrsDetail, $this>
     */
    public function krsDetails(): HasMany
    {
        return $this->hasMany(KrsDetail::class, 'krs_id');
    }
}
