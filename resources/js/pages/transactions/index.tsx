import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Transaction } from '@/types/models/transactions';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transactions',
        href: '/transactions',
    },
];

interface Props {
    transactions: Transaction[];
}

export default function Index({ transactions }: Props) {
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
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell>{tx.description}</TableCell>
                                    <TableCell>{tx.category?.name ?? '-'}</TableCell>
                                    <TableCell>{tx.account?.name ?? '-'}</TableCell>
                                    <TableCell>{tx.formatted_amount}</TableCell>
                                    <TableCell>{new Date(tx.transaction_date).toDateString()}</TableCell>
                                    <TableCell>
                                        <Link href={`/transactions/${tx.id}/edit`}>
                                            <Button type="button" size={'sm'}>
                                                Edit
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="py-4 text-center text-gray-500">
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
