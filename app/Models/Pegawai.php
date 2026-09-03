<?php

namespace App\Models;

use App\Traits\HasBlindIndex;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pegawai extends Model
{
    use HasBlindIndex, HasFactory, SoftDeletes;

    protected $table = 'pegawais';

    protected $fillable = [
        'user_id',
        'unit_kerja_id',
        'nip_internal',
        'nama_lengkap',
        'nik',
        'nik_hash',

        'tanggal_lahir',
        'jenis_kelamin',
        'alamat',
        'no_hp',
        'jabatan_struktural',
        'status_kepegawaian',
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
            'nik' => 'encrypted',
        ];
    }

    /**
     * Get the user account for the pegawai.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the unit kerja for the pegawai.
     *
     * @return BelongsTo<UnitKerja, $this>
     */
    public function unitKerja(): BelongsTo
    {
        return $this->belongsTo(UnitKerja::class, 'unit_kerja_id');
    }
}
