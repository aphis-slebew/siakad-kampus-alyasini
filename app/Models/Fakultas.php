<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Fakultas extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'fakultas';

    protected $fillable = [
        'kode',
        'nama',
        'nama_en',
        'nama_singkat',
        'alamat',
        'telepon',
        'tahun_berdiri',
        'periode_berdiri',
        'status',
        'luas_m2',
        'dekan_nama',
        'dekan_nidn',
        'wakil_dekan_1',
        'wakil_dekan_2',
        'wakil_dekan_3',
        'wakil_dekan_4',
        'visi',
        'misi',
    ];

    /**
     * Get the program studis for the fakultas.
     *
     * @return HasMany<ProgramStudi, $this>
     */
    public function programStudis(): HasMany
    {
        return $this->hasMany(ProgramStudi::class, 'fakultas_id');
    }
}
