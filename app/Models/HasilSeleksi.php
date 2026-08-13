<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HasilSeleksi extends Model
{
    use HasFactory;

    protected $table = 'hasil_seleksis';

    protected $fillable = [
        'calon_mahasiswa_id',
        'nilai_tes',
        'status',
        'catatan',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'nilai_tes' => 'decimal:2',
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
