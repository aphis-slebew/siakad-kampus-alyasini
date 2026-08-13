<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pembayaran extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pembayarans';

    protected $fillable = [
        'tagihan_id',
        'tanggal_bayar',
        'nominal_dibayar',
        'metode',
        'bukti_file_path',
        'status_verifikasi',
        'diverifikasi_oleh_user_id',
        'diverifikasi_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal_bayar' => 'date',
            'nominal_dibayar' => 'decimal:2',
            'diverifikasi_at' => 'datetime',
        ];
    }

    /**
     * Get the tagihan that owns the pembayaran.
     *
     * @return BelongsTo<Tagihan, $this>
     */
    public function tagihan(): BelongsTo
    {
        return $this->belongsTo(Tagihan::class, 'tagihan_id');
    }

    /**
     * Get the user who verified the payment.
     *
     * @return BelongsTo<User, $this>
     */
    public function diverifikasiOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diverifikasi_oleh_user_id');
    }
}
