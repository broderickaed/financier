import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Account } from '@/types/models';
import { Head } from '@inertiajs/react';

import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartConfig = {
    previousMonthSpend: {
        label: 'Previous Month',
        color: 'oklch(0 0 164.12)',
    },
    currentMonthSpend: {
        label: 'Current (Actual)',
        color: 'oklch(0.3694 0 164.12)',
    },
    projectedAdditional: {
        label: 'Additional Projected',
        color: 'oklch(0.77 0 164.12)',
    },
} satisfies ChartConfig;

interface AccountSummary {
    account_id: number;
    total: number;
    account: Account;
}

interface Projection {
    account_id: number;
    projected_total: number;
    account: Account;
}

interface Props extends PageProps {
    currentMonth: AccountSummary[];
    previousMonth: AccountSummary[];
    projection: Projection[];
}

const formatCurrencyForDisplay = (valueInCents: number) => {
    const amount = Math.abs(valueInCents) / 100;
    return `$${amount.toFixed(2)}`;
};

export default function SummaryByAccountPage({ auth, currentMonth, previousMonth, projection }: Props) {
    const allAccountsMap = new Map<number, { id: number; name: string }>();

    [...previousMonth, ...currentMonth, ...projection].forEach((item) => {
        if (item && item.account && !allAccountsMap.has(item.account.id)) {
            allAccountsMap.set(item.account.id, { id: item.account.id, name: item.account.name });
        }
    });

    const processedData = Array.from(allAccountsMap.values()).map((acc) => {
        const prevData = previousMonth.find((p) => p.account.id === acc.id);
        const currData = currentMonth.find((c) => c.account.id === acc.id);
        const projData = projection.find((p) => p.account.id === acc.id);

        const absPreviousMonthSpend = Math.abs(prevData ? prevData.total : 0);
        const absActualCurrentSpend = Math.abs(currData ? currData.total : 0);
        const absTotalProjectedForCurrentMonth = Math.abs(projData ? projData.projected_total : 0);

        const additionalProjectedSpendMagnitude = Math.max(0, absTotalProjectedForCurrentMonth - absActualCurrentSpend);

        return {
            accountName: acc.name,
            accountId: acc.id,
            previousMonthSpend: absPreviousMonthSpend,
            currentMonthSpend: absActualCurrentSpend,
            projectedAdditional: additionalProjectedSpendMagnitude,
            currentMonthTotalProjectedMagnitude: absTotalProjectedForCurrentMonth,
        };
    });

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Transactions', href: '/transactions' },
                { title: `Summary by Account`, href: `/transactions/summary/account` },
            ]}
        >
            <Head title={`Transaction Summary by Account`} />

            <div className="space-y-6 p-4 md:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Spending by Account (Magnitudes)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {processedData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                <BarChart accessibilityLayer data={processedData} barSize={40} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="accountName" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis tickFormatter={(value) => formatCurrencyForDisplay(value)} />
                                    <ChartLegend content={<ChartLegendContent />} />

                                    <Bar dataKey="previousMonthSpend" fill="var(--color-previousMonthSpend)" radius={4} />
                                    <Bar dataKey="currentMonthSpend" fill="var(--color-currentMonthSpend)" stackId="currentMonth" radius={4} />
                                    <Bar dataKey="projectedAdditional" fill="var(--color-projectedAdditional)" stackId="currentMonth" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">No data available to display the chart.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Detailed Summary (Magnitudes)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table className="mt-0">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Previous Month</TableHead>
                                    <TableHead>Current (Actual)</TableHead>
                                    <TableHead>Current (Projected Total)</TableHead>
                                    <TableHead className="text-right">Projected Comparison</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {processedData.length > 0 ? (
                                    processedData.map((item) => (
                                        <TableRow key={item.accountId}>
                                            <TableCell>{item.accountName}</TableCell>
                                            <TableCell>{formatCurrencyForDisplay(item.previousMonthSpend)}</TableCell>
                                            <TableCell>{formatCurrencyForDisplay(item.currentMonthSpend)}</TableCell>
                                            <TableCell>{formatCurrencyForDisplay(item.currentMonthTotalProjectedMagnitude)}</TableCell>
                                            <TableCell className="text-right">
                                                {item.previousMonthSpend > 0
                                                    ? Math.round((item.currentMonthTotalProjectedMagnitude / item.previousMonthSpend) * 100)
                                                    : 0}
                                                %
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-gray-500 dark:text-gray-400">
                                            No summary data available.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
