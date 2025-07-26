import InputError from '@/components/input-error';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from './label';

// Define generic props for the ReusableSelect component
interface ReusableSelectProps<T> {
    label: string; // The label displayed above the select (e.g., "Category", "Group")
    placeholder: string; // The placeholder text for the select trigger
    items: T[]; // The array of data objects (e.g., Category[], Group[], Account[])
    valueKey: keyof T; // The key in each item object to use as the SelectItem's value (e.g., 'id')
    labelKey: keyof T; // The key in each item object to use as the SelectItem's display label (e.g., 'name')
    selectedValue: string | number | null | undefined; // The currently selected value (from form data)
    onValueChange: (value: string) => void; // Callback when a new value is selected
    error: string | undefined; // Optional error message to display below the select
    groupLabel?: string; // Optional label for the SelectGroup (e.g., "Categories")
    showNoValueOption?: boolean; // Whether to include a "None" or "No Parent" option
    noValueOptionLabel?: string; // The label for the "No Value" option (e.g., "None", "No Parent")
    noValueOptionValue?: string; // The actual value for the "No Value" option (must be non-empty string)
    className?: string; // Optional className for the SelectTrigger
    disabled?: boolean; // Optional disabled state for the select
}

// Use a generic type T that extends an object with a string index signature
// This allows us to access properties using valueKey and labelKey
export function ReusableSelect<T extends { [key: string]: any }>({
    label,
    placeholder,
    items,
    valueKey,
    labelKey,
    selectedValue,
    onValueChange,
    error,
    groupLabel,
    showNoValueOption = false,
    noValueOptionLabel = 'None',
    noValueOptionValue = '__none__', // Sentinel value for "none"
    className,
    disabled = false,
}: ReusableSelectProps<T>) {
    // Ensure selectedValue is always a string for the Select component's value prop
    const internalSelectedValue = selectedValue === null || selectedValue === undefined || selectedValue === 0
        ? '' // Explicitly use an empty string to trigger the placeholder
        : String(selectedValue);

    // Handle the change event from the shadcn Select component
    const handleValueChange = (value: string) => {
        onValueChange(value);
    };

    return (
        <div className="grid gap-2">
            <Label htmlFor={`${label.toLowerCase().replace(/\s/g, '-')}-select`}>{label}</Label>
            <Select onValueChange={handleValueChange} value={internalSelectedValue} disabled={disabled}>
                <SelectTrigger id={`${label.toLowerCase().replace(/\s/g, '-')}-select`} className={className || 'w-[180px]'}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {groupLabel && (
                        <SelectGroup>
                            <SelectLabel>{groupLabel}</SelectLabel>
                        </SelectGroup>
                    )}
                    {showNoValueOption && <SelectItem value={noValueOptionValue}>{noValueOptionLabel}</SelectItem>}
                    {items.map((item) => (
                        <SelectItem
                            key={String(item[valueKey])} // Ensure key is a string
                            value={String(item[valueKey])} // Value must be a string
                        >
                            {String(item[labelKey])} {/* Display label as string */}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <InputError className="mt-2" message={error} />
        </div>
    );
}
