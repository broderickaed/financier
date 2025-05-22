import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Account } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil } from 'lucide-react';

export default function AccountShow({ account }: { account: Account }) {
  return (
    <AppLayout breadcrumbs={[
      { title: 'Accounts', href: '/accounts' },
      { title: account.name, href: `/accounts/${account.id}` },
    ]}>
      <Head title={account.name} />
      <div className="p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>{account.name}</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/accounts/${account.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Account
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Created on {new Date(account.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
