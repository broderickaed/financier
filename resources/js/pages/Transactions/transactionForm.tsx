import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { LoaderCircle, Trash2 } from 'lucide-react';
import { router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { cn } from '@/lib/utils';
import type { Account, Transaction } from '@/types/models';

export default function TransactionForm({
  accounts,
  transaction,
  relatedAccount
}: {
  accounts: Account[];
  transaction?: Transaction;
  relatedAccount?: Account;
}) {
  const editing = !!transaction;

  const { data, setData, processing, errors } = useForm({
    date: transaction?.date.split('T')[0] || new Date().toISOString().split('T')[0],
    description: transaction?.description || '',
    amount: transaction ? (transaction.amount / 100).toFixed(2) : '',
    type: transaction?.type || 'expense',
    account_id: transaction?.account_id?.toString() || '',
    related_account_id: relatedAccount?.id?.toString() || ''
  });

  const handleChange = <T extends keyof typeof data>(field: T, value: typeof data[T]) => {
    setData(field, value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const url = editing ? `/transactions/${transaction?.id}` : '/transactions';

    const formData = {
      date: data.date,
      description: data.description,
      amount: Math.round(parseFloat(data.amount) * 100),
      type: data.type,
      account_id: parseInt(data.account_id),
      related_account_id: data.related_account_id ? parseInt(data.related_account_id) : undefined
    };

    if (editing) {
      router.put(url, formData);
    } else {
      router.post(url, formData);
    }
  };

  const handleDelete = () => {
    if (transaction) {
      router.delete(`/transactions/${transaction.id}`);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{editing ? 'Edit Transaction' : 'Create Transaction'}</CardTitle>
          {editing && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete transaction</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure you want to delete this transaction?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete the transaction.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="secondary">Cancel</Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={data.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={cn(errors.date && 'border-red-500')}
                disabled={processing}
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={data.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={cn(errors.description && 'border-red-500')}
                disabled={processing}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                value={data.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                    handleChange('amount', value);
                  }
                }}
                className={cn(errors.amount && 'border-red-500')}
                disabled={processing}
                placeholder="0.00"
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={data.type}
                onValueChange={(value) => handleChange('type', value)}
                disabled={processing}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_id">From Account</Label>
              <Select
                value={data.account_id}
                onValueChange={(value) => handleChange('account_id', value)}
                disabled={processing}
              >
                <SelectTrigger id="account_id">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={String(account.id)}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.account_id && <p className="text-sm text-red-500">{errors.account_id}</p>}
            </div>

            {data.type === 'transfer' && (
              <div className="space-y-2">
                <Label htmlFor="related_account_id">Related Account</Label>
                <Select
                  value={data.related_account_id}
                  onValueChange={(value) => handleChange('related_account_id', value)}
                  disabled={processing}
                >
                  <SelectTrigger id="related_account_id">
                    <SelectValue placeholder="Select related account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={String(account.id)}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.related_account_id && (
                  <p className="text-sm text-red-500">{errors.related_account_id}</p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={processing}>
              {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Save Changes' : 'Create Transaction'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
