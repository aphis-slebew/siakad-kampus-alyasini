<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KomponenBiaya extends Model
{
    use HasFactory;

    protected $table = 'komponen_biayas';

    protected $fillable = [
        'kode',
        'nama',
        'kategori',
        'program_studi_id',
        'angkatan',
        'nominal',
        'is_active',
        'keterangan',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'nominal' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the program studi for this fee component (optional).
     *
     * @return BelongsTo<ProgramStudi, $this>
     */
    public function programStudi(): BelongsTo
    {
        return $this->belongsTo(ProgramStudi::class, 'program_studi_id');
    }
}
