import { User } from '..';
import { Account } from './accounts';
import { Category } from './categories';
import { Group } from './groups';
import { Guest } from './guests';
import { Split } from './splits';

export interface Transaction {
    id: string;
    payer_type: 'App\\Models\\User' | 'App\\Models\\Guest';
    payer_id: number;
    creator_id: number;
    group_id: number;
    account_id: number;
    category_id: number;
    amount: number;
    amount_dollars: number;
    formatted_amount: string;
    transaction_date: string;
    description: string;
    created_at: string;
    updated_at: string;

    payer?: Guest | User;
    creator?: User;
    group?: Group;
    account?: Account;
    category?: Category;
    splits?: Split[];
}
