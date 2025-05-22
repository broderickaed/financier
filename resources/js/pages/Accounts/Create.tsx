import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AccountForm from './accountForm';

export default function AccountCreate() {
  return (
    <AppLayout breadcrumbs={[{ title: 'Accounts', href: '/accounts' }, { title: 'Create Account', href: '/accounts/create' }]}>
      <Head title="Create Account" />
      <AccountForm />
    </AppLayout>
  );
}
