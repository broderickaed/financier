import { User } from '..';

export interface Guest {
    id: number;
    creator_id: number;
    name: string;
    created_at: string;
    updated_at: string;
    creator?: User;
}
