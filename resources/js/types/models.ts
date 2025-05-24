export interface Account {
    id: number;
    name: string;
    user_id: number;
    created_at: string;
    updated_at: string;
}
export interface Transaction {
    id: number;
    user_id: number;
    account_id: number;
    related_transaction_id?: number;
    category_id: number;
    date: string;
    description: string;
    amount: number;
    type: string;
    created_at: string;
    updated_at: string;
}
export interface Category {
    id: number;
    name: string;
    user_id: number;
    created_at: string;
    updated_at: string;
}
