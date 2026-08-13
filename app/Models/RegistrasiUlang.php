<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RegistrasiUlang extends Model
{
    use HasFactory;

    protected $table = 'registrasi_ulangs';

    protected $fillable = [
        'periode_registrasi_id',
        'calon_mahasiswa_id',
        'mahasiswa_id',
        'status',
        'selesai_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'selesai_at' => 'datetime',
        ];
    }

    /**
     * Get the periode registrasi.
     *
     * @return BelongsTo<PeriodeRegistrasi, $this>
     */
    public function periodeRegistrasi(): BelongsTo
    {
        return $this->belongsTo(PeriodeRegistrasi::class, 'periode_registrasi_id');
    }

    /**
     * Get the calon mahasiswa.
     *
     * @return BelongsTo<CalonMahasiswa, $this>
     */
    public function calonMahasiswa(): BelongsTo
    {
        return $this->belongsTo(CalonMahasiswa::class, 'calon_mahasiswa_id');
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
     * Get the dokumen registrasis.
     *
     * @return HasMany<DokumenRegistrasi, $this>
     */
    public function dokumenRegistrasis(): HasMany
    {
        return $this->hasMany(DokumenRegistrasi::class, 'registrasi_ulang_id');
    }
}
