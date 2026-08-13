<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DosenPengajar extends Model
{
    use HasFactory;

    protected $table = 'dosen_pengajars';

    protected $fillable = [
        'kelas_kuliah_id',
        'dosen_id',
        'peran',
    ];

    /**
     * Get the kelas kuliah.
     *
     * @return BelongsTo<KelasKuliah, $this>
     */
    public function kelasKuliah(): BelongsTo
    {
        return $this->belongsTo(KelasKuliah::class, 'kelas_kuliah_id');
    }

    /**
     * Get the dosen.
     *
     * @return BelongsTo<Dosen, $this>
     */
    public function dosen(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'dosen_id');
    }
}
