import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Guests',
        href: '/guests',
    },
    {
        title: 'Guests New',
        href: '/guests/create',
    },
];

type GuestForm = {
    name: string;
};

export default function Create() {
    const { data, setData, post, errors, processing, recentlySuccessful, reset } = useForm<Required<GuestForm>>({ name: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('guests.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Guest" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="absolute top-3 right-3">
                    <Link href="/guests">
                        <Button variant={'outline'}>cancel</Button>
                    </Link>
                </div>
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>

                        <Input
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            placeholder="Guest name"
                        />

                        <InputError className="mt-2" message={errors.name} />
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
        </AppLayout>
    );
}
