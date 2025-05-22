import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import ExpenseForm from './expenseForm';
import { type Expense } from '@/types/models';

export default function ExpenseEdit({ expense }: { expense: Expense }) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Expenses', href: '/expenses' },
            { title: `Edit ${expense.name}`, href: `/expenses/${expense.id}/edit` }
        ]}>
            <Head title={`Edit ${expense.name}`} />
            <ExpenseForm expense={expense} />
        </AppLayout>
    );
}
