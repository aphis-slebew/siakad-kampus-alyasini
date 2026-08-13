<?php

namespace App\Models;

use App\Traits\HasBlindIndex;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class CalonMahasiswa extends Model
{
    use HasBlindIndex, HasFactory, SoftDeletes;

    protected $table = 'calon_mahasiswas';

    protected $fillable = [
        'user_id',
        'gelombang_pendaftaran_id',
        'jalur_pendaftaran_id',
        'program_studi_pilihan_1_id',
        'program_studi_pilihan_2_id',
        'nama_lengkap',
        'nik',
        'nik_hash',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'alamat',
        'no_hp',
        'email',
        'asal_sekolah',
        'tahun_lulus_sekolah',
        'status_pendaftaran',
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
     * Get the user account for the calon mahasiswa.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the gelombang pendaftaran.
     *
     * @return BelongsTo<GelombangPendaftaran, $this>
     */
    public function gelombangPendaftaran(): BelongsTo
    {
        return $this->belongsTo(GelombangPendaftaran::class, 'gelombang_pendaftaran_id');
    }

    /**
     * Get the jalur pendaftaran.
     *
     * @return BelongsTo<JalurPendaftaran, $this>
     */
    public function jalurPendaftaran(): BelongsTo
    {
        return $this->belongsTo(JalurPendaftaran::class, 'jalur_pendaftaran_id');
    }

    /**
     * Get the first prodi choice.
     *
     * @return BelongsTo<ProgramStudi, $this>
     */
    public function prodiPilihan1(): BelongsTo
    {
        return $this->belongsTo(ProgramStudi::class, 'program_studi_pilihan_1_id');
    }

    /**
     * Get the second prodi choice.
     *
     * @return BelongsTo<ProgramStudi, $this>
     */
    public function prodiPilihan2(): BelongsTo
    {
        return $this->belongsTo(ProgramStudi::class, 'program_studi_pilihan_2_id');
    }

    /**
     * Get the berkas pendaftarans.
     *
     * @return HasMany<BerkasPendaftaran, $this>
     */
    public function berkasPendaftarans(): HasMany
    {
        return $this->hasMany(BerkasPendaftaran::class, 'calon_mahasiswa_id');
    }

    /**
     * Get the jadwal seleksis.
     *
     * @return HasMany<JadwalSeleksi, $this>
     */
    public function jadwalSeleksis(): HasMany
    {
        return $this->hasMany(JadwalSeleksi::class, 'calon_mahasiswa_id');
    }

    /**
     * Get the hasil seleksi.
     *
     * @return HasOne<HasilSeleksi, $this>
     */
    public function hasilSeleksi(): HasOne
    {
        return $this->hasOne(HasilSeleksi::class, 'calon_mahasiswa_id');
    }
}
