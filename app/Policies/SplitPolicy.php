<?php

namespace App\Policies;

use App\Models\Split;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SplitPolicy
{
    public function create(User $user)
    {
        // For now, allow creating splits if the user is authenticated
        return true;
    }

    public function update(User $user, Split $split)
    {
        // Allow updating if user owns the transaction
        return $user->id === $split->transaction->user_id;
    }

    public function delete(User $user, Split $split)
    {
        // Same as update
        return $user->id === $split->transaction->user_id;
    }
}
