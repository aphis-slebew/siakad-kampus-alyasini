<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tagihan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tagihans';

    protected $fillable = [
        'mahasiswa_id',
        'tahun_ajaran_id',
        'jenis',
        'nominal',
        'jatuh_tempo',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'nominal' => 'decimal:2',
            'jatuh_tempo' => 'date',
        ];
    }

    /**
     * Get the mahasiswa that owns the tagihan.
     *
     * @return BelongsTo<Mahasiswa, $this>
     */
    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    /**
     * Get the tahun ajaran that owns the tagihan.
     *
     * @return BelongsTo<TahunAjaran, $this>
     */
    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }

    /**
     * Get the pembayarans for the tagihan.
     *
     * @return HasMany<Pembayaran, $this>
     */
    public function pembayarans(): HasMany
    {
        return $this->hasMany(Pembayaran::class, 'tagihan_id');
    }

    /**
     * Get the cicilan tagihans for the tagihan.
     *
     * @return HasMany<CicilanTagihan, $this>
     */
    public function cicilanTagihans(): HasMany
    {
        return $this->hasMany(CicilanTagihan::class, 'tagihan_id');
    }
}
