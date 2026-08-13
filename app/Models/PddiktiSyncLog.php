<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PddiktiSyncLog extends Model
{
    use HasFactory;

    protected $table = 'pddikti_sync_logs';

    protected $fillable = [
        'table_name',
        'record_id',
        'action',
        'status',
        'pddikti_id',
        'error_message',
        'synced_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'synced_at' => 'datetime',
        ];
    }
}
