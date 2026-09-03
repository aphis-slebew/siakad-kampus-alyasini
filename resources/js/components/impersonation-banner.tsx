import { router, usePage } from '@inertiajs/react';
import { LogOut, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';

export function ImpersonationBanner() {
    const { props } = usePage<SharedData & { impersonation?: { is_impersonating?: boolean; impersonator_name?: string } }>();
    const isImpersonating = props.impersonation?.is_impersonating;
    const impersonatorName = props.impersonation?.impersonator_name || 'Superadmin';
    const currentUser = props.auth?.user;

    if (!isImpersonating) {
        return null;
    }

    const handleLeave = () => {
        router.post('/leave-impersonate');
    };

    return (
        <div className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 px-4 py-2 text-xs font-medium flex items-center justify-between shadow-xs sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <ShieldAlert className="size-4 text-slate-950 shrink-0" />
                <span>
                    Anda sedang mengakses sistem sebagai <strong>{currentUser?.name}</strong> ({currentUser?.roles?.[0] || currentUser?.user_type}).
                    Sesi asli: <strong>{impersonatorName}</strong>.
                </span>
            </div>

            <Button
                size="sm"
                variant="secondary"
                onClick={handleLeave}
                className="bg-slate-950 hover:bg-slate-900 text-white text-[11px] font-bold h-6 px-2.5 rounded flex items-center gap-1 shadow-xs shrink-0"
            >
                <LogOut className="size-3" />
                <span>Kembali ke Superadmin</span>
            </Button>
        </div>
    );
}
