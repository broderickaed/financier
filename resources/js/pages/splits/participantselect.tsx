import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

type ParticipantType = 'App\\Models\\User' | 'App\\Models\\Guest';

type Participant = {
    id: number;
    name: string;
};

type ParticipantGroup = {
    label: string;
    type: ParticipantType;
    data: Participant[];
};

interface ParticipantSelectProps {
    label: string;
    placeholder: string;
    participantGroups: ParticipantGroup[];
    selectedType: ParticipantType;
    selectedId: number;
    onChange: (type: ParticipantType, id: number) => void;
    error?: string;
    className?: string;
    disabled?: boolean;
}

const createValue = (type: ParticipantType, id: number): string => `${type}:${id}`;

const parseValue = (value: string): { type: ParticipantType; id: number } => {
    const [type, idStr] = value.split(':');
    return { type: type as ParticipantType, id: parseInt(idStr, 10) };
};

export function ParticipantSelect({
    label,
    placeholder,
    participantGroups,
    selectedType,
    selectedId,
    onChange,
    error,
    className,
    disabled = false,
}: ParticipantSelectProps) {
    const currentValue = selectedId ? createValue(selectedType, selectedId) : '';

    const handleValueChange = (value: string) => {
        if (value) {
            const { type, id } = parseValue(value);
            onChange(type, id);
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
                    {participantGroups.map(
                        ({ label, type, data }) =>
                            data.length > 0 && (
                                <SelectGroup key={type}>
                                    <SelectLabel>{label}</SelectLabel>
                                    {data.map((p) => (
                                        <SelectItem key={`${type}-${p.id}`} value={createValue(type, p.id)}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            ),
                    )}
                </SelectContent>
            </Select>
            <InputError className="mt-2" message={error} />
        </div>
    );
}
