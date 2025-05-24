<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use App\Listeners\CreateDefaultCategoriesForUser;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Registered::class => [
            CreateDefaultCategoriesForUser::class,
        ],
    ];

    public function boot()
    {
        //
    }
}
