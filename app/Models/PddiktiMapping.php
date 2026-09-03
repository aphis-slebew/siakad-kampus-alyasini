<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PddiktiMapping extends Model
{
    use HasFactory;

    protected $table = 'pddikti_mappings';

    protected $fillable = [
        'local_table',
        'local_id',
        'pddikti_table',
        'pddikti_id',
    ];
}
