import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Category } from '@/types/models';
import { Head } from '@inertiajs/react';
import CategoryForm from './categoryForm';

interface Props extends PageProps {
    category: Category;
}

export default function CategoryEdit({ category }: Props) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Config', href: '/config' },
                { title: 'Categories', href: '/categories' },
                { title: `Edit ${category.name}`, href: `/category/${category.id}/edit` },
            ]}
        >
            <Head title={`Edit ${category.name}`} />
            <CategoryForm category={category} />
        </AppLayout>
    );
}
