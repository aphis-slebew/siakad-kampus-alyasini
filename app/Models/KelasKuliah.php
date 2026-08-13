<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KelasKuliah extends Model
{
    use HasFactory;

    protected $table = 'kelas_kuliahs';

    protected $fillable = [
        'kurikulum_matakuliah_id',
        'tahun_ajaran_id',
        'nama_kelas',
        'kuota',
    ];

    /**
     * Get the kurikulum matakuliah.
     *
     * @return BelongsTo<KurikulumMatakuliah, $this>
     */
    public function kurikulumMatakuliah(): BelongsTo
    {
        return $this->belongsTo(KurikulumMatakuliah::class, 'kurikulum_matakuliah_id');
    }

    /**
     * Get the tahun ajaran.
     *
     * @return BelongsTo<TahunAjaran, $this>
     */
    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }

    /**
     * Get the dosen pengajars for the class.
     *
     * @return HasMany<DosenPengajar, $this>
     */
    public function dosenPengajars(): HasMany
    {
        return $this->hasMany(DosenPengajar::class, 'kelas_kuliah_id');
    }

    /**
     * Get the jadwal perkuliahans for the class.
     *
     * @return HasMany<JadwalPerkuliahan, $this>
     */
    public function jadwalPerkuliahans(): HasMany
    {
        return $this->hasMany(JadwalPerkuliahan::class, 'kelas_kuliah_id');
    }

    /**
     * Get the krs details for the class.
     *
     * @return HasMany<KrsDetail, $this>
     */
    public function krsDetails(): HasMany
    {
        return $this->hasMany(KrsDetail::class, 'kelas_kuliah_id');
    }

    /**
     * Check if class is complete with assigned lecturer and scheduled room.
     * TODO: Langkah 6 - Filter hanya kelas dengan isReadyForKrs() == true yang muncul di pilihan KRS mahasiswa.
     */
    public function isReadyForKrs(): bool
    {
        $hasDosen = $this->dosenPengajars()->exists();
        $hasJadwal = $this->jadwalPerkuliahans()->whereNotNull('ruang_kuliah_id')->exists();

        return $hasDosen && $hasJadwal;
    }
}
