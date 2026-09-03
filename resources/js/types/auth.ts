export type User = {
    id: number;
    name: string;
    email: string;
    user_type?: string;
    roles?: string[];
    permissions?: string[];
    avatar?: string;
    email_verified_at?: string | null;
    two_factor_enabled?: boolean;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
};


export type Auth = {
    user: User;
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};

export type NotificationItem = {
    id: string;
    title: string;
    message: string;
    url: string;
    category: string;
    read_at: string | null;
    created_at_human: string;
};

export type SharedData = {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    notifications?: NotificationItem[];
    unread_notification_count?: number;
    flash?: { success?: string; error?: string };
    errors?: Record<string, string>;
    [key: string]: unknown;
};


