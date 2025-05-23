import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Account, Category } from '@/types/models';
import { Head } from '@inertiajs/react';
import TransactionForm from './transactionForm';

interface Props extends PageProps {
    accounts: Account[];
    categories: Category[];
}

export default function TransactionCreate({ accounts, categories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Transactions', href: '/transactions' },
        { title: 'Create Transaction', href: '/transactions/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Transaction" />
            <TransactionForm accounts={accounts} categories={categories} />
        </AppLayout>
    );
}
