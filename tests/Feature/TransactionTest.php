<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Account;
use App\Models\Transaction;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Account $account;
    protected Account $anotherAccount;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a user and authenticate
        $this->user = User::factory()->create();
        $this->actingAs($this->user);

        // Create a primary account for the user
        $this->account = Account::factory()->create(['user_id' => $this->user->id]);
        
        // Create another account for the same user, for transfer tests
        $this->anotherAccount = Account::factory()->create(['user_id' => $this->user->id, 'name' => 'Savings Account']);
    }

    // Test methods will be added here based on the plan

    /** @test */
    public function user_can_create_income_transaction()
    {
        $transactionData = [
            'date' => now()->format('Y-m-d'),
            'description' => 'Salary',
            'amount' => 500000, // 5000.00
            'type' => 'income',
            'account_id' => $this->account->id,
        ];

        $response = $this->post(route('transactions.store'), $transactionData);

        $response->assertRedirect(route('transactions.index'));
        $this->assertDatabaseHas('transactions', [
            'account_id' => $this->account->id,
            'description' => 'Salary',
            'amount' => 500000, // Stored as positive
            'type' => 'income',
            'user_id' => $this->user->id,
        ]);
        
        // Check count
        $this->assertEquals(1, Transaction::count());
    }

    /** @test */
    public function user_can_create_expense_transaction()
    {
        $transactionData = [
            'date' => now()->format('Y-m-d'),
            'description' => 'Groceries',
            'amount' => 7500, // 75.00 (input is positive)
            'type' => 'expense',
            'account_id' => $this->account->id,
        ];

        $response = $this->post(route('transactions.store'), $transactionData);

        $response->assertRedirect(route('transactions.index'));
        $this->assertDatabaseHas('transactions', [
            'account_id' => $this->account->id,
            'description' => 'Groceries',
            'amount' => -7500, // Stored as negative
            'type' => 'expense',
            'user_id' => $this->user->id,
        ]);
        
        $this->assertEquals(1, Transaction::count());
    }

    /** @test */
    public function user_can_create_refund_transaction()
    {
        $transactionData = [
            'date' => now()->format('Y-m-d'),
            'description' => 'Product Return',
            'amount' => 12000, // 120.00 (input is positive)
            'type' => 'refund',
            'account_id' => $this->account->id,
        ];

        $response = $this->post(route('transactions.store'), $transactionData);

        $response->assertRedirect(route('transactions.index'));
        $this->assertDatabaseHas('transactions', [
            'account_id' => $this->account->id,
            'description' => 'Product Return',
            'amount' => 12000, // Stored as positive
            'type' => 'refund',
            'user_id' => $this->user->id,
        ]);
        
        $this->assertEquals(1, Transaction::count());
    }

    /** @test */
    public function user_can_create_transfer_transaction()
    {
        $transactionData = [
            'date' => now()->format('Y-m-d'),
            'description' => 'Transfer to Savings',
            'amount' => 25000, // 250.00 (input is positive)
            'type' => 'transfer',
            'account_id' => $this->account->id, // Source account
            'related_account_id' => $this->anotherAccount->id, // Destination account
        ];

        $response = $this->post(route('transactions.store'), $transactionData);

        $response->assertRedirect(route('transactions.index'));
        
        // Check that two transactions were created
        $this->assertEquals(2, Transaction::count());

        // Assert withdrawal transaction (from source account)
        $this->assertDatabaseHas('transactions', [
            'user_id' => $this->user->id,
            'account_id' => $this->account->id,
            'date' => $transactionData['date'],
            'description' => $transactionData['description'],
            'amount' => -$transactionData['amount'], // Negative amount for withdrawal
            'type' => 'transfer',
        ]);

        // Assert deposit transaction (to destination account)
        $this->assertDatabaseHas('transactions', [
            'user_id' => $this->user->id,
            'account_id' => $this->anotherAccount->id,
            'date' => $transactionData['date'],
            'description' => $transactionData['description'],
            'amount' => $transactionData['amount'], // Positive amount for deposit
            'type' => 'transfer',
        ]);

        // Assert transactions are linked
        $withdrawal = Transaction::where('account_id', $this->account->id)->where('amount', -$transactionData['amount'])->first();
        $deposit = Transaction::where('account_id', $this->anotherAccount->id)->where('amount', $transactionData['amount'])->first();

        $this->assertNotNull($withdrawal, 'Withdrawal transaction not found.');
        $this->assertNotNull($deposit, 'Deposit transaction not found.');
        
        $this->assertEquals($deposit->id, $withdrawal->related_transaction_id);
        $this->assertEquals($withdrawal->id, $deposit->related_transaction_id);
    }

    /** @test */
    public function user_can_update_income_transaction()
    {
        // Create an initial income transaction
        $transaction = Transaction::factory()->income()->create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id,
            'amount' => 30000, // Initial amount 300.00
            'description' => 'Consulting Gig',
        ]);

        $updateData = [
            'date' => now()->subDay()->format('Y-m-d'),
            'description' => 'Consulting Services Rendered',
            'amount' => 35000, // Updated amount 350.00
            'type' => 'income', // Type remains income
            'account_id' => $this->account->id, // Account remains the same
        ];

        $response = $this->put(route('transactions.update', $transaction), $updateData);

        $response->assertRedirect(route('transactions.index'));
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'date' => $updateData['date'],
            'description' => $updateData['description'],
            'amount' => 35000, // Amount should be positive
            'type' => 'income',
            'account_id' => $this->account->id,
        ]);
        
        // Ensure no new transaction was created
        $this->assertEquals(1, Transaction::count());
    }

    /** @test */
    public function user_can_update_expense_transaction()
    {
        // Create an initial expense transaction
        // The factory's expense() state correctly sets a negative amount
        $transaction = Transaction::factory()->expense()->create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id,
            'amount' => -5000, // Initial amount -50.00
            'description' => 'Office Supplies',
        ]);

        $updateData = [
            'date' => now()->subDays(2)->format('Y-m-d'),
            'description' => 'Stationery and Office Supplies',
            'amount' => 6000, // User inputs positive 60.00 for the form
            'type' => 'expense', // Type remains expense
            'account_id' => $this->account->id, // Account remains the same
        ];

        $response = $this->put(route('transactions.update', $transaction), $updateData);

        $response->assertRedirect(route('transactions.index'));
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'date' => $updateData['date'],
            'description' => $updateData['description'],
            'amount' => -6000, // Amount should be stored as negative
            'type' => 'expense',
            'account_id' => $this->account->id,
        ]);
        
        $this->assertEquals(1, Transaction::count());
    }

    /** @test */
    public function user_can_update_refund_transaction()
    {
        // Create an initial refund transaction
        // The factory's refund() state correctly sets a positive amount
        $transaction = Transaction::factory()->refund()->create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id,
            'amount' => 2000, // Initial amount 20.00
            'description' => 'Faulty Item Return',
        ]);

        $updateData = [
            'date' => now()->subDays(3)->format('Y-m-d'),
            'description' => 'Returned Damaged Goods',
            'amount' => 2500, // User inputs positive 25.00 for the form
            'type' => 'refund', // Type remains refund
            'account_id' => $this->account->id, // Account remains the same
        ];

        $response = $this->put(route('transactions.update', $transaction), $updateData);

        $response->assertRedirect(route('transactions.index'));
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'date' => $updateData['date'],
            'description' => $updateData['description'],
            'amount' => 2500, // Amount should be stored as positive
            'type' => 'refund',
            'account_id' => $this->account->id,
        ]);
        
        $this->assertEquals(1, Transaction::count());
    }

    /** @test */
    public function user_can_update_transfer_transaction()
    {
        // Create initial transfer transactions
        $withdrawal = Transaction::factory()->transfer()->create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id, // Source
            'amount' => -50000, // 500.00
            'description' => 'Initial Transfer',
        ]);
        $deposit = Transaction::factory()->transfer()->create([
            'user_id' => $this->user->id,
            'account_id' => $this->anotherAccount->id, // Destination
            'amount' => 50000,
            'description' => 'Initial Transfer',
            'related_transaction_id' => $withdrawal->id,
        ]);
        $withdrawal->update(['related_transaction_id' => $deposit->id]);

        // Data for updating the transfer
        // We're updating the logical transfer, so we provide the 'base' details.
        // The controller expects a positive amount in the form.
        $updateData = [
            'date' => now()->subDays(5)->format('Y-m-d'),
            'description' => 'Updated Transfer to Savings',
            'amount' => 60000, // New amount 600.00 (positive input)
            'type' => 'transfer',
            'account_id' => $this->account->id, // Source account (can also be changed)
            'related_account_id' => $this->anotherAccount->id, // Destination account (can also be changed)
        ];

        // We pass the withdrawal transaction to the update route, as per controller logic
        // (or it will find it if we pass the deposit)
        $response = $this->put(route('transactions.update', $withdrawal), $updateData);

        $response->assertRedirect(route('transactions.index'));

        // Assert withdrawal transaction is updated
        $this->assertDatabaseHas('transactions', [
            'id' => $withdrawal->id,
            'user_id' => $this->user->id,
            'account_id' => $updateData['account_id'], // Source
            'date' => $updateData['date'],
            'description' => $updateData['description'],
            'amount' => -$updateData['amount'], // Negative for withdrawal
            'type' => 'transfer',
            'related_transaction_id' => $deposit->id, // Should still point to the same deposit record ID
        ]);

        // Assert deposit transaction is updated
        $this->assertDatabaseHas('transactions', [
            'id' => $deposit->id,
            'user_id' => $this->user->id,
            'account_id' => $updateData['related_account_id'], // Destination
            'date' => $updateData['date'],
            'description' => $updateData['description'],
            'amount' => $updateData['amount'], // Positive for deposit
            'type' => 'transfer',
            'related_transaction_id' => $withdrawal->id, // Should still point to the same withdrawal record ID
        ]);
        
        $this->assertEquals(2, Transaction::count()); // Still only two transactions
    }

    /** @test */
    public function user_can_update_transaction_type_from_expense_to_income()
    {
        // Create an initial expense transaction (amount will be negative)
        $transaction = Transaction::factory()->expense()->create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id,
            'amount' => -2000, // -20.00
            'description' => 'Old Expense',
        ]);

        $updateData = [
            'date' => $transaction->date, // Keep same date or change
            'description' => 'Now Income',
            'amount' => 2000, // User inputs positive 20.00 for the form
            'type' => 'income', // <<-- Type changed
            'account_id' => $this->account->id,
            // 'related_account_id' is not needed as it's not a transfer
        ];

        $response = $this->put(route('transactions.update', $transaction), $updateData);

        $response->assertRedirect(route('transactions.index'));
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'description' => 'Now Income',
            'amount' => 2000, // Amount should now be positive
            'type' => 'income',
            'account_id' => $this->account->id,
            'related_transaction_id' => null, // Ensure it's null if it wasn't a transfer
        ]);
        
        $this->assertEquals(1, Transaction::count());
    }

    /** @test */
    public function user_can_update_transaction_type_from_transfer_to_expense()
    {
        // Create initial transfer transactions
        $withdrawal = Transaction::factory()->transfer()->create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id, // Source
            'amount' => -50000, // -500.00
            'description' => 'Transfer to be changed',
        ]);
        $deposit = Transaction::factory()->transfer()->create([
            'user_id' => $this->user->id,
            'account_id' => $this->anotherAccount->id, // Destination
            'amount' => 50000, // 500.00
            'description' => 'Transfer to be changed',
            'related_transaction_id' => $withdrawal->id,
        ]);
        $withdrawal->update(['related_transaction_id' => $deposit->id]);

        $this->assertEquals(2, Transaction::count()); // Start with 2 transactions

        // Data for updating the withdrawal transaction to an expense
        $updateData = [
            'date' => $withdrawal->date,
            'description' => 'Was a transfer, now an expense',
            'amount' => 50000, // User inputs positive 500.00 for the form
            'type' => 'expense', // <<-- Type changed
            'account_id' => $withdrawal->account_id, // Keep same account or change
            // 'related_account_id' should NOT be provided, as it's no longer a transfer
        ];

        // We update the withdrawal side of the original transfer
        $response = $this->put(route('transactions.update', $withdrawal), $updateData);
        $response->assertRedirect(route('transactions.index'));

        // Assert the original withdrawal transaction is updated to an expense
        $this->assertDatabaseHas('transactions', [
            'id' => $withdrawal->id,
            'description' => 'Was a transfer, now an expense',
            'amount' => -50000, // Amount should be negative for expense
            'type' => 'expense',
            'account_id' => $withdrawal->account_id,
            'related_transaction_id' => null, // Should be null now
        ]);

        // Assert the related deposit transaction is deleted
        $this->assertDatabaseMissing('transactions', ['id' => $deposit->id]);
        
        // Only the updated transaction should remain
        $this->assertEquals(1, Transaction::count());
    }

    /** @test */
    public function user_can_update_transaction_type_from_income_to_transfer()
    {
        // Create an initial income transaction
        $transaction = Transaction::factory()->income()->create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id, // This will become the source account
            'amount' => 70000, // 700.00
            'description' => 'Initial Income',
        ]);
        
        $this->assertEquals(1, Transaction::count());

        // Data for updating the income transaction to a transfer
        $updateData = [
            'date' => $transaction->date,
            'description' => 'Now a transfer',
            'amount' => 70000, // User inputs positive 700.00 for the form
            'type' => 'transfer', // <<-- Type changed
            'account_id' => $this->account->id, // Source account
            'related_account_id' => $this->anotherAccount->id, // <<-- Destination account is now required
        ];

        $response = $this->put(route('transactions.update', $transaction), $updateData);
        $response->assertRedirect(route('transactions.index'));

        // Assert the original transaction is updated to be the withdrawal part of the transfer
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'description' => 'Now a transfer',
            'amount' => -70000, // Amount should be negative for the withdrawal part
            'type' => 'transfer',
            'account_id' => $this->account->id, // Source account
        ]);

        // Assert a new deposit transaction is created
        $newDepositTransaction = Transaction::where('account_id', $this->anotherAccount->id)
                                           ->where('amount', 70000)
                                           ->where('type', 'transfer')
                                           ->first();
        
        $this->assertNotNull($newDepositTransaction, "The new deposit part of the transfer was not found.");
        $this->assertEquals($updateData['description'], $newDepositTransaction->description);
        $this->assertEquals($this->user->id, $newDepositTransaction->user_id);

        // Assert transactions are linked
        $updatedWithdrawal = Transaction::find($transaction->id); // Re-fetch to get updated related_id
        $this->assertEquals($newDepositTransaction->id, $updatedWithdrawal->related_transaction_id);
        $this->assertEquals($updatedWithdrawal->id, $newDepositTransaction->related_transaction_id);
        
        // There should now be two transactions
        $this->assertEquals(2, Transaction::count());
    }

    /** @test */
    public function user_can_delete_income_transaction()
    {
        // Create an income transaction
        $transaction = Transaction::factory()->income()->create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id,
        ]);

        $this->assertEquals(1, Transaction::count()); // Ensure it exists

        $response = $this->delete(route('transactions.destroy', $transaction));

        $response->assertRedirect(route('transactions.index'));
        $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);
        $this->assertEquals(0, Transaction::count()); // Ensure it's gone
    }

    /** @test */
    public function user_can_delete_transfer_transaction_deleting_both_sides()
    {
        // Create initial transfer transactions
        $withdrawal = Transaction::factory()->transfer()->create([
            'user_id' => $this->user->id,
            'account_id' => $this->account->id, // Source
            'amount' => -50000,
            'description' => 'Transfer to be deleted',
        ]);
        $deposit = Transaction::factory()->transfer()->create([
            'user_id' => $this->user->id,
            'account_id' => $this->anotherAccount->id, // Destination
            'amount' => 50000,
            'description' => 'Transfer to be deleted',
            'related_transaction_id' => $withdrawal->id,
        ]);
        $withdrawal->update(['related_transaction_id' => $deposit->id]);

        $this->assertEquals(2, Transaction::count()); // Ensure they exist

        // Delete one side of the transfer (e.g., the withdrawal)
        // The controller should handle deleting the other side.
        $response = $this->delete(route('transactions.destroy', $withdrawal));

        $response->assertRedirect(route('transactions.index'));

        // Assert both transactions are deleted
        $this->assertDatabaseMissing('transactions', ['id' => $withdrawal->id]);
        $this->assertDatabaseMissing('transactions', ['id' => $deposit->id]);
        
        $this->assertEquals(0, Transaction::count()); // Ensure both are gone
    }

    /** @test */
    public function transaction_creation_fails_with_missing_required_fields()
    {
        $requiredFields = [
            'date',
            'description',
            'amount',
            'type',
            'account_id',
        ];

        foreach ($requiredFields as $field) {
            $transactionData = [
                'date' => now()->format('Y-m-d'),
                'description' => 'Test Description',
                'amount' => 10000,
                'type' => 'income',
                'account_id' => $this->account->id,
            ];
            
            // Unset the current field to test its absence
            unset($transactionData[$field]);

            $response = $this->post(route('transactions.store'), $transactionData);
            
            // Using from() to be able to assert validation errors on specific fields
            // For this to work well, the controller would typically redirect back on validation failure.
            // Laravel does this by default for web routes.
            $response->assertSessionHasErrors($field);
        }
        
        // Ensure no transaction was actually created
        $this->assertEquals(0, Transaction::count());
    }
}
