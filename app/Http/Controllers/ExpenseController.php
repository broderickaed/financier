<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->cannot('viewAny', Expense::class)) {
            abort(403);
        }

        $expenses = $request->user()->expenses()->latest()->get();
        return inertia('Expenses/Index', compact('expenses'));
    }

    public function create(Request $request)
    {
        if ($request->user()->cannot('create', Expense::class)) {
            abort(403);
        }

        return inertia('Expenses/Create');
    }

    public function store(Request $request)
    {
        if ($request->user()->cannot('create', Expense::class)) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'date' => 'required|date',
        ]);

        $request->user()->expenses()->create($data);

        return redirect()->route('expenses.index');
    }

    public function show(Request $request, Expense $expense)
    {
        if ($request->user()->cannot('view', $expense)) {
            abort(403);
        }

        return inertia('Expenses/Show', compact('expense'));
    }

    public function edit(Request $request, Expense $expense)
    {
        if ($request->user()->cannot('update', $expense)) {
            abort(403);
        }

        return inertia('Expenses/Edit', compact('expense'));
    }

    public function update(Request $request, Expense $expense)
    {
        if ($request->user()->cannot('update', $expense)) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'date' => 'required|date',
        ]);

        $expense->update($data);

        return redirect()->route('expenses.index');
    }

    public function destroy(Request $request, Expense $expense)
    {
        if ($request->user()->cannot('delete', $expense)) {
            abort(403);
        }

        $expense->delete();

        return redirect()->route('expenses.index');
    }
}
