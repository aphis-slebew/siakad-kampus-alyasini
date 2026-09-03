<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EkivalensiMatakuliah extends Model
{
    use HasFactory;

    protected $table = 'ekivalensi_matakuliahs';

    protected $fillable = [
        'matakuliah_lama_id',
        'matakuliah_baru_id',
    ];

    /**
     * Get the old matakuliah.
     *
     * @return BelongsTo<Matakuliah, $this>
     */
    public function matakuliahLama(): BelongsTo
    {
        return $this->belongsTo(Matakuliah::class, 'matakuliah_lama_id');
    }

    /**
     * Get the new matakuliah.
     *
     * @return BelongsTo<Matakuliah, $this>
     */
    public function matakuliahBaru(): BelongsTo
    {
        return $this->belongsTo(Matakuliah::class, 'matakuliah_baru_id');
    }
}
