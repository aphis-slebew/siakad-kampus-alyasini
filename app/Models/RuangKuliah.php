<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RuangKuliah extends Model
{
    use HasFactory;

    protected $table = 'ruang_kuliahs';

    protected $fillable = [
        'kode',
        'nama',
        'kapasitas',
    ];

    /**
     * Get the jadwal perkuliahans for the room.
     *
     * @return HasMany<JadwalPerkuliahan, $this>
     */
    public function jadwalPerkuliahans(): HasMany
    {
        return $this->hasMany(JadwalPerkuliahan::class, 'ruang_kuliah_id');
    }
}
