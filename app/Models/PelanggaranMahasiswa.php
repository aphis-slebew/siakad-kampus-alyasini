<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PelanggaranMahasiswa extends Model
{
    use HasFactory;

    protected $table = 'pelanggaran_mahasiswas';

    protected $fillable = [
        'mahasiswa_id',
        'jenis_pelanggaran_id',
        'sanksi_id',
        'tanggal',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
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
     * Get the jenis pelanggaran referensi.
     *
     * @return BelongsTo<ReferensiBiodata, $this>
     */
    public function jenisPelanggaran(): BelongsTo
    {
        return $this->belongsTo(ReferensiBiodata::class, 'jenis_pelanggaran_id');
    }

    /**
     * Get the sanksi referensi.
     *
     * @return BelongsTo<ReferensiBiodata, $this>
     */
    public function sanksi(): BelongsTo
    {
        return $this->belongsTo(ReferensiBiodata::class, 'sanksi_id');
    }
}
