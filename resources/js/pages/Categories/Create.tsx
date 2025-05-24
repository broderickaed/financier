import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import CategoryForm from './categoryForm';

export default function CategoryCreate() {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Config', href: '/config' },
                { title: 'Categories', href: '/categories' },
                { title: 'Create Category', href: '/categories/create' },
            ]}
        >
            <Head title="Create Account" />
            <CategoryForm />
        </AppLayout>
    );
}
