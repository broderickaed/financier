import { User } from '..';

export interface Group {
    id: number;
    creator_id: number;
    name: string;
    created_at: string;
    updated_at: string;
    creator?: User;
    members_count?: number;
    members?: User[];
}
