<?php

namespace App\Models;

use App\Traits\HasBlindIndex;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dosen extends Model
{
    use HasBlindIndex, HasFactory, SoftDeletes;

    protected $table = 'dosens';

    protected $fillable = [
        'user_id',
        'program_studi_id',
        'nidn',
        'nidn_hash',
        'nuptk',
        'niy_nip',
        'gelar_depan',
        'nama_lengkap',
        'gelar_belakang',
        'nik',
        'nik_hash',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'alamat',
        'no_hp',
        'email_pribadi',
        'jabatan_fungsional_saat_ini',
        'pangkat_golongan',
        'sk_kepangkatan_path',
        'status_kepegawaian',
        'sertifikasi_pendidik',
        'foto_path',
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
            'sertifikasi_pendidik' => 'boolean',
            'nik' => 'encrypted',
            'nidn' => 'encrypted',
        ];
    }

    /**
     * Get the user account for the dosen.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the homebase program studi for the dosen.
     *
     * @return BelongsTo<ProgramStudi, $this>
     */
    public function programStudi(): BelongsTo
    {
        return $this->belongsTo(ProgramStudi::class, 'program_studi_id');
    }

    /**
     * Get the riwayat pendidikans for the dosen.
     *
     * @return HasMany<RiwayatPendidikanDosen, $this>
     */
    public function riwayatPendidikans(): HasMany
    {
        return $this->hasMany(RiwayatPendidikanDosen::class, 'dosen_id');
    }

    /**
     * Get the riwayat jabatan fungsionals for the dosen.
     *
     * @return HasMany<RiwayatJabatanFungsional, $this>
     */
    public function riwayatJabatanFungsionals(): HasMany
    {
        return $this->hasMany(RiwayatJabatanFungsional::class, 'dosen_id');
    }
}
