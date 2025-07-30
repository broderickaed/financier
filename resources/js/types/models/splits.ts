import { User } from '..';
import { Guest } from './guests';

export interface Split {
    id: number;
    transaction_id: number;
    participant_id: number;
    participant_type: 'App\\Models\\User' | 'App\\Models\\Guest';
    portion: number;
    portion_dollars?: number;
    formatted_portion?: string;
    settled_at: Date | null;
    settled_by_transaction_id: number | null;
    created_at: string;
    updated_at: string;
    participant?: User | Guest;
}
