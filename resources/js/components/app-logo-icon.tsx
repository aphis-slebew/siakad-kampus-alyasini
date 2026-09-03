import { GraduationCap } from 'lucide-react';
import type { HTMLAttributes } from 'react';

export default function AppLogoIcon({ className = 'size-9', ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`aspect-square flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white shadow-md ring-2 ring-brand-primary/20 shrink-0 ${className}`}
            {...props}
        >
            <GraduationCap className="size-5/8 text-amber-300 drop-shadow-xs" />
        </div>
    );
}
