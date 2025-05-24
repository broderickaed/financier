import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Category } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import { Pencil, PlusCircle } from 'lucide-react';

interface Props {
    categories: Category[];
}

export default function CategoryIndex({ categories }: Props) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Config', href: '/config' },
                { title: 'Categories', href: '/categories' },
            ]}
        >
            <Head title="Categories" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <Button asChild>
                        <Link href="/categories/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Category
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="w-24">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>{category.name}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/categories/${category.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {categories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-muted-foreground text-center">
                                            No categories found. Create your first category to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
