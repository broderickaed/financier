<?php

namespace App\Http\Controllers;

use App\Models\Split;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SplitController extends Controller
{
    // public function index(Request $request, Transaction $transaction)
    // {
    //     if ($request->user()->cannot('view', $transaction)) {
    //         abort(403);
    //     }

    //     $transaction->load('splits.user');

    //     return Inertia::render('Transactions/TransactionSplits', [
    //         'transaction' => $transaction,
    //     ]);
    // }

    public function create(Request $request, Transaction $transaction)
    {
        if ($request->user()->cannot('update', $transaction)) {
            abort(403);
        }

        $transaction->load('splits.user');

        // $splitees = get current splitees to pass for autocomplete

        return Inertia::render('Splits/Create', [
            'transaction' => $transaction,
        ]);
    }

    public function store(Request $request, Transaction $transaction)
    {
        if ($request->user()->cannot('create', Split::class)) {
            abort(403);
        }

        $validated = $request->validate([
            'splits' => 'required|array|min:1',
            'splits.*.name' => 'nullable|string|max:255|required_without:splits.*.user_id',
            'splits.*.user_id' => 'nullable|integer|exists:users,id|required_without:splits.*.name',
            'splits.*.amount' => 'required|integer|min:1', // Amount in cents
            'splits.*.note' => 'nullable|string|max:1000',
        ]);

        // Basic validation: Ensure total split amount doesn't exceed transaction amount
        $totalSplitAmount = 0;
        foreach ($validated['splits'] as $splitData) {
            $totalSplitAmount += $splitData['amount'];
        }

        // if ($totalSplitAmount > $transaction->amount) {
        //     return back()->withErrors(['splits_total' => 'The total amount of splits cannot exceed the transaction amount.'])->withInput();
        // }
        // More sophisticated validation: Ensure total split amount EQUALS transaction amount if required
        if (abs($totalSplitAmount) !== abs($transaction->amount)) {
            return back()->withErrors([
                'splits_total' => 'The total amount of splits (' . $totalSplitAmount . ') must equal the transaction amount (' . $transaction->amount . ').'
            ])->withInput();
        }


        // Delete existing splits for this transaction if you want to replace them all
        $transaction->splits()->delete(); // Or handle updates more granularly

        foreach ($validated['splits'] as $splitData) {
            $transaction->splits()->create([
                'user_id' => $splitData['user_id'] ?? null,
                'name' => $splitData['user_id'] ? null : $splitData['name'], // Prefer user_id if available
                'amount' => $splitData['amount'],
                'note' => $splitData['note'] ?? null,
            ]);
        }

        // Potentially update the original transaction (e.g., mark as 'split')
        // $transaction->update(['is_split' => true]); // If you add an 'is_split' column

        return redirect()->route('transactions.index')->with('success', 'Transaction split successfully.');
        // Or redirect to the transaction show page:
        // return redirect()->route('transactions.show', $transaction)->with('success', 'Transaction split successfully.');
    }
}

    // public function update(Request $request, Split $split)
    // {
    //     if ($request->user()->cannot('update', Split::class)) {
    //         abort(403);
    //     }

    //     $validated = $request->validate([
    //         'amount_cents' => 'required|integer',
    //         'note' => 'nullable|string',
    //         'user_id' => 'nullable|exists:users,id',
    //         'name' => 'nullable|string',
    //     ]);

    //     if (!$validated['user_id'] && !$validated['name']) {
    //         throw ValidationException::withMessages([
    //             'user_id' => 'Either user_id or name must be provided.',
    //             'name' => 'Either user_id or name must be provided.',
    //         ]);
    //     }

    //     $split->update($validated);

    //     return response()->json($split->load('user', 'transaction'));
    // }

    // public function destroy(Split $split)
    // {
    //     if (request()->user()->cannot('update', Split::class)) {
    //         abort(403);
    //     }

    //     $split->delete();

    //     return response()->noContent();
    // }
// }
