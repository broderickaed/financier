import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types';
import { Guest } from '@/types/models/guests';

interface PayerSelectProps {
    label: string;
    placeholder: string;
    users: User[];
    guests: Guest[];
    selectedPayerType: 'App\\Models\\User' | 'App\\Models\\Guest';
    selectedPayerId: number;
    onPayerChange: (payerType: 'App\\Models\\User' | 'App\\Models\\Guest', payerId: number) => void;
    error?: string;
    className?: string;
    disabled?: boolean;
}

// Helper function to create a unique value for the select
const createPayerValue = (type: 'App\\Models\\User' | 'App\\Models\\Guest', id: number): string => {
    return `${type}:${id}`;
};

// Helper function to parse the payer value back to type and id
const parsePayerValue = (value: string): { type: 'App\\Models\\User' | 'App\\Models\\Guest'; id: number } => {
    const [type, idString] = value.split(':');
    return {
        type: type as 'App\\Models\\User' | 'App\\Models\\Guest',
        id: parseInt(idString, 10),
    };
};

export function PayerSelect({
    label,
    placeholder,
    users,
    guests,
    selectedPayerType,
    selectedPayerId,
    onPayerChange,
    error,
    className,
    disabled = false,
}: PayerSelectProps) {
    // Create the current selected value
    const currentValue = selectedPayerId ? createPayerValue(selectedPayerType, selectedPayerId) : '';

    const handleValueChange = (value: string) => {
        if (value) {
            const { type, id } = parsePayerValue(value);
            onPayerChange(type, id);
        }
    };

    return (
        <div className="grid gap-2">
            <Label htmlFor={`${label.toLowerCase().replace(/\s/g, '-')}-select`}>{label}</Label>
            <Select onValueChange={handleValueChange} value={currentValue} disabled={disabled}>
                <SelectTrigger id={`${label.toLowerCase().replace(/\s/g, '-')}-select`} className={className || 'w-[180px]'}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {users.length > 0 && (
                        <SelectGroup>
                            <SelectLabel>Users</SelectLabel>
                            {users.map((user) => (
                                <SelectItem key={`user-${user.id}`} value={createPayerValue('App\\Models\\User', user.id)}>
                                    {user.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    )}

                    {guests.length > 0 && (
                        <SelectGroup>
                            <SelectLabel>Guests</SelectLabel>
                            {guests.map((guest) => (
                                <SelectItem key={`guest-${guest.id}`} value={createPayerValue('App\\Models\\Guest', guest.id)}>
                                    {guest.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    )}
                </SelectContent>
            </Select>
            <InputError className="mt-2" message={error} />
        </div>
    );
}
