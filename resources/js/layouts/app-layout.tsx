import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { PageProps, type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { flash } = usePage().props as unknown as PageProps;

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {flash?.success && <div className="mb-4 rounded bg-green-100 px-4 py-2 text-green-800">{flash.success}</div>}
            {flash?.error && <div className="mb-4 rounded bg-red-100 px-4 py-2 text-red-800">{flash.error}</div>}
            {flash?.message && <div className="mb-4 rounded bg-yellow-100 px-4 py-2 text-orange-800">{flash.message}</div>}

            {children}
        </AppLayoutTemplate>
    );
};
