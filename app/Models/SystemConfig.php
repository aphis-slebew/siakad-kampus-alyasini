<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemConfig extends Model
{
    use HasFactory;

    protected $table = 'system_configs';

    protected $fillable = [
        'key',
        'value',
        'description',
    ];

    /**
     * Get config value by key with default fallback.
     */
    public static function getValue(string $key, string $default = ''): string
    {
        return static::where('key', $key)->value('value') ?? $default;
    }
}
