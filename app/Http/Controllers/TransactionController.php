<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $transactions = $user->createdTransactions()
            ->with(['category', 'account', 'splits.participant'])
            ->latest('created_at')
            ->limit(25)
            ->get();

        return Inertia::render('transactions/index', [
            'transactions' => $transactions,
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

    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        // Create a default split to assign to user for new transactions
        $split = [
            'participant_type' => 'App\\Models\\User',
            'participant_id' => $user->id,
            'portion' => $validated['amount'],
            'settled_at' => null,
        ];

        DB::transaction(function () use ($validated, $user, $split) {
            $transaction = $user->createdTransactions()->create([
                'group_id' => $validated['group_id'],
                'account_id' => $validated['account_id'],
                'category_id' => $validated['category_id'],
                'amount' => $validated['amount'],
                'transaction_date' => $validated['transaction_date'],
                'description' => $validated['description'],
                'payer_type' => $validated['payer_type'],
                'payer_id' => $validated['payer_id'],
            ]);

            $transaction->splits()->create($split);
        });

        return to_route('transactions.index');
    }

    public function edit(Request $request, Transaction $transaction): Response
    {
        // Ensure user can edit this transaction
        if ($transaction->creator_id !== $request->user()->id) {
            abort(403, 'Unauthorized action.');
        }

        $user = $request->user();

        // Load splits with participant relationship
        $transaction->load('splits.participant');

        $data = [
            'groups' => $user->groups()->get(),
            'guests' => $user->guests()->get(),
            'users' => User::all(),
            'accounts' => $user->accounts()->get(),
            'categories' => $user->categories()->get(),
            'transaction' => $transaction,
        ];

        return Inertia::render('transactions/edit', $data);
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $transaction) {
            $originalAmount = $transaction->amount;

            $transaction->update([
                'group_id' => $validated['group_id'],
                'account_id' => $validated['account_id'],
                'category_id' => $validated['category_id'],
                'amount' => $validated['amount'],
                'transaction_date' => $validated['transaction_date'],
                'description' => $validated['description'],
                'payer_type' => $validated['payer_type'],
                'payer_id' => $validated['payer_id'],
            ]);

            // If amount has been changed reset splits all to creator
            if ($originalAmount !== $validated['amount']) {
                // Delete existing splits and create new ones
                $transaction->splits()->delete();

                // Create a default split to assign to user for new transactions
                $split = [
                    'participant_type' => $validated['payer_type'],
                    'participant_id' => $validated['payer_id'],
                    'portion' => $validated['amount'],
                    'settled_at' => null,
                ];
                $transaction->splits()->create($split);
            }
        });

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
