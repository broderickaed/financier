import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Transaction, Account } from '@/types/models';
import { Head } from '@inertiajs/react';

interface Props extends PageProps {
  transaction: Transaction & { account: Account; to_account?: Account };
}

export default function TransactionShow({ transaction }: Props) {
  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Transactions', href: '/transactions' },
        {
          title: `Transaction #${transaction.id}`,
          href: `/transactions/${transaction.id}`
        }
      ]}
    >
      <Head title={`Transaction #${transaction.id}`} />
      <div className="p-4 space-y-4 max-w-xl">
        <div>
          <p className="text-sm text-muted-foreground">Date</p>
          <p>{transaction.date}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Description</p>
          <p>{transaction.description}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Amount</p>
          <p>${(transaction.amount / 100).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Type</p>
          <p>{transaction.type}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Account</p>
          <p>{transaction.account.name}</p>
        </div>
        {transaction.to_account && (
          <div>
            <p className="text-sm text-muted-foreground">To Account</p>
            <p>{transaction.to_account.name}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
