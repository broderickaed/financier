<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
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

    protected $appends = [
        'portion_dollars',
        'formatted_portion'
    ];

    // Accessor for dollar amount
    public function getPortionDollarsAttribute(): float
    {
        return $this->portion / 100;
    }

    // Accessor for formatted amount
    public function getFormattedPortionAttribute(): string
    {
        return '$' . number_format($this->portion / 100, 2);
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    public function participant(): MorphTo
    {
        return $this->morphTo();
    }
}
