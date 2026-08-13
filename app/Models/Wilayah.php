<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wilayah extends Model
{
    use HasFactory;

    protected $table = 'wilayahs';

    protected $fillable = [
        'kode',
        'nama',
        'level',
        'parent_id',
        'pddikti_ref_id',
    ];

    /**
     * Get the parent wilayah.
     *
     * @return BelongsTo<Wilayah, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class, 'parent_id');
    }

    /**
     * Get the child wilayahs.
     *
     * @return HasMany<Wilayah, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(Wilayah::class, 'parent_id');
    }
}
