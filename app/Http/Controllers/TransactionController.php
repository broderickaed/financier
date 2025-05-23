<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $transactions = $request->user()
            ->transactions()
            ->with(['account'])
            ->latest()
            ->get();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
        ]);
    }

    public function create(): Response
    {
        $accounts = request()->user()->accounts()->get();

        return Inertia::render('Transactions/Create', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'description' => ['required', 'string'],
            'amount' => ['required', 'integer', 'min:1'],
            'type' => ['required', 'in:income,expense,transfer,refund'],
            'account_id' => ['required', 'exists:accounts,id'],
            'related_account_id' => ['required_if:type,transfer', 'exists:accounts,id', 'different:account_id'],
        ]);
        
        if ($validated['type'] === 'transfer') {
            // Create withdrawal transaction
            $withdrawal = $request->user()->transactions()->create([
                'account_id' => $validated['account_id'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => -$validated['amount'],
                'type' => 'transfer',
            ]);

            // Create deposit transaction
            $deposit = $request->user()->transactions()->create([
                'account_id' => $validated['related_account_id'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'type' => 'transfer',
                'related_transaction_id' => $withdrawal->id,
            ]);

            $withdrawal->update(['related_transaction_id' => $deposit->id]);
        } else {
            // For non-transfer transactions, adjust the sign based on type
            $amount = $validated['amount'];
            if ($validated['type'] === 'expense') {
                $amount = -$amount;
            }
            // refund and income will keep the positive amount
            
            $request->user()->transactions()->create([
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => $amount,
                'type' => $validated['type'],
                'account_id' => $validated['account_id'],
            ]);
        }

        return redirect()->route('transactions.index');
    }
    

    public function show(Request $request, Transaction $transaction): Response
    {
        if ($request->user()->cannot('viewAny', Transaction::class)) {
            abort(403);
        }

        return Inertia::render('Transactions/Show', [
            'transaction' => $transaction,
        ]);
    }

    public function edit(Request $request, Transaction $transaction): Response
    {
        if ($request->user()->cannot('update', $transaction)) {
            abort(403);
        }
        
        $accounts = request()->user()->accounts()->get();

        // For transfers, always show the withdrawal side (negative amount)
        if ($transaction->type === 'transfer' && $transaction->amount > 0) {
            // If we're looking at the deposit side, switch to the withdrawal side
            $transaction = Transaction::find($transaction->related_transaction_id);
        }

        // For transfers, get the related transaction's account
        $relatedAccountId = null;
        if ($transaction->type === 'transfer' && $transaction->related_transaction_id) {
            $relatedTransaction = Transaction::find($transaction->related_transaction_id);
            if ($relatedTransaction) {
                $relatedAccountId = $relatedTransaction->account_id;
            }
        }

        return Inertia::render('Transactions/Edit', [
            'transaction' => array_merge($transaction->toArray(), [
                'amount' => abs($transaction->amount), // Send absolute value to form
            ]),
            'accounts' => $accounts,
            'relatedAccount' => $accounts->find($relatedAccountId),
        ]);
    }
    

    public function update(Request $request, Transaction $transaction)
    {
        if ($request->user()->cannot('update', $transaction)) {
            abort(403);
        }

        $validated = $request->validate([
            'date' => ['required', 'date'],
            'description' => ['required', 'string'],
            'amount' => ['required', 'integer', 'min:1'],
            'type' => ['required', 'in:income,expense,transfer,refund'],
            'account_id' => ['required', 'exists:accounts,id'],
            'related_account_id' => ['required_if:type,transfer', 'exists:accounts,id', 'different:account_id'],
        ]);

        // If this is the deposit side of a transfer, switch to the withdrawal side
        if ($transaction->type === 'transfer' && $transaction->amount > 0) {
            $transaction = Transaction::find($transaction->related_transaction_id);
        }

        if ($validated['type'] === 'transfer') {
            // Get or create the related transaction
            $relatedTransaction = null;
            if ($transaction->related_transaction_id) {
                $relatedTransaction = Transaction::find($transaction->related_transaction_id);
            }

            // Update or create withdrawal transaction
            $transaction->update([
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => -$validated['amount'],
                'type' => 'transfer',
                'account_id' => $validated['account_id'],
            ]);

            // Update or create deposit transaction
            if ($relatedTransaction) {
                $relatedTransaction->update([
                    'date' => $validated['date'],
                    'description' => $validated['description'],
                    'amount' => $validated['amount'],
                    'type' => 'transfer',
                    'account_id' => $validated['related_account_id'],
                ]);
            } else {
                $deposit = $request->user()->transactions()->create([
                    'date' => $validated['date'],
                    'description' => $validated['description'],
                    'amount' => $validated['amount'],
                    'type' => 'transfer',
                    'account_id' => $validated['related_account_id'],
                    'related_transaction_id' => $transaction->id,
                ]);
                $transaction->update(['related_transaction_id' => $deposit->id]);
            }
        } else {
            // If it was a transfer but now it's not, delete the related transaction
            if ($transaction->type === 'transfer' && $transaction->related_transaction_id) {
                $related = Transaction::find($transaction->related_transaction_id);
                if ($related) {
                    $related->delete();
                }
                $transaction->related_transaction_id = null;
            }

            // For non-transfer transactions, adjust the sign based on type
            $amount = $validated['amount'];
            if ($validated['type'] === 'expense') {
                $amount = -$amount;
            }
            // refund and income will keep the positive amount

            // Update as a regular transaction
            $transaction->update([
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => $amount,
                'type' => $validated['type'],
                'account_id' => $validated['account_id'],
            ]);
        }

        return redirect()->route('transactions.index');
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        if ($request->user()->cannot('delete', $transaction)) {
            abort(403);
        }

        if ($transaction->type === 'transfer') {
            $related = Transaction::find($transaction->related_transaction_id);
            $related?->delete();
        }

        $transaction->delete();

        return redirect()->route('transactions.index');
    }
}
