<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{

    /**
     * Determine whether the user can view the category.
     */
    public function view(User $user, Category $category)
    {
        // Example: Only allow if the user owns the category
        return $user->id === $category->user_id;
    }

    /**
     * Determine whether the user can create categories.
     */
    public function create(User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can update the category.
     */
    public function update(User $user, Category $category)
    {
        return $user->id === $category->user_id;
    }

    /**
     * Determine whether the user can delete the category.
     */
    public function delete(User $user, Category $category)
    {
        return $user->id === $category->user_id;
    }
}
