<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasAccount
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // If the user is missing accounts
        if ($request->user()->accounts()->count() === 0) {
            // Avoid redirect loop if already on the account creation page
            if ($request->routeIs('accounts.create', 'accounts.store')) {
                return $next($request);
            }

            // Add a flash message to inform the user
            session()->flash('message', 'You need to create at least one account before proceeding.');

            // Otherwise, redirect to create page
            return redirect()->route('accounts.create');
        }

        return $next($request);
    }
}
