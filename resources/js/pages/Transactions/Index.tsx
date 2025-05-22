import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Transaction, Account } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Props extends PageProps {
  transactions: (Transaction & {
    account: Account;
  })[];
}

export default function TransactionIndex({ transactions }: Props) {
  return (
    <AppLayout
      breadcrumbs={[{ title: 'Transactions', href: '/transactions' }]}
    >
      <Head title="Transactions" />

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
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
                <TableHead >Amount</TableHead>
                <TableHead>Account</TableHead>
             
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell className=" font-medium">
                      ${(tx.amount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>{tx.account?.name}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/transactions/${tx.id}/edit`}>
                          Edit
                        </Link>
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
