
export interface Account {
    id: number;
    name: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    users: User[];
    _count: {
        users: number;
        tags: number;
    };
}


export interface User {
    id: number;
    accountId: number;
    name: string | null;
    userName: string;
    email: string | null;
    role: string;
    isVerified: boolean;
    createdAt: string;
}