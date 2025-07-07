<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Guest extends Model
{
    protected $fillable = ['name', 'creator_id'];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function paidTransactions(): MorphMany
    {
        return $this->morphMany(Transaction::class, 'payer');
    }

    public function splits(): MorphMany
    {
        return $this->morphMany(Split::class, 'participant');
    }
}
