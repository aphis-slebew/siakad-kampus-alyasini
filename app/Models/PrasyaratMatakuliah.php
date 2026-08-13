<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrasyaratMatakuliah extends Model
{
    use HasFactory;

    protected $table = 'prasyarat_matakuliahs';

    protected $fillable = [
        'matakuliah_id',
        'matakuliah_prasyarat_id',
        'minimal_nilai',
    ];

    /**
     * Get the matakuliah.
     *
     * @return BelongsTo<Matakuliah, $this>
     */
    public function matakuliah(): BelongsTo
    {
        return $this->belongsTo(Matakuliah::class, 'matakuliah_id');
    }

    /**
     * Get the prasyarat matakuliah.
     *
     * @return BelongsTo<Matakuliah, $this>
     */
    public function matakuliahPrasyarat(): BelongsTo
    {
        return $this->belongsTo(Matakuliah::class, 'matakuliah_prasyarat_id');
    }
}
