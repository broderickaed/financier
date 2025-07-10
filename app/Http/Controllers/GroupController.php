<?php

namespace App\Http\Controllers;

use App\Models\Group;
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

    public function edit(Group $group): Response
    {
        $group->load(['members']);
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
}
