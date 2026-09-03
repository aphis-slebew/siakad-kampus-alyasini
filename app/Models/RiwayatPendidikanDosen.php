<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiwayatPendidikanDosen extends Model
{
    use HasFactory;

    protected $table = 'riwayat_pendidikan_dosens';

    protected $fillable = [
        'dosen_id',
        'jenjang',
        'institusi',
        'program_studi',
        'tahun_lulus',
    ];

    /**
     * Get the dosen that owns the riwayat pendidikan.
     *
     * @return BelongsTo<Dosen, $this>
     */
    public function dosen(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'dosen_id');
    }
}
