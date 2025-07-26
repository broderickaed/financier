import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label'; // Assuming Label is also part of the form field
import InputError from '@/components/input-error'; // To display errors consistently
import { format } from 'date-fns'; // For date formatting
import { Calendar as CalendarIcon } from 'lucide-react'; // Icon

// Define props for the ReusableDatePicker component
interface ReusableDatePickerProps {
    label: string; // The label displayed above the date picker (e.g., "Transaction Date")
    placeholder?: string; // The placeholder text for the button (e.g., "Pick a date")
    selectedValue: Date | undefined; // The currently selected Date object (from form data)
    onValueChange: (date: Date | undefined) => void; // Callback when a new date is selected
    error: string | undefined; // Optional error message to display below the picker
    className?: string; // Optional className for the button
    disabled?: boolean; // Optional disabled state for the picker
}

export function ReusableDatePicker({
    label,
    placeholder = 'Pick a date',
    selectedValue,
    onValueChange,
    error,
    className,
    disabled = false,
}: ReusableDatePickerProps) {
    // Generate a unique ID for the label and input for accessibility
    const uniqueId = React.useId(); // React 18+ hook for unique IDs

    return (
        <div className="grid gap-2">
            <Label htmlFor={uniqueId}>{label}</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        data-empty={!selectedValue} // Used for styling when no date is selected
                        className={`data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal ${className || ''}`}
                        id={uniqueId} // Link button to label
                        disabled={disabled}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedValue ? format(selectedValue, 'PPP') : <span>{placeholder}</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedValue}
                        onSelect={onValueChange} // Directly pass the onValueChange callback
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
             <InputError className="mt-2" message={error} />
        </div>
    );
}