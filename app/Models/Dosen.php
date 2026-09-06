<?php

namespace App\Models;

use App\Traits\HasBlindIndex;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

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
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'nama_bergelar',
        'foto_url',
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
     * Get the formatted full name including academic titles if not already present.
     */
    public function getNamaBergelarAttribute(): string
    {
        $nama = trim($this->nama_lengkap ?? '');
        $depan = trim($this->gelar_depan ?? '');
        $belakang = trim($this->gelar_belakang ?? '');

        if ($depan !== '') {
            $depanClean = rtrim($depan, '.');
            if (! preg_match('/^'.preg_quote($depanClean, '/').'\b/i', $nama)) {
                $nama = $depan.' '.$nama;
            }
        }

        if ($belakang !== '') {
            $belakangClean = rtrim($belakang, '.');
            if (! preg_match('/'.preg_quote($belakangClean, '/').'\.?$/i', $nama)) {
                $nama = rtrim($nama, ', ').', '.$belakang;
            }
        }

        return $nama;
    }

    /**
     * Alias for nama_bergelar.
     */
    public function getNamaLengkapBergelarAttribute(): string
    {
        return $this->nama_bergelar;
    }

    /**
     * Get the public URL for the dosen profile photo.
     */
    public function getFotoUrlAttribute(): ?string
    {
        return $this->foto_path ? Storage::disk('public')->url($this->foto_path) : null;
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

    /**
     * Get the perwalian assignments for the dosen (dosen wali).
     *
     * @return HasMany<DosenWali, $this>
     */
    public function dosenWalis(): HasMany
    {
        return $this->hasMany(DosenWali::class, 'dosen_id');
    }

    /**
     * Get the class teaching assignments for the dosen.
     *
     * @return HasMany<DosenPengajar, $this>
     */
    public function dosenPengajars(): HasMany
    {
        return $this->hasMany(DosenPengajar::class, 'dosen_id');
    }

    /**
     * Get the thesis supervisions for the dosen.
     *
     * @return HasMany<Skripsi, $this>
     */
    public function skripsis(): HasMany
    {
        return $this->hasMany(Skripsi::class, 'dosen_pembimbing_id');
    }

    /**
     * Get the thesis proposal supervisions for the dosen.
     *
     * @return HasMany<ProposalSkripsi, $this>
     */
    public function proposalSkripsis(): HasMany
    {
        return $this->hasMany(ProposalSkripsi::class, 'dosen_pembimbing_id');
    }
}
