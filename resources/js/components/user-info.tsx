import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white font-bold text-xs shadow-xs">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-xs leading-tight">
                <span className="truncate font-bold text-slate-900">{user.name}</span>
                {showEmail && (
                    <span className="truncate text-[11px] font-medium text-slate-600">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
