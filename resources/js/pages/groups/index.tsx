import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Group } from '@/types/models/groups';
import { formatDateTime } from '@/utils/dateFormatter';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Groups',
        href: '/groups',
    },
];

interface Props extends SharedData {
    groups: Group[];
}

export default function Index({ groups, auth }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Groups" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="absolute top-3 right-3">
                    <Link href="/groups/create">
                        <Button variant={'outline'}>+</Button>
                    </Link>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Group Name</TableHead>
                            <TableHead>Creator</TableHead>
                            <TableHead>Members</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groups.length > 0 ? (
                            groups.map((g) => (
                                <TableRow key={g.id}>
                                    <TableCell className="font-medium">{g.name}</TableCell>
                                    <TableCell>{g.creator?.name || g.creator_id}</TableCell>
                                    <TableCell>{g.members_count || 'unknown'}</TableCell>
                                    <TableCell>{formatDateTime(g.created_at)}</TableCell>
                                    <TableCell>
                                        {g.creator_id === auth.user.id && (
                                            <Link href={`/groups/${g.id}`}>
                                                <Button variant="outline" size="sm">
                                                    View
                                                </Button>
                                            </Link>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="py-4 text-center text-gray-500">
                                    No groups found.{' '}
                                    <Link href="/groups/create" className="text-blue-500 hover:underline">
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
