<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UnitKerja extends Model
{
    use HasFactory;

    protected $table = 'unit_kerjas';

    protected $fillable = [
        'kode',
        'nama',
    ];

    /**
     * Get the pegawais for the unit kerja.
     *
     * @return HasMany<Pegawai, $this>
     */
    public function pegawais(): HasMany
    {
        return $this->hasMany(Pegawai::class, 'unit_kerja_id');
    }
}
