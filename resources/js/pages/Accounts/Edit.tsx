import AppLayout from '@/layouts/app-layout';
import { Account } from '@/types/models';
import { Head } from '@inertiajs/react';
import AccountForm from './accountForm';

export default function AccountEdit({ account }: { account: Account }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Config', href: '/config' },
                { title: 'Accounts', href: '/accounts' },
                { title: `Edit ${account.name}`, href: `/accounts/${account.id}/edit` },
            ]}
        >
            <Head title={`Edit ${account.name}`} />
            <AccountForm account={account} />
        </AppLayout>
    );
}
