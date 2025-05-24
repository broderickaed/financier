<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(): Response
    {
        if (request()->user()->cannot('viewAny', Account::class)) {
            abort(403);
        }

        return Inertia::render('Accounts/Index', [
            'accounts' => request()->user()->accounts()->latest()->get()
        ]);
    }

    public function create(): Response
    {
        if (request()->user()->cannot('create', Account::class)) {
            abort(403);
        }

        return Inertia::render('Accounts/Create');
    }

    public function store(Request $request)
    {
        if ($request->user()->cannot('create', Account::class)) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $request->user()->accounts()->create($validated);

        return redirect()->route('accounts.index');
    }

    public function show(Account $account): Response
    {
        if (request()->user()->cannot('view', $account)) {
            abort(403);
        }

        return Inertia::render('Accounts/Show', ['account' => $account]);
    }

    public function edit(Account $account): Response
    {
        if (request()->user()->cannot('update', $account)) {
            abort(403);
        }

        return Inertia::render('Accounts/Edit', ['account' => $account]);
    }

    public function update(Request $request, Account $account)
    {
        if ($request->user()->cannot('update', $account)) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $account->update($validated);

        return redirect()->route('accounts.index');
    }

    public function destroy(Request $request, Account $account)
    {
        if ($request->user()->cannot('delete', $account)) {
            abort(403);
        }

        $account->delete();

        return redirect()->route('accounts.index');
    }
}
