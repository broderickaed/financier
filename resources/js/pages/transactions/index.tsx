import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Split } from '@/types/models/splits';
import { Transaction } from '@/types/models/transactions';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transactions',
        href: '/transactions',
    },
];

interface Props extends SharedData {
    transactions: Transaction[];
}

export default function Index({ auth, transactions }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="absolute top-3 right-3">
                    <Link href="/transactions/create">
                        <Button variant={'outline'}>+</Button>
                    </Link>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>My Portion</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <React.Fragment key={tx.id}>
                                    <TableRow>
                                        <TableCell className="font-medium">{tx.description}</TableCell>
                                        <TableCell>{tx.category?.name ?? '-'}</TableCell>
                                        <TableCell>{tx.account?.name ?? '-'}</TableCell>
                                        <TableCell className="font-semibold">{tx.formatted_amount}</TableCell>
                                        <TableCell>{new Date(tx.transaction_date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {tx.splits && tx.splits.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {tx.splits
                                                        .filter(
                                                            (split) =>
                                                                split.participant_id === auth.user.id &&
                                                                split.participant_type === 'App\\Models\\User',
                                                        )
                                                        .map((split: Split, idx: number) => (
                                                            <Badge
                                                                key={split.id || idx}
                                                                variant={split.settled_at ? 'default' : 'secondary'}
                                                                className="text-xs"
                                                            >
                                                                {split.formatted_portion}
                                                            </Badge>
                                                        ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">No splits</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/transactions/${tx.id}/edit`}>
                                                <Button type="button" size={'sm'}>
                                                    Edit
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="py-4 text-center text-gray-500">
                                    No transactions found.{' '}
                                    <Link href="/transactions/create" className="text-blue-500 hover:underline">
                                        Create one?
                                    </Link>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
