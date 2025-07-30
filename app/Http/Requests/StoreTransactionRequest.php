<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Models\Guest;
use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // We'll handle authorization in the rules
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'payer_type' => [
                'required',
                'in:' . User::class . ',' . Guest::class,
            ],
            'payer_id' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) {
                    $payerType = $this->input('payer_type');
                    if ($payerType === User::class && !User::where('id', $value)->exists()) {
                        $fail('Selected payer user does not exist.');
                    } elseif ($payerType === Guest::class && !Guest::where('id', $value)->exists()) {
                        $fail('Selected payer guest does not exist.');
                    }
                },
            ],
            'group_id' => [
                'required',
                'integer',
                'exists:groups,id',
                function ($attribute, $value, $fail) {
                    if (!$this->user()->groups()->where('groups.id', $value)->exists()) {
                        $fail('You do not have access to this group.');
                    }
                }
            ],
            'account_id' => [
                'required',
                'integer',
                'exists:accounts,id',
                function ($attribute, $value, $fail) {
                    if (!$this->user()->accounts()->where('id', $value)->exists()) {
                        $fail('You do not have access to this account.');
                    }
                }
            ],
            'category_id' => [
                'required',
                'integer',
                'exists:categories,id',
                function ($attribute, $value, $fail) {
                    if (!$this->user()->categories()->where('id', $value)->exists()) {
                        $fail('You do not have access to this category.');
                    }
                }
            ],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'transaction_date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * Get the validated data from the request with amount converted to cents.
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);

        // Convert amount to cents if it exists
        if (isset($validated['amount'])) {
            $validated['amount'] = (int) ($validated['amount'] * 100);
        }

        return $validated;
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        // You can add additional validation logic here if needed
        $validator->after(function ($validator) {
            // Any additional validation that needs to run after the main rules
        });
    }
}
