<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiwayatJabatanFungsional extends Model
{
    use HasFactory;

    protected $table = 'riwayat_jabatan_fungsionals';

    protected $fillable = [
        'dosen_id',
        'jabatan',
        'tmt',
        'nomor_sk',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tmt' => 'date',
        ];
    }

    /**
     * Get the dosen that owns the riwayat jabatan fungsional.
     *
     * @return BelongsTo<Dosen, $this>
     */
    public function dosen(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'dosen_id');
    }
}
