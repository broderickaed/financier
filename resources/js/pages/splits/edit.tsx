import { Button } from '@/components/ui/button';
import { ReusableInput } from '@/components/ui/reusable-input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData, User } from '@/types';
import { Guest } from '@/types/models/guests';
import { Split } from '@/types/models/splits';
import { Transaction } from '@/types/models/transactions';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo } from 'react';
import { ParticipantSelect } from './participantSelect';

interface Props extends SharedData {
    transaction: Transaction;
    splits: Split[];
    guests: Guest[];
    users: User[];
}

export default function Create({ transaction, splits, guests, users }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Transactions', href: '/transactions' },
        { title: `Transaction #${transaction.id}`, href: `/transactions/${transaction.id}` },
        { title: `Edit Splits`, href: `/transactions/${transaction.id}/splits/create` },
    ];

    const initialSplits = splits.map((split) => ({
        participant_id: String(split.participant_id),
        participant_type: split.participant_type,
        portion: split.portion_dollars || 0,
    }));

    const { data, setData, put, errors, processing, recentlySuccessful, reset, clearErrors } = useForm({
        splits: initialSplits,
    });

    // Convert transaction total to cents
    const transactionTotalCents = Math.round((transaction.amount_dollars || 0) * 100);

    // Convert all splits to cents and sum them
    const currentTotalCents = useMemo(() => {
        return data.splits.reduce((sum, split) => sum + Math.floor(split.portion * 100), 0);
    }, [data.splits]);

    // Calculate remaining cents, then derive dollar versions from that
    const remainingAmountCents = transactionTotalCents - currentTotalCents;
    const isBalanced = remainingAmountCents === 0;

    const transactionTotal = transactionTotalCents / 100;
    const currentTotal = currentTotalCents / 100;
    const remainingAmount = remainingAmountCents / 100;

    const addSplit = () => {
        setData('splits', [
            ...data.splits,
            { participant_id: '', participant_type: 'App\\Models\\User', portion: remainingAmount > 0 ? remainingAmount : 0 },
        ]);
    };

    const removeSplit = (index: number) => {
        const newSplits = [...data.splits];
        newSplits.splice(index, 1);
        setData('splits', newSplits);
        clearErrors();
    };

    const distributePortion = (index: number, amount: number) => {
        const newSplits = [...data.splits];
        newSplits[index].portion = amount;
        setData('splits', newSplits);
    };

    const distributeEvenly = () => {
        const perSplit = transactionTotal / data.splits.length;
        const newSplits = data.splits.map((split) => ({
            ...split,
            portion: perSplit,
        }));
        setData('splits', newSplits);
    };

    const autoBalance = () => {
        if (data.splits.length === 0) return;

        // Find the last split with a participant selected to add the remaining amount
        const lastValidSplitIndex = data.splits.findLastIndex((split) => split.participant_id && split.participant_type);

        if (lastValidSplitIndex >= 0) {
            const newSplits = [...data.splits];
            newSplits[lastValidSplitIndex].portion = newSplits[lastValidSplitIndex].portion + remainingAmount;
            setData('splits', newSplits);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Client-side validation
        if (!isBalanced) {
            return;
        }

        put(route('transactions.splits.update', transaction.id), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Splits" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="absolute top-3 right-3">
                    <Link href={`/transactions/${transaction.id}/edit`}>
                        <Button variant="outline">Cancel</Button>
                    </Link>
                </div>

                {/* Transaction Summary */}
                <div className="mb-6 rounded-lg bg-gray-50 p-4">
                    <h2 className="mb-2 text-lg font-semibold">Transaction Summary</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <div>
                            <span className="text-gray-600">Total Amount:</span>
                            <div className="font-medium">${transactionTotal.toFixed(2)}</div>
                        </div>
                        <div>
                            <span className="text-gray-600">Current Split Total:</span>
                            <div className={`font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>${currentTotal.toFixed(2)}</div>
                        </div>
                        <div>
                            <span className="text-gray-600">Remaining:</span>
                            <div
                                className={`font-medium ${Math.abs(remainingAmount) < 0.01 ? 'text-green-600' : remainingAmount > 0 ? 'text-orange-600' : 'text-red-600'}`}
                            >
                                ${remainingAmount.toFixed(2)}
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-600">Status:</span>
                            <div className={`font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                                {isBalanced ? '✓ Balanced' : '⚠ Unbalanced'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Balance validation error */}
                {!isBalanced && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-sm text-red-700">
                            The splits must total exactly ${transactionTotal.toFixed(2)}. Current total is ${currentTotal.toFixed(2)}(
                            {remainingAmount > 0 ? `$${remainingAmount.toFixed(2)} under` : `$${Math.abs(remainingAmount).toFixed(2)} over`}).
                        </p>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {data.splits.map((split, index) => (
                        <div key={index} className="mb-4 space-y-2 border-b pb-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Split #{index + 1}</h3>
                                <div className="flex gap-2">
                                    {remainingAmount > 0 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => distributePortion(index, split.portion + remainingAmount)}
                                            title="Add remaining amount to this split"
                                        >
                                            +${remainingAmount.toFixed(2)}
                                        </Button>
                                    )}
                                    {data.splits.length > 1 && (
                                        <Button type="button" variant="destructive" size="sm" onClick={() => removeSplit(index)}>
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <ParticipantSelect
                                label="Participant"
                                placeholder="Select a participant"
                                selectedType={split.participant_type}
                                selectedId={Number(split.participant_id)}
                                onChange={(type, id) => {
                                    const newSplits = [...data.splits];
                                    newSplits[index].participant_id = String(id);
                                    newSplits[index].participant_type = type;
                                    setData('splits', newSplits);
                                }}
                                participantGroups={[
                                    { label: 'Users', type: 'App\\Models\\User', data: users },
                                    { label: 'Guests', type: 'App\\Models\\Guest', data: guests },
                                ]}
                                error={(errors as any)[`splits.${index}.participant_type`] ?? (errors as any)[`splits.${index}.participant_id`]}
                            />

                            <ReusableInput
                                label="Portion ($)"
                                type="number"
                                value={split.portion || ''}
                                onChange={(e) => {
                                    const newSplits = [...data.splits];
                                    let value = parseFloat(String(e));

                                    if (!isNaN(value)) {
                                        value = Math.trunc(value * 100) / 100;
                                    } else {
                                        value = 0;
                                    }

                                    newSplits[index].portion = value;
                                    setData('splits', newSplits);
                                }}
                                error={(errors as any)[`splits.${index}.portion`]}
                            />
                        </div>
                    ))}

                    <div className="flex flex-wrap items-center gap-2">
                        <Button type="button" variant="outline" onClick={addSplit}>
                            Add Split
                        </Button>

                        {data.splits.length > 1 && (
                            <Button type="button" variant="outline" onClick={distributeEvenly}>
                                Split Evenly
                            </Button>
                        )}

                        {!isBalanced && Math.abs(remainingAmount) > 0.01 && (
                            <Button type="button" variant="outline" onClick={autoBalance}>
                                Auto Balance
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing || !isBalanced} type="submit">
                            {processing ? 'Saving...' : 'Save Splits'}
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">Saved!</p>
                        </Transition>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
