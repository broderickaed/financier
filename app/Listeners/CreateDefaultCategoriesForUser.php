<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Auth\Events\Registered;
use App\Models\Category;
use App\Models\User;

class CreateDefaultCategoriesForUser
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        $user = User::find($event->user->id);

        $defaultCategories = ['Groceries', 'Dining Out', 'Rent', 'Utilities', 'Entertainment', 'Miscellaneous'];

        foreach ($defaultCategories as $name) {
            $user->categories()->create(['name' => $name]);
        }
    }
}
