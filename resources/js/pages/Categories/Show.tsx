import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Category } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface Props extends PageProps {
    category: Category;
}

export default function CategoryShow({ category }: Props) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Config', href: '/config' },
                { title: 'Categories', href: '/categories' },
                { title: category.name, href: `/categories/${category.id}` },
            ]}
        >
            <Head title={category.name} />
            <div className="p-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>{category.name}</CardTitle>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/categories/${category.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Category
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="text-muted-foreground text-sm">Created on {new Date(category.created_at).toLocaleDateString()}</div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
