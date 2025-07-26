<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('transactions/index', [
            'transactions' => $request->user()->createdTransactions()->with(['category', 'account'])->get(),
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();

        $data = [
            'groups' => $user->groups()->get(),
            'guests' => $user->guests()->get(),
            'users' => User::all(),
            'accounts' => $user->accounts()->get(),
            'categories' => $user->categories()->get()
        ];

        return Inertia::render('transactions/create', $data);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'payer_type' => [
                'required',
                'in:App\\Models\\User,App\\Models\\Guest',
            ],
            'payer_id' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->input('payer_type') === 'App\\Models\\User') {
                        if (!User::where('id', $value)->exists()) {
                            $fail('Selected payer user does not exist.');
                        }
                    } elseif ($request->input('payer_type') === 'App\\Models\\Guest') {
                        if (!Guest::where('id', $value)->exists()) {
                            $fail('Selected payer guest does not exist.');
                        }
                    }
                },
            ],
            'group_id' => [
                'required',
                'integer',
                'exists:groups,id',
            ],
            'account_id' => [
                'required',
                'integer',
                'exists:accounts,id',
            ],
            'category_id' => [
                'required',
                'integer',
                'exists:categories,id',
            ],
            'amount' => [
                'required',
                'numeric',
            ],
            'transaction_date' => [
                'required',
                'date',
            ],
            'description' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        $validated['amount'] = (int) $validated['amount'];
        $validated['creator_id'] = $request->user()->id;

        Transaction::create($validated);

        return to_route('transactions.index');
    }

    public function edit(Request $request, Transaction $transaction): Response
    {
        $user = $request->user();

        $data = [
            'groups' => $user->groups()->get(),
            'guests' => $user->guests()->get(),
            'users' => User::all(),
            'accounts' => $user->accounts()->get(),
            'categories' => $user->categories()->get(),
            'transaction' => $transaction
        ];

        return Inertia::render('transactions/edit', $data);
    }

    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        $validated = $request->validate([
            'payer_type' => [
                'required',
                'in:App\\Models\\User,App\\Models\\Guest',
            ],
            'payer_id' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->input('payer_type') === 'App\\Models\\User') {
                        if (!User::where('id', $value)->exists()) {
                            $fail('Selected payer user does not exist.');
                        }
                    } elseif ($request->input('payer_type') === 'App\\Models\\Guest') {
                        if (!Guest::where('id', $value)->exists()) {
                            $fail('Selected payer guest does not exist.');
                        }
                    }
                },
            ],
            'group_id' => [
                'required',
                'integer',
                'exists:groups,id',
            ],
            'account_id' => [
                'required',
                'integer',
                'exists:accounts,id',
            ],
            'category_id' => [
                'required',
                'integer',
                'exists:categories,id',
            ],
            'amount' => [
                'required',
                'numeric',
            ],
            'transaction_date' => [
                'required',
                'date',
            ],
            'description' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        $validated['amount'] = (int) $validated['amount'];
        $transaction->update($validated);

        return to_route('transactions.index');
    }

    public function destroy(Request $request, Transaction $transaction): RedirectResponse
    {
        if ($transaction->creator_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }
        $transaction->delete();

        return to_route('transactions.index');
    }
}
