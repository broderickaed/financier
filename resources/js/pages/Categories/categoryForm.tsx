import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Category } from '@/types/models';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEvent } from 'react';

export default function CategoryForm({ category }: { category?: Category }) {
    const editing = !!category;

    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        editing ? put(`/categories/${category?.id}`) : post('/categories');
    };

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle>{editing ? 'Edit Category' : 'Create Category'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={cn(errors.name && 'border-red-500')}
                                disabled={processing}
                                placeholder="Enter category name"
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {editing ? 'Save Changes' : 'Create Category'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
