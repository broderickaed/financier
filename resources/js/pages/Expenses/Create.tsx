import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import ExpenseForm from './expenseForm';

export default function ExpenseCreate() {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Expenses', href: '/expenses' },
            { title: 'Create Expense', href: '/expenses/create' }
        ]}>
            <Head title="Create Expense" />
            <ExpenseForm />
        </AppLayout>
    );
}
