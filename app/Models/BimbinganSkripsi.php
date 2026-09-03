<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BimbinganSkripsi extends Model
{
    use HasFactory;

    protected $table = 'bimbingan_skripsis';

    protected $fillable = [
        'skripsi_id',
        'tanggal',
        'catatan',
        'divalidasi',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'divalidasi' => 'boolean',
        ];
    }

    /**
     * Get the skripsi.
     *
     * @return BelongsTo<Skripsi, $this>
     */
    public function skripsi(): BelongsTo
    {
        return $this->belongsTo(Skripsi::class, 'skripsi_id');
    }
}
