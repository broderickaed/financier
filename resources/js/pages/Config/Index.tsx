import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

export default function ConfigIndex() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Configuration', href: '/config' }]}>
            <Head title="Configuration" />
            <div className="max-w-2xl space-y-6 p-6">
                <h1 className="text-2xl font-bold">Configuration</h1>

                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <h2 className="text-lg font-semibold">Accounts</h2>
                            <p className="text-muted-foreground text-sm">Manage your financial accounts</p>
                        </div>
                        <Button asChild>
                            <Link href="/accounts">Manage</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <h2 className="text-lg font-semibold">Categories</h2>
                            <p className="text-muted-foreground text-sm">Manage your transaction categories</p>
                        </div>
                        <Button asChild>
                            <Link href="/categories">Manage</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Add more config sections as needed here */}
            </div>
        </AppLayout>
    );
}
