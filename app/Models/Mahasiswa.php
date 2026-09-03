<?php

namespace App\Models;

use App\Traits\HasBlindIndex;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mahasiswa extends Model
{
    use HasBlindIndex, HasFactory, SoftDeletes;

    protected $table = 'mahasiswas';

    protected $fillable = [
        'user_id',
        'calon_mahasiswa_id',
        'program_studi_id',
        'nim',
        'nama_lengkap',
        'nik',
        'nik_hash',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'agama_referensi_biodata_id',
        'alamat_ktp',
        'alamat_domisili',
        'no_hp',
        'email_pribadi',
        'foto_path',
        'tahun_masuk',
        'status_mahasiswa',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'nik' => 'encrypted',
        ];
    }

    /**
     * Get the user account for the mahasiswa.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the program studi for the mahasiswa.
     *
     * @return BelongsTo<ProgramStudi, $this>
     */
    public function programStudi(): BelongsTo
    {
        return $this->belongsTo(ProgramStudi::class, 'program_studi_id');
    }

    /**
     * Get the agama referensi for the mahasiswa.
     *
     * @return BelongsTo<ReferensiBiodata, $this>
     */
    public function agama(): BelongsTo
    {
        return $this->belongsTo(ReferensiBiodata::class, 'agama_referensi_biodata_id');
    }

    /**
     * Get the parent data for the mahasiswa.
     *
     * @return HasOne<DataOrangTua, $this>
     */
    public function dataOrangTua(): HasOne
    {
        return $this->hasOne(DataOrangTua::class, 'mahasiswa_id');
    }

    /**
     * Get the status akademik historis for the mahasiswa.
     *
     * @return HasMany<StatusAkademikHistoris, $this>
     */
    public function statusAkademikHistoris(): HasMany
    {
        return $this->hasMany(StatusAkademikHistoris::class, 'mahasiswa_id');
    }

    /**
     * Get the dosen walis for the mahasiswa.
     *
     * @return HasMany<DosenWali, $this>
     */
    public function dosenWalis(): HasMany
    {
        return $this->hasMany(DosenWali::class, 'mahasiswa_id');
    }

    /**
     * Get the skripsis for the mahasiswa.
     *
     * @return HasMany<Skripsi, $this>
     */
    public function skripsis(): HasMany
    {
        return $this->hasMany(Skripsi::class, 'mahasiswa_id');
    }

    /**
     * Get the yudisiums for the mahasiswa.
     *
     * @return HasMany<Yudisium, $this>
     */
    public function yudisiums(): HasMany
    {
        return $this->hasMany(Yudisium::class, 'mahasiswa_id');
    }

    /**
     * Get the KRS records for the mahasiswa.
     *
     * @return HasMany<Krs, $this>
     */
    public function krss(): HasMany
    {
        return $this->hasMany(Krs::class, 'mahasiswa_id');
    }

    /**
     * Get the tagihan records for the mahasiswa.
     *
     * @return HasMany<Tagihan, $this>
     */
    public function tagihans(): HasMany
    {
        return $this->hasMany(Tagihan::class, 'mahasiswa_id');
    }

    /**
     * Get the presensi records for the mahasiswa.
     *
     * @return HasMany<Presensi, $this>
     */
    public function presensis(): HasMany
    {
        return $this->hasMany(Presensi::class, 'mahasiswa_id');
    }

    /**
     * Get the beasiswa mahasiswa records.
     *
     * @return HasMany<BeasiswaMahasiswa, $this>
     */
    public function beasiswaMahasiswas(): HasMany
    {
        return $this->hasMany(BeasiswaMahasiswa::class, 'mahasiswa_id');
    }
}
