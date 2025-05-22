import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm, router } from '@inertiajs/react';
import { FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { LoaderCircle, Trash2 } from 'lucide-react';
import { type Expense } from '@/types/models';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type ExpenseFormData = {
  name: string;
  amount: string;
  date: string;
};

export default function ExpenseForm({ expense }: { expense?: Expense }) {
  const editing = !!expense;

  const { data, setData, processing, errors } = useForm({
    name: expense?.name || '',
    amount: expense ? (expense.amount / 100).toFixed(2) : '',
    date: expense?.date || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const url = editing ? `/expenses/${expense?.id}` : '/expenses';
    
    const formData = {
      name: data.name,
      amount: Math.round(parseFloat(data.amount) * 100),
      date: data.date,
    };

    if (editing) {
      router.put(url, formData);
    } else {
      router.post(url, formData);
    }
  };

  const handleDelete = () => {
    if (expense) {
      router.delete(`/expenses/${expense.id}`);
    }
  };

  const handleAmountChange = (value: string) => {
    // Only allow valid decimal numbers
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setData('amount', value);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{editing ? 'Edit Expense' : 'Create Expense'}</CardTitle>
          {editing && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete expense</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure you want to delete this expense?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete the expense.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => {}}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Expense Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className={cn(errors.name && "border-red-500")}
                disabled={processing}
                placeholder="Enter expense name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                value={data.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={cn(errors.amount && "border-red-500")}
                disabled={processing}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={data.date}
                onChange={(e) => setData('date', e.target.value)}
                className={cn(errors.date && "border-red-500")}
                disabled={processing}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={processing}>
              {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Save Changes' : 'Create Expense'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
