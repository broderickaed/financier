import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Account, Transaction } from '@/types/models';
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
                    href: `/transactions/${transaction.id}`,
                },
            ]}
        >
            <Head title={`Transaction #${transaction.id}`} />
            <div className="max-w-xl space-y-4 p-4">
                <div>
                    <p className="text-muted-foreground text-sm">Date</p>
                    <p>{transaction.date}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-sm">Description</p>
                    <p>{transaction.description}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-sm">Amount</p>
                    <p>${(transaction.amount / 100).toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-sm">Type</p>
                    <p>{transaction.type}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-sm">Category</p>
                    <p>{transaction.category_id}</p>
                </div>
                <div>
                    <p className="text-muted-foreground text-sm">Account</p>
                    <p>{transaction.account.name}</p>
                </div>
                {transaction.to_account && (
                    <div>
                        <p className="text-muted-foreground text-sm">To Account</p>
                        <p>{transaction.to_account.name}</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
