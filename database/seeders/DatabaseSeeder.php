<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Account;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Hash;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $user = User::factory()->create([
            'name' => 'bro',
            'email' => 'b@b.com',
            'password' => Hash::make('password'),
        ]);
        event(new Registered($user));

        // Create accounts for the user
        $accounts = [
            ['name' => 'Chequing'],
            ['name' => 'Savings'],
            ['name' => 'Credit Card'],
        ];

        foreach ($accounts as $account) {
            $user->accounts()->create($account);
        }
    }
}
