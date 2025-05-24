<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AccountFactory extends Factory
{
    protected $model = Account::class;

    public function definition()
    {
        return [
            'name' => $this->faker->unique()->company() . ' Account',
            'user_id' => User::factory(),
        ];
    }
}
