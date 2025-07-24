<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuestController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('guests/index', [
            'guests' => $request->user()->guests()->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('guests/create', []);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:23',
                'unique:guests,name,NULL,id,creator_id,' . $request->user()->id,
            ],
        ]);

        $request->user()->guests()->create($validated);

        return to_route('guests.index');
    }

    public function edit(Guest $guest): Response
    {
        return Inertia::render('guests/edit', ['guest' => $guest]);
    }

    public function update(Request $request, Guest $guest): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:23',
                'unique:guests,name,NULL,id,creator_id,' . $request->user()->id,
            ],
        ]);

        $guest->update($validated);

        return to_route('guests.index');
    }
}
