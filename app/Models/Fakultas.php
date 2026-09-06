<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Fakultas extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'fakultas';

    protected $fillable = [
        'dekan_dosen_id',
        'wakil_dekan_dosen_id',
        'wakil_dekan_1_dosen_id',
        'wakil_dekan_2_dosen_id',
        'wakil_dekan_3_dosen_id',
        'wakil_dekan_4_dosen_id',
        'ketua_gpmf_dosen_id',
        'kepala_tata_usaha_pegawai_id',
        'kode',
        'nama',
        'nama_en',
        'nama_singkat',
        'no_sk_pendirian',
        'tanggal_sk_pendirian',
        'file_sk_pendirian_path',
        'no_sk_izin_operasional',
        'tanggal_sk_izin_operasional',
        'file_sk_izin_operasional_path',
        'alamat',
        'telepon',
        'email',
        'website',
        'tahun_berdiri',
        'periode_berdiri',
        'status',
        'luas_m2',
        'dekan_nama',
        'dekan_gelar_depan',
        'dekan_gelar_belakang',
        'dekan_nidn',
        'wakil_dekan_1',
        'wakil_dekan_2',
        'wakil_dekan_3',
        'wakil_dekan_4',
        'visi',
        'misi',
        'id_feeder',
        'last_synced_at',
        'sync_status',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'dekan_nama_lengkap_bergelar',
        'wakil_dekan_1_nama_lengkap_bergelar',
        'wakil_dekan_2_nama_lengkap_bergelar',
        'wakil_dekan_3_nama_lengkap_bergelar',
        'wakil_dekan_4_nama_lengkap_bergelar',
        'ketua_gpmf_nama_lengkap_bergelar',
        'kepala_tata_usaha_nama_lengkap',
        'file_sk_pendirian_url',
        'file_sk_izin_operasional_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'dekan_dosen_id' => 'integer',
            'wakil_dekan_dosen_id' => 'integer',
            'wakil_dekan_1_dosen_id' => 'integer',
            'wakil_dekan_2_dosen_id' => 'integer',
            'wakil_dekan_3_dosen_id' => 'integer',
            'wakil_dekan_4_dosen_id' => 'integer',
            'ketua_gpmf_dosen_id' => 'integer',
            'kepala_tata_usaha_pegawai_id' => 'integer',
            'tahun_berdiri' => 'integer',
            'tanggal_sk_pendirian' => 'date',
            'tanggal_sk_izin_operasional' => 'date',
            'last_synced_at' => 'datetime',
        ];
    }

    /**
     * Get the dekan (dosen) for the fakultas.
     *
     * @return BelongsTo<Dosen, $this>
     */
    public function dekan(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'dekan_dosen_id');
    }

    /**
     * Get the wakil dekan (legacy/fallback) for the fakultas.
     *
     * @return BelongsTo<Dosen, $this>
     */
    public function wakilDekan(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'wakil_dekan_dosen_id');
    }

    /**
     * Get the Wakil Dekan I (Akademik).
     *
     * @return BelongsTo<Dosen, $this>
     */
    public function wakilDekan1(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'wakil_dekan_1_dosen_id');
    }

    /**
     * Get the Wakil Dekan II (Keuangan & Umum).
     *
     * @return BelongsTo<Dosen, $this>
     */
    public function wakilDekan2(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'wakil_dekan_2_dosen_id');
    }

    /**
     * Get the Wakil Dekan III (Kemahasiswaan & Alumni).
     *
     * @return BelongsTo<Dosen, $this>
     */
    public function wakilDekan3(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'wakil_dekan_3_dosen_id');
    }

    /**
     * Get the Wakil Dekan IV (Kerjasama & Riset).
     *
     * @return BelongsTo<Dosen, $this>
     */
    public function wakilDekan4(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'wakil_dekan_4_dosen_id');
    }

    /**
     * Get the Ketua Gugus Penjaminan Mutu Fakultas (GPMF).
     *
     * @return BelongsTo<Dosen, $this>
     */
    public function ketuaGpmf(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'ketua_gpmf_dosen_id');
    }

    /**
     * Get the Kepala Bagian Tata Usaha Fakultas (Pegawai).
     *
     * @return BelongsTo<Pegawai, $this>
     */
    public function kepalaTataUsaha(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class, 'kepala_tata_usaha_pegawai_id');
    }

    /**
     * Get all leadership history records.
     *
     * @return HasMany<RiwayatPimpinanFakultas, $this>
     */
    public function riwayatPimpinan(): HasMany
    {
        return $this->hasMany(RiwayatPimpinanFakultas::class, 'fakultas_id')->orderByDesc('periode_mulai');
    }

    /**
     * Get active leadership tenure records.
     *
     * @return HasMany<RiwayatPimpinanFakultas, $this>
     */
    public function pimpinanAktif(): HasMany
    {
        return $this->hasMany(RiwayatPimpinanFakultas::class, 'fakultas_id')->where('is_aktif', true);
    }

    /**
     * Get the program studis for the fakultas.
     *
     * @return HasMany<ProgramStudi, $this>
     */
    public function programStudis(): HasMany
    {
        return $this->hasMany(ProgramStudi::class, 'fakultas_id');
    }

    /**
     * Get all mahasiswas under this fakultas through program studis.
     *
     * @return HasManyThrough<Mahasiswa, ProgramStudi, $this>
     */
    public function mahasiswas(): HasManyThrough
    {
        return $this->hasManyThrough(Mahasiswa::class, ProgramStudi::class, 'fakultas_id', 'program_studi_id');
    }

    /**
     * Accessor for complete formal name with pre and post-nominal degrees of Dekan.
     */
    public function getDekanNamaLengkapBergelarAttribute(): ?string
    {
        if ($this->dekan_dosen_id) {
            $dosen = $this->relationLoaded('dekan') ? $this->dekan : $this->dekan()->first();
            if ($dosen) {
                return $dosen->nama_bergelar;
            }
        }

        $raw = trim((string) ($this->dekan_nama ?? ''));
        if ($raw === '') {
            return null;
        }

        $depan = trim((string) ($this->dekan_gelar_depan ?? ''));
        $belakang = trim((string) ($this->dekan_gelar_belakang ?? ''));

        if ($depan === '' && $belakang === '') {
            return $raw;
        }

        $name = $raw;
        if ($depan !== '' && ! str_starts_with(strtolower($name), strtolower($depan))) {
            $name = "{$depan} {$name}";
        }
        if ($belakang !== '' && ! str_ends_with(strtolower($name), strtolower($belakang))) {
            $name = "{$name}, {$belakang}";
        }

        return $name;
    }

    /**
     * Accessor for Wakil Dekan 1 name with fallback.
     */
    public function getWakilDekan1NamaLengkapBergelarAttribute(): ?string
    {
        if ($this->wakil_dekan_1_dosen_id) {
            $dosen = $this->relationLoaded('wakilDekan1') ? $this->wakilDekan1 : $this->wakilDekan1()->first();
            if ($dosen) {
                return $dosen->nama_bergelar;
            }
        }

        return $this->wakil_dekan_1 ?: null;
    }

    /**
     * Accessor for Wakil Dekan 2 name with fallback.
     */
    public function getWakilDekan2NamaLengkapBergelarAttribute(): ?string
    {
        if ($this->wakil_dekan_2_dosen_id) {
            $dosen = $this->relationLoaded('wakilDekan2') ? $this->wakilDekan2 : $this->wakilDekan2()->first();
            if ($dosen) {
                return $dosen->nama_bergelar;
            }
        }

        return $this->wakil_dekan_2 ?: null;
    }

    /**
     * Accessor for Wakil Dekan 3 name with fallback.
     */
    public function getWakilDekan3NamaLengkapBergelarAttribute(): ?string
    {
        if ($this->wakil_dekan_3_dosen_id) {
            $dosen = $this->relationLoaded('wakilDekan3') ? $this->wakilDekan3 : $this->wakilDekan3()->first();
            if ($dosen) {
                return $dosen->nama_bergelar;
            }
        }

        return $this->wakil_dekan_3 ?: null;
    }

    /**
     * Accessor for Wakil Dekan 4 name with fallback.
     */
    public function getWakilDekan4NamaLengkapBergelarAttribute(): ?string
    {
        if ($this->wakil_dekan_4_dosen_id) {
            $dosen = $this->relationLoaded('wakilDekan4') ? $this->wakilDekan4 : $this->wakilDekan4()->first();
            if ($dosen) {
                return $dosen->nama_bergelar;
            }
        }

        return $this->wakil_dekan_4 ?: null;
    }

    /**
     * Accessor for Ketua GPMF name with fallback.
     */
    public function getKetuaGpmfNamaLengkapBergelarAttribute(): ?string
    {
        if ($this->ketua_gpmf_dosen_id) {
            $dosen = $this->relationLoaded('ketuaGpmf') ? $this->ketuaGpmf : $this->ketuaGpmf()->first();
            if ($dosen) {
                return $dosen->nama_bergelar;
            }
        }

        return null;
    }

    /**
     * Accessor for Kepala Bagian Tata Usaha name with fallback.
     */
    public function getKepalaTataUsahaNamaLengkapAttribute(): ?string
    {
        if ($this->kepala_tata_usaha_pegawai_id) {
            $pegawai = $this->relationLoaded('kepalaTataUsaha') ? $this->kepalaTataUsaha : $this->kepalaTataUsaha()->first();
            if ($pegawai) {
                return $pegawai->nama_lengkap;
            }
        }

        return null;
    }

    /**
     * Public URL for SK Pendirian PDF.
     */
    public function getFileSkPendirianUrlAttribute(): ?string
    {
        return $this->file_sk_pendirian_path
            ? Storage::disk('public')->url($this->file_sk_pendirian_path)
            : null;
    }

    /**
     * Public URL for SK Izin Operasional PDF.
     */
    public function getFileSkIzinOperasionalUrlAttribute(): ?string
    {
        return $this->file_sk_izin_operasional_path
            ? Storage::disk('public')->url($this->file_sk_izin_operasional_path)
            : null;
    }
}
