<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PerguruanTinggi extends Model
{
    use HasFactory;

    protected $table = 'perguruan_tinggis';

    public const JENIS_PT = [
        'Universitas',
        'Institut',
        'Sekolah Tinggi',
        'Politeknik',
        'Akademi',
        'Akademi Komunitas',
        'Lainnya',
    ];

    public const STATUS_MILIK = [
        'Swasta',
        'Negeri',
    ];

    public const LEMBAGA_AKREDITASI = [
        'BAN-PT',
        'LAMDIK',
        'LAMEMBA',
        'LAM-PTKes',
        'LAM INFOKOM',
        'LAM SAMA',
        'LAM TEKNIK',
        'Lainnya',
    ];

    public const PERINGKAT_AKREDITASI = [
        'Unggul',
        'Baik Sekali',
        'Baik',
        'A',
        'B',
        'C',
        'Terakreditasi Sementara',
        'Tidak Terakreditasi',
        'Lainnya',
    ];

    protected $fillable = [
        'kode_unit',
        'nama_unit',
        'nama_unit_en',
        'nama_singkat',
        'jenis_perguruan_tinggi',
        'status_milik',
        'lembaga_naungan',
        'periode_berdiri',
        'no_sk_pendirian',
        'tanggal_sk_pendirian',
        'no_sk_operasional',
        'tanggal_sk_operasional',

        // Pejabat Perguruan Tinggi
        'ketua_dosen_id',
        'wakil_ketua_1_dosen_id',
        'ketua_nama',
        'ketua_nidn',
        'ketua_gelar_depan',
        'ketua_gelar_belakang',
        'ketua_nip_niy',
        'wakil_ketua_1',
        'wakil_ketua_1_nama',
        'wakil_ketua_1_nidn',
        'wakil_ketua_1_gelar_depan',
        'wakil_ketua_1_gelar_belakang',
        'wakil_ketua_2',
        'wakil_ketua_3',
        'wakil_ketua_4',

        // Akreditasi Institusi
        'lembaga_akreditasi',
        'peringkat_akreditasi',
        'nilai_akreditasi',
        'no_sk_akreditasi',
        'tanggal_sk_akreditasi',
        'tanggal_berlaku_akreditasi',
        'tanggal_berakhir_akreditasi',
        'file_sertifikat_akreditasi',

        // Visi, Misi & Alamat
        'visi',
        'misi',
        'alamat',
        'jalan',
        'rt_rw',
        'dusun',
        'kelurahan',
        'kecamatan',
        'kota_kabupaten',
        'provinsi',
        'kode_pos',

        // Kontak
        'telepon',
        'telepon_2',
        'email',
        'website',
        'fax',

        // Geofencing Presensi
        'lintang',
        'bujur',
        'radius_presensi',

        // Branding
        'logo_path',
        'logo_kop_path',
        'stempel_path',
        'ttd_ketua_path',
    ];

    protected $appends = [
        'logo_url',
        'logo_kop_url',
        'stempel_url',
        'ttd_ketua_url',
        'file_sertifikat_akreditasi_url',
        'ketua_nama_lengkap_bergelar',
        'wakil_ketua_1_nama_lengkap_bergelar',
        'alamat_lengkap',
        'status_akreditasi_badge',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'ketua_dosen_id' => 'integer',
            'wakil_ketua_1_dosen_id' => 'integer',
            'tanggal_sk_pendirian' => 'date',
            'tanggal_sk_operasional' => 'date',
            'tanggal_sk_akreditasi' => 'date',
            'tanggal_berlaku_akreditasi' => 'date',
            'tanggal_berakhir_akreditasi' => 'date',
            'lintang' => 'decimal:7',
            'bujur' => 'decimal:7',
            'radius_presensi' => 'integer',
        ];
    }

    /**
     * Get the Dosen model for Ketua / Rektor.
     *
     * @return BelongsTo<Dosen, $this>
     */
    public function ketuaDosen(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'ketua_dosen_id');
    }

    /**
     * Get the Dosen model for Wakil Ketua 1 (Bidang Akademik).
     *
     * @return BelongsTo<Dosen, $this>
     */
    public function wakilKetua1Dosen(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'wakil_ketua_1_dosen_id');
    }

    /**
     * Accessor for logo URL.
     */
    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo_path ? Storage::disk('public')->url($this->logo_path) : null;
    }

    /**
     * Accessor for logo kop URL (fallback to logoUrl).
     */
    public function getLogoKopUrlAttribute(): ?string
    {
        if ($this->logo_kop_path) {
            return Storage::disk('public')->url($this->logo_kop_path);
        }

        return $this->logo_url;
    }

    /**
     * Accessor for stempel URL.
     */
    public function getStempelUrlAttribute(): ?string
    {
        return $this->stempel_path ? Storage::disk('public')->url($this->stempel_path) : null;
    }

    /**
     * Accessor for ketua digital signature URL.
     */
    public function getTtdKetuaUrlAttribute(): ?string
    {
        return $this->ttd_ketua_path ? Storage::disk('public')->url($this->ttd_ketua_path) : null;
    }

    /**
     * Accessor for accreditation certificate file URL.
     */
    public function getFileSertifikatAkreditasiUrlAttribute(): ?string
    {
        return $this->file_sertifikat_akreditasi ? Storage::disk('public')->url($this->file_sertifikat_akreditasi) : null;
    }

    /**
     * Accessor for complete formal name with pre and post-nominal degrees of Ketua.
     */
    public function getKetuaNamaLengkapBergelarAttribute(): ?string
    {
        if ($this->ketua_dosen_id) {
            $dosen = $this->relationLoaded('ketuaDosen') ? $this->ketuaDosen : $this->ketuaDosen()->first();
            if ($dosen) {
                return $dosen->nama_bergelar;
            }
        }

        $raw = trim((string) ($this->ketua_nama ?? ''));
        if ($raw === '') {
            return null;
        }

        $depan = trim((string) ($this->ketua_gelar_depan ?? ''));
        $belakang = trim((string) ($this->ketua_gelar_belakang ?? ''));

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
     * Accessor for complete formal name of Wakil Ketua 1 (Bidang Akademik).
     */
    public function getWakilKetua1NamaLengkapBergelarAttribute(): ?string
    {
        if ($this->wakil_ketua_1_dosen_id) {
            $dosen = $this->relationLoaded('wakilKetua1Dosen') ? $this->wakilKetua1Dosen : $this->wakilKetua1Dosen()->first();
            if ($dosen) {
                return $dosen->nama_bergelar;
            }
        }

        $raw = trim((string) ($this->wakil_ketua_1_nama ?: $this->wakil_ketua_1 ?: ''));
        if ($raw === '') {
            return null;
        }

        if (str_contains($raw, ' - ')) {
            $parts = explode(' - ', $raw, 2);
            $raw = trim($parts[1] ?? $raw);
        }

        $depan = trim((string) ($this->wakil_ketua_1_gelar_depan ?? ''));
        $belakang = trim((string) ($this->wakil_ketua_1_gelar_belakang ?? ''));

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
     * Accessor for structured full address.
     */
    public function getAlamatLengkapAttribute(): string
    {
        $parts = array_filter([
            $this->jalan,
            $this->rt_rw ? "RT/RW {$this->rt_rw}" : null,
            $this->dusun ? "Dsn. {$this->dusun}" : null,
            $this->kelurahan ? "Kel./Desa {$this->kelurahan}" : null,
            $this->kecamatan ? "Kec. {$this->kecamatan}" : null,
            $this->kota_kabupaten,
            $this->provinsi,
            $this->kode_pos,
        ]);

        if (! empty($parts)) {
            return implode(', ', $parts);
        }

        return (string) ($this->alamat ?? '');
    }

    /**
     * Accessor for visual accreditation expiration status badge.
     *
     * @return array{status: 'aktif'|'akan_berakhir'|'kadaluarsa'|'tidak_ada', label: string, color: string, days_remaining: int|null}
     */
    public function getStatusAkreditasiBadgeAttribute(): array
    {
        if (! $this->tanggal_berakhir_akreditasi) {
            return [
                'status' => 'tidak_ada',
                'label' => 'Masa Berlaku Belum Diatur',
                'color' => 'slate',
                'days_remaining' => null,
            ];
        }

        $today = now()->startOfDay();
        $expiry = $this->tanggal_berakhir_akreditasi->startOfDay();
        $diffDays = (int) $today->diffInDays($expiry, false);

        if ($diffDays < 0) {
            return [
                'status' => 'kadaluarsa',
                'label' => 'Akreditasi Telah Kadaluarsa',
                'color' => 'rose',
                'days_remaining' => $diffDays,
            ];
        }

        if ($diffDays <= 180) {
            return [
                'status' => 'akan_berakhir',
                'label' => "Segera Berakhir ({$diffDays} hari lagi)",
                'color' => 'amber',
                'days_remaining' => $diffDays,
            ];
        }

        return [
            'status' => 'aktif',
            'label' => "Aktif ({$diffDays} hari lagi)",
            'color' => 'emerald',
            'days_remaining' => $diffDays,
        ];
    }
}
