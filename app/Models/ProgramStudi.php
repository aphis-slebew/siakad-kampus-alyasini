<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProgramStudi extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'program_studis';

    protected $fillable = [
        'fakultas_id',
        'kode',
        'nama',
        'jenjang',
        'sks_lulus_min',
    ];

    /**
     * Get the fakultas that owns the program studi.
     *
     * @return BelongsTo<Fakultas, $this>
     */
    public function fakultas(): BelongsTo
    {
        return $this->belongsTo(Fakultas::class, 'fakultas_id');
    }

    /**
     * Get the konsentrasis for the program studi.
     *
     * @return HasMany<Konsentrasi, $this>
     */
    public function konsentrasis(): HasMany
    {
        return $this->hasMany(Konsentrasi::class, 'program_studi_id');
    }
}
