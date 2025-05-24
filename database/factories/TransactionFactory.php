<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'account_id' => Account::factory(),
            'date' => Carbon::now()->subDays(rand(1, 30)),
            'description' => $this->faker->sentence,
            'amount' => $this->faker->numberBetween(1000, 10000), // Example: 10.00 to 100.00
            'type' => $this->faker->randomElement(['income', 'expense', 'refund']), // Default to non-transfer
            'related_transaction_id' => null,
        ];
    }

    /**
     * Indicate that the transaction is a transfer.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function transfer()
    {
        return $this->state(function (array $attributes) {
            // For a transfer, we typically create two linked transactions.
            // This factory will create one side. The test logic will handle creating the pair.
            // Or, we can enhance this factory later if needed to create pairs.
            return [
                'type' => 'transfer',
                // 'related_transaction_id' will be set manually in tests when creating pairs.
            ];
        });
    }
    
    /**
     * Indicate that the transaction is an income.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function income()
    {
        return $this->state(function (array $attributes) {
            return [
                'type' => 'income',
                'amount' => abs($this->faker->numberBetween(1000, 10000)), // Ensure positive
            ];
        });
    }

    /**
     * Indicate that the transaction is an expense.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function expense()
    {
        return $this->state(function (array $attributes) {
            return [
                'type' => 'expense',
                'amount' => -abs($this->faker->numberBetween(1000, 10000)), // Ensure negative
            ];
        });
    }
    
    /**
     * Indicate that the transaction is a refund.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function refund()
    {
        return $this->state(function (array $attributes) {
            return [
                'type' => 'refund',
                'amount' => abs($this->faker->numberBetween(1000, 10000)), // Ensure positive
            ];
        });
    }
}
