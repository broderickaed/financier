import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Account, Split, Transaction } from '@/types/models';
import { Head, Link } from '@inertiajs/react';

interface Props extends PageProps {
    transactions: (Transaction & {
        account: Account;
        splits: Split[];
    })[];
}

export default function TransactionIndex({ transactions }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Transactions', href: '/transactions' }]}>
            <Head title="Transactions" />

            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
                    <Button asChild>
                        <Link href="/transactions/summary/category">Category Summary</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/transactions/summary/account">Account Summary</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/transactions/create">New Transaction</Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Account</TableHead>

                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-muted-foreground h-24 text-center">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((tx) => {
                                    const rows = [
                                        <TableRow key={tx.id}>
                                            <TableCell>{tx.date}</TableCell>
                                            <TableCell>{tx.description}</TableCell>
                                            <TableCell>{tx.type}</TableCell>
                                            <TableCell className={`font-medium ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                ${(tx.amount / 100).toFixed(2)}
                                            </TableCell>
                                            <TableCell>{tx.account?.name}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/transactions/${tx.id}/edit`}>Edit</Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/transactions/${tx.id}/splits/create`}>New Split</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>,
                                    ];
                                    if (tx.splits && tx.splits.length > 0) {
                                        const currentUserId = tx.user_id;
                                        const userSplit = tx.splits.find((s) => s.user_id === currentUserId);

                                        rows.push(
                                            <TableRow key={`${tx.id}-split`} className="bg-muted">
                                                <TableCell />
                                                <TableCell />
                                                <TableCell className="text-muted-foreground italic">My portion</TableCell>
                                                <TableCell className="font-medium">
                                                    {userSplit
                                                        ? `$${((userSplit.amount * (tx.amount / Math.abs(tx.amount))) / 100).toFixed(2)}`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell colSpan={2}>
                                                    {tx.splits
                                                        .filter((s) => s.user_id !== tx.user_id)
                                                        .map((split, idx) => (
                                                            <div key={split.id || idx} className="flex items-center gap-2">
                                                                <span className="text-muted-foreground text-sm">
                                                                    {split.name || `User ${split.user_id}`}:
                                                                </span>
                                                                <span>${((split.amount * (tx.amount / Math.abs(tx.amount))) / 100).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                </TableCell>
                                                <TableCell />
                                                <TableCell />
                                            </TableRow>,
                                        );
                                    }
                                    return rows;
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
