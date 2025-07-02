<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Split extends Model
{
    protected $fillable = [
        'transaction_id',
        'user_id',
        'name',
        'amount',
        'note',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
