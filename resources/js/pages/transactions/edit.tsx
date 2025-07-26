import { Button } from '@/components/ui/button';
import { ReusableDatePicker } from '@/components/ui/reusable-date-picker';
import { ReusableInput } from '@/components/ui/reusable-input';
import { ReusableSelect } from '@/components/ui/reusable-select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData, User } from '@/types';
import { Account } from '@/types/models/accounts';
import { Category } from '@/types/models/categories';
import { Group } from '@/types/models/groups';
import { Guest } from '@/types/models/guests';
import { Transaction } from '@/types/models/transactions';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { FormEventHandler } from 'react';
import { PayerSelect } from './payerselect';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transactions',
        href: '/transactions',
    },
    {
        title: 'Transaction Edit',
        href: '#',
    },
];

interface Props extends SharedData {
    groups: Group[];
    guests: Guest[];
    users: User[];
    accounts: Account[];
    categories: Category[];
    transaction: Transaction;
}

type TransactionForm = {
    payer_type: 'App\\Models\\User' | 'App\\Models\\Guest';
    payer_id: number;
    group_id: number;
    account_id: number;
    category_id: number;
    amount: number;
    transaction_date: Date;
    description: string;
};

export default function Edit({ auth, transaction, groups, guests, users, accounts, categories }: Props) {
    const {
        data,
        setData,
        patch,
        delete: destroy,
        errors,
        transform,
        processing,
        recentlySuccessful,
        reset,
    } = useForm<Required<TransactionForm>>({
        payer_type: transaction.payer_type,
        payer_id: transaction.payer_id,
        group_id: transaction.group_id,
        account_id: transaction.account_id,
        category_id: transaction.category_id,
        amount: transaction.amount_dollars,
        transaction_date: new Date(transaction.transaction_date),
        description: transaction.description,
    });

    // Handler for payer changes
    const handlePayerChange = (payerType: 'App\\Models\\User' | 'App\\Models\\Guest', payerId: number) => {
        setData((prevData) => ({
            ...prevData,
            payer_type: payerType,
            payer_id: payerId,
        }));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        transform((data) => ({ ...data, transaction_date: format(data.transaction_date, 'yyyy-MM-dd') }));

        patch(route('transactions.update', transaction.id), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Guest" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="absolute top-3 right-3">
                    <Link href="/transactions">
                        <Button variant={'outline'}>cancel</Button>
                    </Link>
                </div>
                <form onSubmit={submit} className="space-y-6">
                    <ReusableInput
                        label={'Description'}
                        value={data.description}
                        onChange={(e) => setData('description', e as string)}
                        error={errors.description}
                    />

                    <PayerSelect
                        label={'Payer'}
                        placeholder={'Select a payer'}
                        users={users}
                        guests={guests}
                        selectedPayerType={data.payer_type}
                        selectedPayerId={data.payer_id}
                        onPayerChange={handlePayerChange}
                        error={errors.payer_id || errors.payer_type}
                    />

                    <ReusableDatePicker
                        label={'Transaction Date'}
                        selectedValue={data.transaction_date}
                        onValueChange={(selected) => setData('transaction_date', selected || new Date())}
                        error={errors.transaction_date}
                    />

                    <ReusableInput
                        label={'Amount'}
                        value={data.amount}
                        type="number"
                        onChange={(e) => setData('amount', Number(e as number))}
                        error={errors.amount}
                    />

                    <ReusableSelect
                        label={'Category'}
                        placeholder={'Select a Category'}
                        items={categories}
                        valueKey={'id'}
                        labelKey={'name'}
                        selectedValue={data.category_id}
                        onValueChange={(value) => setData('category_id', Number(value))}
                        error={errors.category_id}
                    />

                    <ReusableSelect
                        label={'Account'}
                        placeholder={'Select a Account'}
                        items={accounts}
                        valueKey={'id'}
                        labelKey={'name'}
                        selectedValue={data.account_id}
                        onValueChange={(value) => setData('account_id', Number(value))}
                        error={errors.account_id}
                    />

                    <ReusableSelect
                        label={'Group'}
                        placeholder={'Select a Group'}
                        items={groups}
                        valueKey={'id'}
                        labelKey={'name'}
                        selectedValue={data.group_id}
                        onValueChange={(value) => setData('group_id', Number(value))}
                        error={errors.group_id}
                    />

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Save</Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">Saved</p>
                        </Transition>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant={'destructive'}
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this transaction?')) {
                                    destroy(route('transactions.destroy', transaction.id));
                                }
                            }}
                            disabled={processing}
                        >
                            Delete
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">Deleted</p>
                        </Transition>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
