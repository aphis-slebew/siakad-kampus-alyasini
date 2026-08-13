<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Presensi extends Model
{
    use HasFactory;

    protected $table = 'presensis';

    protected $fillable = [
        'jurnal_perkuliahan_id',
        'mahasiswa_id',
        'status',
    ];

    /**
     * Get the jurnal perkuliahan.
     *
     * @return BelongsTo<JurnalPerkuliahan, $this>
     */
    public function jurnalPerkuliahan(): BelongsTo
    {
        return $this->belongsTo(JurnalPerkuliahan::class, 'jurnal_perkuliahan_id');
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
}
