import { Head, useForm } from '@inertiajs/react';

import { type BreadcrumbItem } from '@/types';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Category } from '@/types/models/categories';
import { Transition } from '@headlessui/react';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment Category Settings',
        href: '/settings/categories',
    },
];

interface Props {
    categories: Category[];
}

type CategoryForm = {
    name: string;
    parent_id: string;
};

export default function Categories({ categories }: Props) {
    const { data, setData, post, errors, processing, transform, recentlySuccessful, reset } = useForm<Required<CategoryForm>>({
        name: '',
        parent_id: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        transform((data) => ({ ...data, parent_id: data.parent_id === '__no_parent__' ? null : Number(data.parent_id) }));

        post(route('categories.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Category settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Payment Categories Settings" description="Manage the categories you can associate with transactions." />
                    <CategoriesTable categories={categories} />
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                placeholder="Category name"
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Parent ID</Label>

                            <Select onValueChange={(e) => setData('parent_id', e)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="parent category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__no_parent__">No Parent Category</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <InputError className="mt-2" message={errors.parent_id} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Create</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Created</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

function CategoriesTable({ categories }: { categories: Category[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {categories.map((cat) => (
                    <CategoryRow key={cat.id} category={cat} categories={categories} />
                ))}
            </TableBody>
        </Table>
    );
}

function CategoryRow({ category, categories }: { category: Category; categories: Category[] }) {
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, patch, clearErrors, processing, transform, errors } = useForm({
        name: category.name,
        parent_id: category.parent_id === null ? '__no_parent__' : String(category.parent_id),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        transform((data) => ({ ...data, parent_id: data.parent_id === '__no_parent__' ? null : Number(data.parent_id) }));

        patch(route('categories.update', category.id), {
            onSuccess: () => setIsEditing(false),
            preserveScroll: true,
        });
    };

    const handleCancel = () => {
        clearErrors();
        setData({ name: category.name, parent_id: String(category.parent_id) }); // Reset form to original values
        setIsEditing(false);
    };

    // Render the editing UI if isEditing is true
    if (isEditing) {
        return (
            <TableRow>
                <TableCell>
                    <Input id={`name-${category.id}`} value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full" />
                    <InputError message={errors.name} className="mt-2" />
                </TableCell>
                <TableCell>
                    <Select onValueChange={(e) => setData('parent_id', e)} defaultValue={data.parent_id}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="parent category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__no_parent__">No Parent Category</SelectItem>
                            {categories
                                .filter((cat) => cat.id !== category.id)
                                .map((cat) => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.parent_id} className="mt-2" />
                </TableCell>
                <TableCell className="space-x-2 text-right">
                    <Button onClick={submit} disabled={processing}>
                        Save
                    </Button>
                    <Button variant="ghost" onClick={handleCancel}>
                        Cancel
                    </Button>
                </TableCell>
            </TableRow>
        );
    }

    // Render the viewing UI by default
    return (
        <TableRow>
            <TableCell>{category.name}</TableCell>
            <TableCell>{category.parent?.name || category.parent_id}</TableCell>
            <TableCell className="text-right">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit
                </Button>
            </TableCell>
        </TableRow>
    );
}
