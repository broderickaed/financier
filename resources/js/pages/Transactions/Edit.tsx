import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Account, Category, Transaction } from '@/types/models';
import { Head } from '@inertiajs/react';
import TransactionForm from './transactionForm';

interface Props extends PageProps {
    accounts: Account[];
    categories: Category[];
    transaction: Transaction;
    relatedAccount?: Account;
}

export default function TransactionEdit({ accounts, categories, transaction, relatedAccount }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Transactions', href: '/transactions' },
        {
            title: `Edit Transaction ID#${transaction.id}`,
            href: `/transactions/${transaction.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Transaction" />
            <TransactionForm accounts={accounts} categories={categories} transaction={transaction} relatedAccount={relatedAccount} />
        </AppLayout>
    );
}
