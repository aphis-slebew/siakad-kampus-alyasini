<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AktivitasMahasiswa extends Model
{
    use HasFactory;

    protected $table = 'aktivitas_mahasiswas';

    protected $fillable = [
        'mahasiswa_id',
        'jenis_aktivitas_id',
        'nama_kegiatan',
        'divalidasi',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'divalidasi' => 'boolean',
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
     * Get the jenis aktivitas referensi.
     *
     * @return BelongsTo<ReferensiBiodata, $this>
     */
    public function jenisAktivitas(): BelongsTo
    {
        return $this->belongsTo(ReferensiBiodata::class, 'jenis_aktivitas_id');
    }
}
