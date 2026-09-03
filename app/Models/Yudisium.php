<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Yudisium extends Model
{
    use HasFactory;

    protected $table = 'yudisiums';

    protected $fillable = [
        'mahasiswa_id',
        'periode_wisuda_id',
        'ipk_akhir',
        'nomor_dokumen',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'ipk_akhir' => 'decimal:2',
        ];
    }

    /**
     * Get the mahasiswa.
     *
     * @return BelongsTo<Mahasiswa, $this>
     */
    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    /**
     * Get the periode wisuda.
     *
     * @return BelongsTo<PeriodeWisuda, $this>
     */
    public function periodeWisuda(): BelongsTo
    {
        return $this->belongsTo(PeriodeWisuda::class, 'periode_wisuda_id');
    }
}
