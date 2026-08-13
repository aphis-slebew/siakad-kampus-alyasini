<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Nilai extends Model
{
    use HasFactory;

    protected $table = 'nilais';

    protected $fillable = [
        'krs_detail_id',
        'komponen',
        'nilai_angka',
        'nilai_huruf',
        'is_final',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'nilai_angka' => 'decimal:2',
            'is_final' => 'boolean',
        ];
    }

    /**
     * Get the KRS detail that owns the grade.
     *
     * @return BelongsTo<KrsDetail, $this>
     */
    public function krsDetail(): BelongsTo
    {
        return $this->belongsTo(KrsDetail::class, 'krs_detail_id');
    }
}
