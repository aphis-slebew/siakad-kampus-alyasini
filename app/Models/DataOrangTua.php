<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataOrangTua extends Model
{
    use HasFactory;

    protected $table = 'data_orang_tuas';

    protected $fillable = [
        'mahasiswa_id',
        'nama_ayah',
        'nama_ibu',
        'pekerjaan_ayah_referensi_id',
        'pekerjaan_ibu_referensi_id',
        'penghasilan_ortu_referensi_id',
        'no_hp_kontak_darurat',
    ];

    /**
     * Get the mahasiswa that owns the parent data.
     *
     * @return BelongsTo<Mahasiswa, $this>
     */
    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    /**
     * Get the pekerjaan ayah referensi.
     *
     * @return BelongsTo<ReferensiBiodata, $this>
     */
    public function pekerjaanAyah(): BelongsTo
    {
        return $this->belongsTo(ReferensiBiodata::class, 'pekerjaan_ayah_referensi_id');
    }

    /**
     * Get the pekerjaan ibu referensi.
     *
     * @return BelongsTo<ReferensiBiodata, $this>
     */
    public function pekerjaanIbu(): BelongsTo
    {
        return $this->belongsTo(ReferensiBiodata::class, 'pekerjaan_ibu_referensi_id');
    }

    /**
     * Get the penghasilan ortu referensi.
     *
     * @return BelongsTo<ReferensiBiodata, $this>
     */
    public function penghasilanOrtu(): BelongsTo
    {
        return $this->belongsTo(ReferensiBiodata::class, 'penghasilan_ortu_referensi_id');
    }
}
