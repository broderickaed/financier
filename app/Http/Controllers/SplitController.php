<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSplitRequest;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SplitController extends Controller
{
    public function edit(Request $request, Transaction $transaction)
    {
        $user = $request->user();

        $data = [
            'transaction' => $transaction,
            'guests' => $user->guests()->get(),
            'users' => User::all(),
            'splits' => $transaction->splits()->get()
        ];

        return Inertia::render('splits/edit', $data);
    }

    public function update(StoreSplitRequest $request, Transaction $transaction)
    {
        $validated = $request->validated();
        $splits = $validated['splits'];

        // Add the transaction_id to each split entry
        foreach ($splits as &$split) {
            $split['transaction_id'] = $transaction->id;
            $split['portion'] = (int) floor($split['portion'] * 100);
        }

        $totalPortion = array_sum(array_column($splits, 'portion'));
        if ($totalPortion !== $transaction->amount) {
            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['splits' => 'The total of all split portions must equal 1.00 (100%).']);
        }

        DB::transaction(function () use ($transaction, $splits) {
            $transaction->splits()->delete(); // delete existing splits
            $transaction->splits()->insert($splits); // bulk insert new ones
        });

        return redirect()
            ->route('transactions.edit', $transaction)
            ->with('success', 'Splits updated successfully.');
    }
}
