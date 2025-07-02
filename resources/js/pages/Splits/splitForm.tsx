import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types/models';
import { Link, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, PlusCircle, Trash2 } from 'lucide-react';
import { FormEvent, useMemo } from 'react';

interface SplitItem {
    id: string; // For unique key in React list
    user_id: string | null; // User ID (if splitting with a registered user other than self)
    name: string; // Name (if not a registered user, or for a general category)
    amount: string; // Input as string (dollars.cents)
    note: string;
}

interface SplitsFormData {
    splits: SplitItem[]; // These are splits for OTHERS
    [key: string]: any;
}

const formatCurrency = (cents: number | null | undefined): string => {
    if (cents === null || cents === undefined) return '$0.00';
    const dollars = cents / 100;
    if (dollars < 0) {
        return `-$${Math.abs(dollars).toFixed(2)}`;
    }
    return `$${dollars.toFixed(2)}`;
};

export default function SplitsForm({ transaction }: { transaction: Transaction }) {
    const { props } = usePage(); // Access the current page props
    const pageErrors = props.errors as Record<string, string>; // Type assertion for safety
    console.log('Page Errors:', pageErrors);

    const { data, setData, transform, post, processing, errors, clearErrors, setError } = useForm<SplitsFormData>({
        splits: [], // Start with no explicit splits for others; user adds them if needed
    });

    const absoluteTransactionAmountCents = useMemo(() => Math.abs(transaction.amount), [transaction.amount]);
    const authenticatedUserId = transaction.user_id; // The user performing the split

    const handleSplitChange = <K extends keyof Omit<SplitItem, 'id'>>(index: number, field: K, value: SplitItem[K]) => {
        const updatedSplits = data.splits.map((split, i) => (i === index ? { ...split, [field]: value } : split));

        if (field === 'user_id' && value === String(authenticatedUserId)) {
            setError(`splits.${index}.user_id`, "You don't need to add yourself; your share is calculated automatically.");
            // Don't clear here if this is the immediate cause of the error
        } else if (field === 'user_id' && errors[`splits.${index}.user_id`]) {
            // Only clear the user_id error if they change the user_id field
            clearErrors(`splits.${index}.user_id`);
        }

        if (field === 'name' && value) {
            updatedSplits[index].user_id = null; // Clear user_id if name is typed
            if (errors[`splits.${index}.user_id`]) {
                clearErrors(`splits.${index}.user_id`); // Clear related user_id error if name is now used
            }
        } else if (field === 'user_id' && value) {
            updatedSplits[index].name = ''; // Clear name if user_id is selected
            if (errors[`splits.${index}.name`]) {
                clearErrors(`splits.${index}.name`); // Clear related name error if user_id is now used
            }
        }

        setData('splits', updatedSplits);
        // Clear the error for the specific field being changed *only if it exists*.
        // This is generally handled well by useForm internally on subsequent valid input.
        // The check `if (errors[`splits.${index}.${field}`])` before clearErrors is already good.
        if (errors[`splits.${index}.${field}`]) {
            // @ts-ignore
            clearErrors(`splits.${index}.${field}`);
        }
        if (errors.splits_total) {
            // @ts-ignore
            clearErrors('splits_total'); // This should likely only be cleared on new submission or if the condition is met.
        }
    };

    const handleSplitAmountChange = (index: number, value: string) => {
        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
            handleSplitChange(index, 'amount', value);
        }
    };

    const addSplitRow = () => {
        setData('splits', [...data.splits, { id: crypto.randomUUID(), user_id: null, name: '', amount: '', note: '' }]);
    };

    const removeSplitRow = (idToRemove: string) => {
        // No minimum rows, can remove all explicit splits, meaning full amount goes to auth user
        setData(
            'splits',
            data.splits.filter((split) => split.id !== idToRemove),
        );
    };

    const totalExplicitSplitAmountCents = useMemo(() => {
        return data.splits.reduce((total, split) => {
            const amountCents = Math.round(parseFloat(split.amount || '0') * 100);
            return total + amountCents;
        }, 0);
    }, [data.splits]);

    // This is the amount that will be automatically assigned to the authenticated user
    const amountForAuthenticatedUserCents = useMemo(() => {
        return absoluteTransactionAmountCents - totalExplicitSplitAmountCents;
    }, [absoluteTransactionAmountCents, totalExplicitSplitAmountCents]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (amountForAuthenticatedUserCents < 0) {
            setError('splits_total', 'The total amount assigned to others cannot exceed the transaction amount.');
            return;
        }
        if (errors.splits_total) clearErrors('splits_total' as any);

        transform((formData) => {
            const finalSplitsPayload = formData.splits.map((split) => {
                const splitAmountCents = Math.round(parseFloat(split.amount || '0') * 100);
                let finalUserId: number | null = null;
                let finalName: string | null = split.name || null;

                if (split.user_id) {
                    const parsedUserId = parseInt(split.user_id, 10);
                    if (!isNaN(parsedUserId)) {
                        finalUserId = parsedUserId;
                    } else {
                        finalName = split.user_id;
                        finalUserId = null;
                    }
                }

                return {
                    user_id: finalUserId,
                    name: finalName,
                    amount: splitAmountCents,
                    note: split.note || null,
                };
            });

            // Add the authenticated user's share if it's positive
            if (amountForAuthenticatedUserCents > 0) {
                finalSplitsPayload.push({
                    user_id: authenticatedUserId,
                    name: null,
                    amount: amountForAuthenticatedUserCents,
                    note: 'Automatically assigned share',
                });
            } else if (formData.splits.length === 0 && absoluteTransactionAmountCents > 0) {
                finalSplitsPayload.push({
                    user_id: authenticatedUserId,
                    name: null,
                    amount: absoluteTransactionAmountCents,
                    note: 'Full transaction amount',
                });
            }

            return {
                ...formData,
                splits: finalSplitsPayload,
            };
        });
        post(route('transactions.splits.store', transaction.id));
    };

    const isSubmitDisabled = useMemo(() => {
        if (processing) return true;
        if (amountForAuthenticatedUserCents < 0) return true; // Explicit splits exceed total
        // Check if any explicit split has an invalid amount (0 or negative)
        if (data.splits.some((s) => !s.amount || parseFloat(s.amount) <= 0)) return true;
        return false;
    }, [processing, amountForAuthenticatedUserCents, data.splits]);

    return (
        <div className="py-12">
            <pre>{JSON.stringify(errors, null, 2)}</pre>
            <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Split Transaction: <span className="font-normal">{transaction.description}</span>
                        </CardTitle>
                        <CardDescription>
                            Original Transaction Amount: <span className="font-semibold">{formatCurrency(transaction.amount)}</span>
                            <br />
                            Total Amount to Split: <span className="font-semibold">{formatCurrency(absoluteTransactionAmountCents)}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {errors.splits_total && (
                            <div className="mb-4 rounded-md border border-red-300 bg-red-100 p-3 text-red-700">{errors.splits_total}</div>
                        )}
                        {/* Display general error for 'splits' array if it's a string and not field specific */}
                        {errors.splits && typeof errors.splits === 'string' && (
                            <div className="mb-4 rounded-md border border-red-300 bg-red-100 p-3 text-red-700">{errors.splits}</div>
                        )}

                        <p className="text-muted-foreground mb-4 text-sm">
                            Add splits for other people or categories. Any remaining amount will be automatically assigned to you ({'Your Share'}).
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {data.splits.length > 0 &&
                                data.splits.map((split, index) => (
                                    <Card key={split.id} className="bg-slate-50 p-4 dark:bg-slate-800/50">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h4 className="text-md font-medium">Assign to Other #{index + 1}</h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeSplitRow(split.id)}
                                                className="text-red-500 hover:text-red-700"
                                                aria-label="Remove this split assignment"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {/* Inputs for name, user_id (if applicable), amount, note */}
                                        <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`split_name_${index}`}>Split For (Name)</Label>
                                                <Input
                                                    id={`split_name_${index}`}
                                                    value={split.name}
                                                    onChange={(e) => handleSplitChange(index, 'name', e.target.value)}
                                                    disabled={processing || !!split.user_id}
                                                    placeholder="e.g., John Doe, Groceries"
                                                    className={cn(errors[`splits.${index}.name`] && 'border-red-500')}
                                                />
                                                {errors[`splits.${index}.name`] && (
                                                    <p className="text-xs text-red-500">{errors[`splits.${index}.name`]}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`split_user_id_${index}`}>Or User ID (Optional)</Label>
                                                <Input
                                                    id={`split_user_id_${index}`}
                                                    value={split.user_id || ''}
                                                    onChange={(e) => handleSplitChange(index, 'user_id', e.target.value)}
                                                    disabled={processing || !!split.name}
                                                    placeholder="Enter registered User ID"
                                                    type="number" // Or text if it can be other identifiers
                                                    className={cn(errors[`splits.${index}.user_id`] && 'border-red-500')}
                                                />
                                                {errors[`splits.${index}.user_id`] && (
                                                    <p className="text-xs text-red-500">{errors[`splits.${index}.user_id`]}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`split_amount_${index}`}>Amount ($)</Label>
                                                <Input
                                                    id={`split_amount_${index}`}
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={split.amount}
                                                    onChange={(e) => handleSplitAmountChange(index, e.target.value)}
                                                    disabled={processing}
                                                    placeholder="0.00"
                                                    className={cn(errors[`splits.${index}.amount`] && 'border-red-500')}
                                                />
                                                {errors[`splits.${index}.amount`] && (
                                                    <p className="text-xs text-red-500">{errors[`splits.${index}.amount`]}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`split_note_${index}`}>Note (Optional)</Label>
                                                <Textarea
                                                    id={`split_note_${index}`}
                                                    value={split.note}
                                                    onChange={(e) => handleSplitChange(index, 'note', e.target.value)}
                                                    disabled={processing}
                                                    rows={1}
                                                    className={cn(errors[`splits.${index}.note`] && 'border-red-500')}
                                                />
                                                {errors[`splits.${index}.note`] && (
                                                    <p className="text-xs text-red-500">{errors[`splits.${index}.note`]}</p>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}

                            <Button type="button" variant="outline" onClick={addSplitRow} disabled={processing} className="w-full sm:w-auto">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Assignment to Other
                            </Button>

                            <div className="mt-6 space-y-2 border-t pt-4 dark:border-slate-700">
                                <p className="text-md flex justify-between">
                                    <span>Total Assigned to Others:</span>
                                    <span className="font-semibold">{formatCurrency(totalExplicitSplitAmountCents)}</span>
                                </p>
                                <p
                                    className={cn(
                                        'text-md flex justify-between font-semibold',
                                        amountForAuthenticatedUserCents < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400',
                                    )}
                                >
                                    <span>Your Share (auto-calculated):</span>
                                    <span>
                                        {amountForAuthenticatedUserCents < 0
                                            ? `Error: Over by ${formatCurrency(Math.abs(amountForAuthenticatedUserCents))}`
                                            : formatCurrency(amountForAuthenticatedUserCents)}
                                    </span>
                                </p>
                                {amountForAuthenticatedUserCents < 0 && (
                                    <p className="text-sm text-red-500 dark:text-red-400">
                                        The amount assigned to others exceeds the total transaction amount. Please adjust.
                                    </p>
                                )}
                            </div>

                            <CardFooter className="flex justify-end space-x-3 p-0 pt-6">
                                <Link href={route('dashboard') as string}>
                                    <Button variant="outline" type="button" disabled={processing}>
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={isSubmitDisabled}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Splits
                                </Button>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
