<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = request()->user()->categories()->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        if (request()->user()->cannot('create', Category::class)) {
            abort(403);
        }
        return Inertia::render('Categories/Create');
    }

    public function store(Request $request)
    {
        if ($request->user()->cannot('create', Category::class)) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $request->user()->categories()->create($validated);

        return redirect()->route('categories.index');
    }

    public function show(Category $category): Response
    {
        if (request()->user()->cannot('view', $category)) {
            abort(403);
        }

        return Inertia::render('Categories/Show', ['category' => $category]);
    }

    public function edit(Category $category): Response
    {
        if (request()->user()->cannot('update', $category)) {
            abort(403);
        }

        return Inertia::render('Categories/Edit', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        if ($request->user()->cannot('update', $category)) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $category->update($validated);

        return redirect()->route('categories.index');
    }

    public function destroy(Category $category)
    {
        if (request()->user()->cannot('delete', $category)) {
            abort(403);
        }

        $category->delete();

        return redirect()->route('categories.index');
    }
}
