import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Guest } from '@/types/models/guests';
import { formatDateTime } from '@/utils/dateFormatter';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Guests',
        href: '/guests',
    },
];

interface Props {
    guests: Guest[];
}

export default function Index({ guests }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Guests" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="absolute top-3 right-3">
                    <Link href="/guests/create">
                        <Button variant={'outline'}>+</Button>
                    </Link>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Guest Name</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {guests.length > 0 ? (
                            guests.map((g) => (
                                <TableRow key={g.id}>
                                    <TableCell className="font-medium">{g.name}</TableCell>
                                    <TableCell>{formatDateTime(g.created_at)}</TableCell>
                                    <TableCell>
                                        <Link href={`/guests/${g.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                Manage
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="py-4 text-center text-gray-500">
                                    No guests found.{' '}
                                    <Link href="/guests/create" className="text-blue-500 hover:underline">
                                        Create one?
                                    </Link>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
