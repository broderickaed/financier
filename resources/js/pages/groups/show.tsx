import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData, User } from '@/types';
import { Group } from '@/types/models/groups';
import { Guest } from '@/types/models/guests';
import { Transaction } from '@/types/models/transactions';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Groups',
        href: '/groups',
    },
    {
        title: 'Group Detail',
        href: '#',
    },
];

interface UnsettledBalance {
    participant: Guest | User;
    net_amount: number;
    portions_owed: number;
    paid: number;
}

interface Props extends SharedData {
    group: Group;
    members: User[];
    recentTransactions: Transaction[];
    unsettledBalances: UnsettledBalance[];
}

export default function Show({ group, unsettledBalances, auth }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Groups" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="absolute top-3 right-3">
                    <Link href={`/groups/${group.id}/edit`}>
                        <Button variant={'outline'}>Edit</Button>
                    </Link>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Members & Balances</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y divide-neutral-200">
                            {group.members?.length === 0 ? (
                                <li className="py-2 text-neutral-500">No members in this group.</li>
                            ) : (
                                group.members?.map((member) => {
                                    const balance = unsettledBalances.find((b) => b.participant.id === member.id);
                                    return (
                                        <li key={member.id} className="flex items-center gap-4 py-2">
                                            <div className="flex items-center gap-2">
                                                {member.id === auth.user.id && <Badge variant={'default'}>Me</Badge>}
                                                <span>{member.name}</span>
                                                <span className="text-sm text-neutral-500">{member.email}</span>
                                            </div>
                                            <div className="ml-auto text-sm">
                                                {balance ? (
                                                    <span>Balance: ${(balance.net_amount / 100).toFixed(2)}</span>
                                                ) : (
                                                    <span className="text-neutral-400">No balance</span>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                        {/* List remaining unsettled balance participants (not in group.members) */}
                        {unsettledBalances.filter((b) => !group.members?.some((m) => m.name === b.participant.name)).length > 0 && (
                            <div className="mt-4">
                                <div className="mb-2 text-sm font-semibold text-neutral-700">Other Participants</div>
                                <ul className="divide-y divide-neutral-200">
                                    {unsettledBalances
                                        .filter((b) => !group.members?.some((m) => m.name === b.participant.name))
                                        .map((balance) => (
                                            <li key={balance.participant.id} className="flex items-center gap-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <span>{'name' in balance.participant ? balance.participant.name : 'UNKNOWN NAME'}</span>
                                                </div>
                                                <div className="ml-auto text-sm">
                                                    <span>Balance: ${(balance.net_amount / 100).toFixed(2)}</span>
                                                </div>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
