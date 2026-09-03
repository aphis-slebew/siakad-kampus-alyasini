<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BimbinganProposal extends Model
{
    use HasFactory;

    protected $table = 'bimbingan_proposals';

    protected $fillable = [
        'proposal_skripsi_id',
        'tanggal',
        'catatan',
        'divalidasi',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'divalidasi' => 'boolean',
        ];
    }

    /**
     * Get the proposal skripsi.
     *
     * @return BelongsTo<ProposalSkripsi, $this>
     */
    public function proposalSkripsi(): BelongsTo
    {
        return $this->belongsTo(ProposalSkripsi::class, 'proposal_skripsi_id');
    }
}
