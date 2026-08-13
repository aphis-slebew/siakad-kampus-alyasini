import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-brand-primary text-white font-semibold text-xs tracking-wider">
                SY
            </div>
            <div className="ml-0.5 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-text-primary">
                    SIAKAD
                </span>
                <span className="truncate text-xs text-text-secondary">
                    STAI Al-Yasini
                </span>
            </div>
        </div>
    );
}

