<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Transaction extends Model
{
    protected $fillable = [
        'payer_id',
        'payer_type',
        'creator_id',
        'group_id',
        'account_id',
        'category_id',
        'amount',
        'transaction_date',
        'description'
    ];

    protected $appends = [
        'amount_dollars',
        'formatted_amount'
    ];

    // Accessor for dollar amount
    public function getAmountDollarsAttribute(): float
    {
        return $this->amount / 100;
    }

    // Accessor for formatted amount
    public function getFormattedAmountAttribute(): string
    {
        return '$' . number_format($this->amount / 100, 2);
    }

    public function payer(): MorphTo
    {
        return $this->morphTo();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'group_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id')->withDefault(['name' => 'Guest Account']);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function splits(): HasMany
    {
        return $this->hasMany(Split::class, 'transaction_id');
    }
}
