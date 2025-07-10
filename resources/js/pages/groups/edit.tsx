import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Group } from '@/types/models/groups';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Groups',
        href: '/groups',
    },
    {
        title: 'Edit Group',
        href: '#',
    },
];

type GroupForm = {
    name: string;
};

interface Props {
    group: Group;
}

export default function Edit({ group }: Props) {
    const { auth } = usePage<SharedData>().props;
    const { data, setData, patch, errors, processing, recentlySuccessful, reset } = useForm<Required<GroupForm>>({ name: group.name || '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('groups.update', group.id), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Group" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="absolute top-3 right-3">
                    <Link href="/groups">
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
                            placeholder="Group name"
                        />

                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Update</Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">Updated</p>
                        </Transition>
                    </div>
                </form>
                <Card>
                    <CardHeader>
                        <CardTitle>Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y divide-neutral-200">
                            {group.members?.length === 0 ? (
                                <li className="py-2 text-neutral-500">No members in this group.</li>
                            ) : (
                                group.members?.map((member) => (
                                    <li key={member.id} className="flex items-center gap-2 py-2">
                                        {member.id === auth.user.id ? (
                                            <Badge variant={'default'}>Me</Badge>
                                        ) : (
                                            <>
                                                <span>{member.name}</span>
                                                <span className="text-sm text-neutral-500">{member.email}</span>
                                            </>
                                        )}
                                    </li>
                                ))
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
