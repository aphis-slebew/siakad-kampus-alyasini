<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferensiBiodata extends Model
{
    use HasFactory;

    protected $table = 'referensi_biodatas';

    protected $fillable = [
        'tipe',
        'nama',
        'pddikti_ref_id',
    ];
}
