<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Split;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('groups/index', [
            'groups' => $request->user()->groups()->with('creator')->withCount('members')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('groups/create', []);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $user = $request->user();
        $group = $user->createdGroups()->create($validated);
        $user->groups()->attach($group);

        return to_route('groups.index');
    }

    public function show(Request $request, Group $group)
    {
        $user = $request->user();
        $group->load(['members']);
        // 1. Fetch ALL unsettled splits for this group in a single, efficient query.
        // Eager load the related transaction (and its payer) and the split's participant.
        $unsettledSplits = Split::whereNull('settlement_id')
            ->whereHas('transaction', function ($query) use ($group) {
                $query->where('group_id', $group->id);
            })
            ->with([
                'transaction.payer',
                'participant'
            ])
            ->get();

        // 2. Calculate the balances for this group using the pre-filtered splits.
        $groupBalances = $this->calculatePotBalances($unsettledSplits);

        // 3. Get other data for the group dashboard
        $members = $group->members()->get(); // Assuming Group has a users() relationship
        $recentTransactions = $group->transactions()->with(['payer'])->latest()->take(5)->get();

        return Inertia::render('groups/show', [
            'group' => $group,
            'recentTransactions' => $recentTransactions,
            'unsettledBalances' => $groupBalances,
        ]);
    }

    public function edit(Group $group): Response
    {;
        return Inertia::render('groups/edit', ['group' => $group]);
    }

    public function update(Request $request, Group $group): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $group->update($validated);

        return to_route('groups.index');
    }

    public function enrolUser(Request $request, Group $group): RedirectResponse
    {
        //TODO: allow creator of group to control enrolment
        return to_route('groups.index');
    }

    /**
     * Helper function to calculate pot-style balances from a collection of unsettled splits.
     * This version is optimized for the split-first query.
     */
    private function calculatePotBalances($unsettledSplits): array
    {
        $balances = [];
        $processedTransactions = [];

        foreach ($unsettledSplits as $split) {
            $transaction = $split->transaction;
            $participant = $split->participant;
            $payer = $transaction->payer;

            // Handle the portion owed by the split participant
            if ($participant) {
                $key = $participant->getMorphClass() . '-' . $participant->id;
                if (!isset($balances[$key])) {
                    $balances[$key] = [
                        'participant' => $participant,
                        'portions_owed' => 0,
                        'paid' => 0,
                    ];
                }
                $balances[$key]['portions_owed'] += $split->portion;
            }

            // Handle the payment made by the transaction payer
            // This is the crucial part: we must only add the payment ONCE per transaction.
            if ($payer && !in_array($transaction->id, $processedTransactions)) {
                $key = $payer->getMorphClass() . '-' . $payer->id;
                if (!isset($balances[$key])) {
                    $balances[$key] = [
                        'participant' => $payer,
                        'portions_owed' => 0,
                        'paid' => 0,
                    ];
                }
                $balances[$key]['paid'] += $transaction->amount;
                $processedTransactions[] = $transaction->id;
            }
        }

        // Final Pass: Calculate the net balance for each participant.
        $finalBalances = [];
        foreach ($balances as $balance) {
            $netAmount = $balance['portions_owed'] - $balance['paid'];

            // Only include non-zero balances in the final output
            // if ($netAmount !== 0) {
            $finalBalances[] = [
                'participant' => $balance['participant'],
                'net_amount' => $netAmount,
                'portions_owed' => $balance['portions_owed'],
                'paid' => $balance['paid'],
            ];
            // }
        }

        // Sort by amount owed (most owed to least owed)
        uasort($finalBalances, fn($a, $b) => $b['net_amount'] <=> $a['net_amount']);

        return array_values($finalBalances);
    }
}
