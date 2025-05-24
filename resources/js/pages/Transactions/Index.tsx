import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Account, Transaction } from '@/types/models';
import { Head, Link } from '@inertiajs/react';

interface Props extends PageProps {
    transactions: (Transaction & {
        account: Account;
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
                                transactions.map((tx) => (
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
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
