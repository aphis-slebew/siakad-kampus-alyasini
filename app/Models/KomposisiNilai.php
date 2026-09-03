<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KomposisiNilai extends Model
{
    use HasFactory;

    protected $table = 'komposisi_nilais';

    protected $fillable = [
        'kelas_kuliah_id',
        'komponen',
        'bobot_persen',
    ];

    /**
     * Get the kelas kuliah that owns the grade composition.
     *
     * @return BelongsTo<KelasKuliah, $this>
     */
    public function kelasKuliah(): BelongsTo
    {
        return $this->belongsTo(KelasKuliah::class, 'kelas_kuliah_id');
    }
}
