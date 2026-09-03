<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BerkasPendaftaran extends Model
{
    use HasFactory;

    protected $table = 'berkas_pendaftarans';

    protected $fillable = [
        'calon_mahasiswa_id',
        'jenis_berkas',
        'file_path',
        'status_verifikasi',
        'catatan_verifikasi',
        'diverifikasi_oleh_user_id',
    ];

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
     * Get the user who verified the document.
     *
     * @return BelongsTo<User, $this>
     */
    public function diverifikasiOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diverifikasi_oleh_user_id');
    }
}
