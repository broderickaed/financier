import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from '@inertiajs/react';
import { Account } from '@/types/models';
import { FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';

export default function AccountForm({ account }: { account?: Account }) {
  const editing = !!account;

  const { data, setData, post, put, processing, errors } = useForm({
    name: account?.name || '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    editing ? put(`/accounts/${account?.id}`) : post('/accounts');
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit Account' : 'Create Account'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className={cn(errors.name && "border-red-500")}
                disabled={processing}
                placeholder="Enter account name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={processing}>
              {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Save Changes' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
