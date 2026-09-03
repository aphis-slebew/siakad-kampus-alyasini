import { GraduationCap } from 'lucide-react';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-3 select-none">
            {/* Logo Badge */}
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white shadow-xs ring-2 ring-brand-primary/20">
                <GraduationCap className="size-5 text-amber-300" />
            </div>

            {/* Title & Campus Name */}
            <div className="flex flex-col text-left leading-none">
                <span className="font-bold text-sm tracking-tight text-text-primary flex items-center gap-1">
                    <span>SIAKAD</span>
                    <span className="inline-block size-1.5 rounded-full bg-brand-accent animate-pulse" />
                </span>
                <span className="text-[11px] font-medium text-text-secondary mt-0.5 tracking-wide">
                    STAI Al-Yasini
                </span>
            </div>
        </div>
    );
}
