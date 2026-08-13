<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DokumenRegistrasi extends Model
{
    use HasFactory;

    protected $table = 'dokumen_registrasis';

    protected $fillable = [
        'registrasi_ulang_id',
        'jenis_dokumen',
        'file_path',
        'status_verifikasi',
    ];

    /**
     * Get the registrasi ulang.
     *
     * @return BelongsTo<RegistrasiUlang, $this>
     */
    public function registrasiUlang(): BelongsTo
    {
        return $this->belongsTo(RegistrasiUlang::class, 'registrasi_ulang_id');
    }
}
