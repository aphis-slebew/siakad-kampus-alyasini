<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StatusAkademikHistoris extends Model
{
    use HasFactory;

    protected $table = 'status_akademik_historis';

    protected $fillable = [
        'mahasiswa_id',
        'tahun_ajaran_id',
        'status',
        'keterangan',
    ];

    /**
     * Get the mahasiswa that owns the status akademik historis.
     *
     * @return BelongsTo<Mahasiswa, $this>
     */
    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    /**
     * Get the tahun ajaran that owns the status akademik historis.
     *
     * @return BelongsTo<TahunAjaran, $this>
     */
    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }
}
