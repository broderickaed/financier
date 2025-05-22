import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { Account } from '@/types/models';

export default function AccountForm({ account }: { account?: Account }) {
  const editing = !!account;

  const { data, setData, post, put, processing, errors } = useForm({
    name: account?.name || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editing ? put(`/accounts/${account?.id}`) : post('/accounts');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 max-w-md">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => setData('name', e.target.value)}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>
      <Button type="submit" disabled={processing}>
        {editing ? 'Save Changes' : 'Create Account'}
      </Button>
    </form>
  );
}
