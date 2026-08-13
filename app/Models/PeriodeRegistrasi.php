<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PeriodeRegistrasi extends Model
{
    use HasFactory;

    protected $table = 'periode_registrasis';

    protected $fillable = [
        'tahun_ajaran_id',
        'jenis',
        'mulai',
        'selesai',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'mulai' => 'date',
            'selesai' => 'date',
        ];
    }

    /**
     * Get the tahun ajaran that owns the periode registrasi.
     *
     * @return BelongsTo<TahunAjaran, $this>
     */
    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }

    /**
     * Get the registrasi ulangs for the periode.
     *
     * @return HasMany<RegistrasiUlang, $this>
     */
    public function registrasiUlangs(): HasMany
    {
        return $this->hasMany(RegistrasiUlang::class, 'periode_registrasi_id');
    }
}
