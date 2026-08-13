<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JadwalSeleksi extends Model
{
    use HasFactory;

    protected $table = 'jadwal_seleksis';

    protected $fillable = [
        'calon_mahasiswa_id',
        'jenis_tes',
        'tanggal',
        'lokasi_atau_link',
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
     * Get the calon mahasiswa.
     *
     * @return BelongsTo<CalonMahasiswa, $this>
     */
    public function calonMahasiswa(): BelongsTo
    {
        return $this->belongsTo(CalonMahasiswa::class, 'calon_mahasiswa_id');
    }
}
