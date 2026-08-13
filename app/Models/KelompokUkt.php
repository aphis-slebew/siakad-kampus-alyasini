<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KelompokUkt extends Model
{
    use HasFactory;

    protected $table = 'kelompok_ukts';

    protected $fillable = [
        'program_studi_id',
        'nama',
        'nominal_per_semester',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'nominal_per_semester' => 'decimal:2',
        ];
    }

    /**
     * Get the program studi that owns the kelompok ukt.
     *
     * @return BelongsTo<ProgramStudi, $this>
     */
    public function programStudi(): BelongsTo
    {
        return $this->belongsTo(ProgramStudi::class, 'program_studi_id');
    }

    /**
     * Get the mahasiswa ukts for the kelompok.
     *
     * @return HasMany<MahasiswaUkt, $this>
     */
    public function mahasiswaUkts(): HasMany
    {
        return $this->hasMany(MahasiswaUkt::class, 'kelompok_ukt_id');
    }
}
