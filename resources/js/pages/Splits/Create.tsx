import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Transaction } from '@/types/models';
import { Head } from '@inertiajs/react';
import SplitsForm from './splitForm';

interface Props extends PageProps {
    transaction: Transaction;
}

export default function SplitCreate({ transaction }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Transactions', href: '/transactions' },
        { title: `Transaction ${transaction.id}`, href: `/transactions/${transaction.id}` },
        { title: `Split Transaction ${transaction.id}`, href: `/transactions/${transaction.id}/splits/create` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Transaction" />
            <SplitsForm transaction={transaction} />
        </AppLayout>
    );
}
