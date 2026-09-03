<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MahasiswaUkt extends Model
{
    use HasFactory;

    protected $table = 'mahasiswa_ukts';

    protected $fillable = [
        'mahasiswa_id',
        'kelompok_ukt_id',
        'tahun_ajaran_id',
        'status',
    ];

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
     * Get the kelompok ukt.
     *
     * @return BelongsTo<KelompokUkt, $this>
     */
    public function kelompokUkt(): BelongsTo
    {
        return $this->belongsTo(KelompokUkt::class, 'kelompok_ukt_id');
    }

    /**
     * Get the tahun ajaran.
     *
     * @return BelongsTo<TahunAjaran, $this>
     */
    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }
}
