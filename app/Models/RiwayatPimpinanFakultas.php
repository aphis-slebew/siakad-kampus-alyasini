<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class RiwayatPimpinanFakultas extends Model
{
    use HasFactory;

    protected $table = 'riwayat_pimpinan_fakultas';

    public const JABATAN_DEKAN = 'dekan';

    public const JABATAN_WADEK_1 = 'wakil_dekan_1';

    public const JABATAN_WADEK_2 = 'wakil_dekan_2';

    public const JABATAN_WADEK_3 = 'wakil_dekan_3';

    public const JABATAN_WADEK_4 = 'wakil_dekan_4';

    public const JABATAN_KETUA_GPMF = 'ketua_gpmf';

    public const JABATAN_LABELS = [
        self::JABATAN_DEKAN => 'Dekan',
        self::JABATAN_WADEK_1 => 'Wakil Dekan I (Akademik)',
        self::JABATAN_WADEK_2 => 'Wakil Dekan II (Keuangan & Umum)',
        self::JABATAN_WADEK_3 => 'Wakil Dekan III (Kemahasiswaan)',
        self::JABATAN_WADEK_4 => 'Wakil Dekan IV (Kerjasama & Riset)',
        self::JABATAN_KETUA_GPMF => 'Ketua Gugus Penjaminan Mutu Fakultas (GPMF)',
    ];

    protected $fillable = [
        'fakultas_id',
        'dosen_id',
        'jabatan',
        'periode_mulai',
        'periode_selesai',
        'no_sk_pelantikan',
        'file_sk_pelantikan_path',
        'is_aktif',
    ];

    protected $appends = [
        'file_sk_pelantikan_url',
        'jabatan_label',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'periode_mulai' => 'date',
            'periode_selesai' => 'date',
            'is_aktif' => 'boolean',
        ];
    }

    /**
     * Relation to Fakultas.
     *
     * @return BelongsTo<Fakultas, $this>
     */
    public function fakultas(): BelongsTo
    {
        return $this->belongsTo(Fakultas::class, 'fakultas_id');
    }

    /**
     * Relation to Dosen.
     *
     * @return BelongsTo<Dosen, $this>
     */
    public function dosen(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'dosen_id');
    }

    /**
     * Scope only active leadership records.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeAktif(Builder $query): Builder
    {
        return $query->where('is_aktif', true);
    }

    /**
     * Scope only dekan records.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeDekanOnly(Builder $query): Builder
    {
        return $query->where('jabatan', self::JABATAN_DEKAN);
    }

    /**
     * Get public URL for appointment decree scan (SK Pelantikan).
     */
    public function getFileSkPelantikanUrlAttribute(): ?string
    {
        return $this->file_sk_pelantikan_path
            ? Storage::disk('public')->url($this->file_sk_pelantikan_path)
            : null;
    }

    /**
     * Human-readable label for the leadership position.
     */
    public function getJabatanLabelAttribute(): string
    {
        return self::JABATAN_LABELS[$this->jabatan] ?? ucfirst(str_replace('_', ' ', $this->jabatan));
    }
}
