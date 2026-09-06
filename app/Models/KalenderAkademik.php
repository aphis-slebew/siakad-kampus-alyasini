<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KalenderAkademik extends Model
{
    use HasFactory;

    protected $table = 'kalender_akademiks';

    public const TIPE_PEMBAYARAN_UKT = 'pembayaran_ukt';

    public const TIPE_REGISTRASI_ULANG = 'registrasi_ulang';

    public const TIPE_KRS = 'krs';

    public const TIPE_PERWALIAN_KRS = 'perwalian_krs';

    public const TIPE_PERKULIAHAN = 'perkuliahan';

    public const TIPE_UTS = 'uts';

    public const TIPE_UAS = 'uas';

    public const TIPE_INPUT_NILAI = 'input_nilai';

    public const TIPE_YUDISIUM = 'yudisium';

    public const TIPE_KKN_PKL = 'kkn_pkl';

    public const TIPE_LIBUR_SEMESTER = 'libur_semester';

    public const TIPE_LAINNYA = 'lainnya';

    protected $fillable = [
        'tahun_ajaran_id',
        'kegiatan',
        'tipe_kegiatan',
        'mulai',
        'selesai',
        'deskripsi',
        'is_published',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'mulai' => 'date',
            'selesai' => 'date',
            'is_published' => 'boolean',
        ];
    }

    /**
     * Scope for published events.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope by event type.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeTipe(Builder $query, string $tipe): Builder
    {
        return $query->where('tipe_kegiatan', $tipe);
    }

    /**
     * Check if this event is currently active on a specific date.
     */
    public function isActiveAt(?Carbon $date = null): bool
    {
        $checkDate = ($date ?? Carbon::today())->toDateString();
        $startDate = $this->mulai?->toDateString();
        $endDate = $this->selesai?->toDateString();

        return $startDate !== null && $endDate !== null && $checkDate >= $startDate && $checkDate <= $endDate;
    }

    /**
     * Get status string: 'upcoming', 'active', or 'closed'.
     */
    public function getStatusAttribute(): string
    {
        $today = Carbon::today()->toDateString();
        $startDate = $this->mulai?->toDateString();
        $endDate = $this->selesai?->toDateString();

        if ($startDate && $today < $startDate) {
            return 'upcoming';
        }

        if ($endDate && $today > $endDate) {
            return 'closed';
        }

        return 'active';
    }

    /**
     * Get the tahun ajaran that owns the kalender akademik.
     *
     * @return BelongsTo<TahunAjaran, $this>
     */
    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }
}
