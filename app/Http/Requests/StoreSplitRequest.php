<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSplitRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'splits' => ['required', 'array'],
            'splits.*.participant_id' => ['required', 'integer'],
            'splits.*.participant_type' => ['required', 'string'],
            'splits.*.portion' => ['required', 'numeric'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $splits = $this->input('splits', []);
            $seen = [];

            foreach ($splits as $index => $split) {
                if (!isset($split['participant_id'], $split['participant_type'])) {
                    continue;
                }

                $key = $split['participant_type'] . '-' . $split['participant_id'];

                if (in_array($key, $seen)) {
                    $validator->errors()->add(
                        "splits.{$index}.participant_id",
                        'The combination of participant_id and participant_type must be unique.'
                    );
                    break;
                }

                $seen[] = $key;
            }
        });
    }
}
