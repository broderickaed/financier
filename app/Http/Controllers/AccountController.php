<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;
class AccountController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Accounts/Index', [
            'accounts' => $request->user()->accounts()->latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Accounts/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $request->user()->accounts()->create($validated);

        return redirect()->route('accounts.index');
    }

    public function show(Account $account)
    {
        Gate::authorize('view', $account);

        return Inertia::render('Accounts/Show', ['account' => $account]);
    }

    public function edit(Account $account)
    {
        Gate::authorize('update', $account);

        return Inertia::render('Accounts/Edit', ['account' => $account]);
    }

    public function update(Request $request, Account $account)
    {
        Gate::authorize('update', $account);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $account->update($validated);

        return redirect()->route('accounts.index');
    }

    public function destroy(Account $account)
    {
        Gate::authorize('delete', $account);

        $account->delete();

        return redirect()->route('accounts.index');
    }
}
