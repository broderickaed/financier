import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

// Define props for the ReusableInput component
interface ReusableInputProps {
    label: string; // The label displayed above the input field
    value: string | number; // The current value of the input (can be string or number)
    // onChange now takes a unified change handler
    onChange: (value: string | number) => void;
    type?: React.HTMLInputTypeAttribute; // HTML input type (e.g., 'text', 'number', 'email', 'password')
    placeholder?: string; // The placeholder text for the input
    error: string | undefined; // Optional error message to display below the input
    className?: string; // Optional className for the Input component
    required?: boolean; // Optional boolean to make the input required
    disabled?: boolean; // Optional boolean to disable the input
    autoComplete?: string; // Optional autoComplete attribute
    min?: number; // Optional min attribute for number inputs
    max?: number; // Optional max attribute for number inputs
    step?: number; // Optional step attribute for number inputs
}

export function ReusableInput({
    label,
    value,
    onChange, // Now takes the parsed value directly
    type = 'text',
    placeholder,
    error,
    className,
    required = false,
    disabled = false,
    autoComplete,
    min,
    max,
    step,
}: ReusableInputProps) {

    // Internal handler to convert string from event to number if type is 'number'
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        if (type === 'number') {
            // Convert to number, or NaN if empty/invalid.
            // Using parseFloat to handle decimals.
            const parsedValue = parseFloat(inputValue);
            // Pass NaN if empty string, or the number
            onChange(isNaN(parsedValue) && inputValue !== '' ? '' : parsedValue);
        } else {
            onChange(inputValue);
        }
    };

    return (
        <div className="grid gap-2">
            <Label htmlFor={label}>{label}</Label>
            <Input
                id={label}
                type={type}
                className={`mt-1 block w-full ${className || ''}`}
                // Value should be treated as string for display in input field
                value={String(value)}
                onChange={handleChange} // Use our internal handleChange
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                autoComplete={autoComplete}
                min={min}
                max={max}
                step={step}
            />
            {error && <InputError className="mt-2" message={error} />}
        </div>
    );
}