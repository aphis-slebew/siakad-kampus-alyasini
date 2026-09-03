<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SkalaNilai extends Model
{
    use HasFactory;

    protected $table = 'skala_nilais';

    protected $fillable = [
        'min_angka',
        'max_angka',
        'huruf',
        'bobot',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'min_angka' => 'decimal:2',
            'max_angka' => 'decimal:2',
            'bobot' => 'decimal:2',
        ];
    }
}
