import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ConfigIndex() {
  return (
    <AppLayout breadcrumbs={[{ title: 'Configuration', href: '/config' }]}>
      <Head title="Configuration" />
      <div className="p-6 space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold">Configuration</h1>

        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Accounts</h2>
              <p className="text-sm text-muted-foreground">
                Manage your financial accounts
              </p>
            </div>
            <Button asChild>
              <Link href="/accounts">Manage</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Add more config sections as needed here */}
      </div>
    </AppLayout>
  );
}
