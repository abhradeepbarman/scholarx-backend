interface IUser {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    refresh_token?: string | null;
    created_at: Date | string | null;
    updated_at: Date | string | null;
}
