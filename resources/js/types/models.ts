export interface Account {
    id: number;
    name: string;
    user_id: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface Expense {
    id: number;
    name: string;
    date: string;
    amount: number; // stored as cents (integer)
    user_id: number;
    created_at: string;
    updated_at: string;
}