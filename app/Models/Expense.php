<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = ['name', 'amount', 'date'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
