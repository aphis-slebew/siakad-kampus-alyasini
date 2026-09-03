<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JadwalPerkuliahan extends Model
{
    use HasFactory;

    protected $table = 'jadwal_perkuliahans';

    protected $fillable = [
        'kelas_kuliah_id',
        'ruang_kuliah_id',
        'hari',
        'jam_mulai',
        'jam_selesai',
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
     * Get the ruang kuliah.
     *
     * @return BelongsTo<RuangKuliah, $this>
     */
    public function ruangKuliah(): BelongsTo
    {
        return $this->belongsTo(RuangKuliah::class, 'ruang_kuliah_id');
    }
}
