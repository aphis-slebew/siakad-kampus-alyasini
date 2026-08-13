<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JurnalPerkuliahan extends Model
{
    use HasFactory;

    protected $table = 'jurnal_perkuliahans';

    protected $fillable = [
        'kelas_kuliah_id',
        'tanggal',
        'materi',
        'dosen_pengajar_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
        ];
    }

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
     * Get the dosen pengajar.
     *
     * @return BelongsTo<DosenPengajar, $this>
     */
    public function dosenPengajar(): BelongsTo
    {
        return $this->belongsTo(DosenPengajar::class, 'dosen_pengajar_id');
    }

    /**
     * Get the presensis for the journal session.
     *
     * @return HasMany<Presensi, $this>
     */
    public function presensis(): HasMany
    {
        return $this->hasMany(Presensi::class, 'jurnal_perkuliahan_id');
    }
}
