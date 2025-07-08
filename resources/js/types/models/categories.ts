import { User } from '..';

export interface Category {
    id: number;
    owner_id: number;
    name: string;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
    parent?: Category;
    owner?: User;
}
