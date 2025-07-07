<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Split extends Model
{
    protected $fillable = [
        'transaction_id',
        'participant_id',
        'participant_type',
        'portion',
        'settled_at'
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    public function participant(): MorphTo
    {
        return $this->morphTo();
    }
}
