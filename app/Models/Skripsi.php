<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Skripsi extends Model
{
    use HasFactory;

    protected $table = 'skripsis';

    protected $fillable = [
        'mahasiswa_id',
        'dosen_pembimbing_id',
        'judul',
        'status',
        'tanggal_ujian',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal_ujian' => 'date',
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
     * Get the dosen pembimbing.
     *
     * @return BelongsTo<Dosen, $this>
     */
    public function dosenPembimbing(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'dosen_pembimbing_id');
    }

    /**
     * Get the bimbingan skripsis.
     *
     * @return HasMany<BimbinganSkripsi, $this>
     */
    public function bimbinganSkripsis(): HasMany
    {
        return $this->hasMany(BimbinganSkripsi::class, 'skripsi_id');
    }
}
