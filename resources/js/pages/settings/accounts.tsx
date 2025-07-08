import { Head, useForm } from '@inertiajs/react';

import { type BreadcrumbItem } from '@/types';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Account } from '@/types/models/accounts';
import { Transition } from '@headlessui/react';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment Account Settings',
        href: '/settings/accounts',
    },
];

interface Props {
    accounts: Account[];
}

type AccountForm = {
    name: string;
    type: string;
};

export default function Accounts({ accounts }: Props) {
    const { data, setData, post, errors, processing, recentlySuccessful, reset } = useForm<Required<AccountForm>>({ name: '', type: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('accounts.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accounts settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Payment Account Settings" description="Manage the accounts you can associate with transactions." />
                    <AccountsTable accounts={accounts} />
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                placeholder="Account name"
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>

                            <Input
                                id="type"
                                className="mt-1 block w-full"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                required
                                placeholder="Account type"
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Create</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Created</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

function AccountsTable({ accounts }: { accounts: Account[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {accounts.map((account) => (
                    <AccountRow key={account.id} account={account} />
                ))}
            </TableBody>
        </Table>
    );
}

function AccountRow({ account }: { account: Account }) {
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, patch, clearErrors, processing, errors } = useForm({
        name: account.name,
        type: account.type,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('accounts.update', account.id), {
            onSuccess: () => setIsEditing(false),
            preserveScroll: true,
        });
    };

    const handleCancel = () => {
        clearErrors();
        setData({ name: account.name, type: account.type }); // Reset form to original values
        setIsEditing(false);
    };

    // Render the editing UI if isEditing is true
    if (isEditing) {
        return (
            <TableRow>
                <TableCell>
                    <Input id={`name-${account.id}`} value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full" />
                    <InputError message={errors.name} className="mt-2" />
                </TableCell>
                <TableCell>
                    <Input id={`type-${account.id}`} value={data.type} onChange={(e) => setData('type', e.target.value)} className="w-full" />
                    <InputError message={errors.type} className="mt-2" />
                </TableCell>
                <TableCell className="space-x-2 text-right">
                    <Button onClick={submit} disabled={processing}>
                        Save
                    </Button>
                    <Button variant="ghost" onClick={handleCancel}>
                        Cancel
                    </Button>
                </TableCell>
            </TableRow>
        );
    }

    // Render the viewing UI by default
    return (
        <TableRow>
            <TableCell>{account.name}</TableCell>
            <TableCell>{account.type}</TableCell>
            <TableCell className="text-right">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit
                </Button>
            </TableCell>
        </TableRow>
    );
}
