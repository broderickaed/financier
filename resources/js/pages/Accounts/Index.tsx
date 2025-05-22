import AppLayout from '@/layouts/app-layout';
import { Account } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface Props {
  accounts: Account[];
}

export default function AccountIndex({ accounts }: Props) {
  return (
    <AppLayout breadcrumbs={[{ title: 'Accounts', href: '/accounts' }]}>
      <Head title="Accounts" />
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Accounts</h1>
          <Button asChild>
            <Link href="/accounts/create">New Account</Link>
          </Button>
        </div>
        <ul className="space-y-2">
          {accounts.map((account) => (
            <li key={account.id} className="p-4 border rounded-lg flex justify-between items-center">
              <span>{account.name}</span>
              <Link href={`/accounts/${account.id}/edit`} className="text-blue-600 hover:underline">
                Edit
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AppLayout>
  );
}
