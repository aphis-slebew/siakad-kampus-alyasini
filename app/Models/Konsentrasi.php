<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Konsentrasi extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'konsentrasis';

    protected $fillable = [
        'program_studi_id',
        'nama',
    ];

    /**
     * Get the program studi that owns the konsentrasi.
     *
     * @return BelongsTo<ProgramStudi, $this>
     */
    public function programStudi(): BelongsTo
    {
        return $this->belongsTo(ProgramStudi::class, 'program_studi_id');
    }
}
