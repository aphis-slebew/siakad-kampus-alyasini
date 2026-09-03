<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PerguruanTinggi extends Model
{
    use HasFactory;

    protected $table = 'perguruan_tinggis';

    protected $fillable = [
        'kode_unit',
        'nama_unit',
        'nama_unit_en',
        'nama_singkat',
        'jenis_perguruan_tinggi',
        'lembaga_naungan',
        'periode_berdiri',
        'no_sk_pendirian',
        'tanggal_sk_pendirian',
        'ketua_nama',
        'ketua_nidn',
        'wakil_ketua_1',
        'wakil_ketua_2',
        'wakil_ketua_3',
        'wakil_ketua_4',
        'lembaga_akreditasi',
        'peringkat_akreditasi',
        'nilai_akreditasi',
        'no_sk_akreditasi',
        'tanggal_sk_akreditasi',
        'tanggal_berlaku_akreditasi',
        'tanggal_berakhir_akreditasi',
        'file_sertifikat_akreditasi',
        'visi',
        'misi',
        'alamat',
        'telepon',
        'email',
        'website',
        'fax',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal_sk_pendirian' => 'date',
            'tanggal_sk_akreditasi' => 'date',
            'tanggal_berlaku_akreditasi' => 'date',
            'tanggal_berakhir_akreditasi' => 'date',
        ];
    }
}
