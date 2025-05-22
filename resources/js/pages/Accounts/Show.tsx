import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Account } from '@/types/models';
import { Button } from '@/components/ui/button';

export default function AccountShow({ account }: { account: Account }) {
  return (
    <AppLayout breadcrumbs={[
      { title: 'Accounts', href: '/accounts' },
      { title: account.name, href: `/accounts/${account.id}` },
    ]}>
      <Head title={account.name} />
      <div className="p-4 space-y-4 max-w-xl">
        <h1 className="text-2xl font-bold">{account.name}</h1>
        <Button asChild>
          <Link href={`/accounts/${account.id}/edit`}>Edit</Link>
        </Button>
      </div>
    </AppLayout>
  );
}
