import { Link } from '@inertiajs/react';
import type {
    LucideIcon} from 'lucide-react';
import {
    Building2,
    Calendar,
    CalendarDays,
    BookOpen,
    ChevronDown,
    DoorOpen,
    GraduationCap,
    Landmark
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface MasterSection {
    href: string;
    label: string;
    icon: LucideIcon;
    desc: string;
}

export const MASTER_SECTIONS: MasterSection[] = [
    {
        href: '/master/perguruan-tinggi',
        label: 'Perguruan Tinggi',
        icon: Landmark,
        desc: 'Identitas institusi & akreditasi',
    },
    {
        href: '/master/fakultas',
        label: 'Fakultas',
        icon: Building2,
        desc: 'Unit struktural fakultas & dekan',
    },
    {
        href: '/master/program-studi',
        label: 'Program Studi',
        icon: GraduationCap,
        desc: 'Jurusan, jenjang, & kaprodi',
    },
    {
        href: '/master/tahun-ajaran',
        label: 'Tahun Ajaran & Periode',
        icon: Calendar,
        desc: 'Semester akademik & kalender',
    },
    {
        href: '/master/kalender-akademik',
        label: 'Kalender Akademik',
        icon: CalendarDays,
        desc: 'Agenda kegiatan perkuliahan',
    },
    {
        href: '/master/ruang-kuliah',
        label: 'Ruang Kuliah',
        icon: DoorOpen,
        desc: 'Gedung & kapasitas kelas',
    },
    {
        href: '/master/referensi-biodata',
        label: 'Referensi Biodata',
        icon: BookOpen,
        desc: 'Tipe & kamus referensi sistem',
    },
];

export function MasterDataNav({
    currentHref,
    compact = false,
}: {
    currentHref: string;
    compact?: boolean;
}) {
    const activeSection =
        MASTER_SECTIONS.find((sec) => sec.href === currentHref) ||
        MASTER_SECTIONS[0];
    const ActiveIcon = activeSection.icon;

    if (compact) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-card border border-border-default text-text-primary text-xs font-semibold hover:border-brand-primary hover:text-brand-primary transition shadow-2xs cursor-pointer h-9"
                    >
                        <ActiveIcon className="size-3.5 text-brand-primary" />
                        <span>{activeSection.label}</span>
                        <ChevronDown className="size-3 text-text-secondary" />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64 p-1.5">
                    <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Pindah Master Data
                    </DropdownMenuLabel>
                    {MASTER_SECTIONS.map((sec) => {
                        const Icon = sec.icon;
                        const isCurrent = sec.href === currentHref;

                        return (
                            <DropdownMenuItem asChild key={sec.href}>
                                <Link
                                    href={sec.href}
                                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                                        isCurrent
                                            ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-100'
                                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon
                                        className={`size-4 shrink-0 ${
                                            isCurrent
                                                ? 'text-emerald-600'
                                                : 'text-slate-400'
                                        }`}
                                    />
                                    <div className="flex flex-col">
                                        <span>{sec.label}</span>
                                        <span className="text-[10px] text-slate-400 font-normal">
                                            {sec.desc}
                                        </span>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <div className="flex items-center gap-2 text-xs text-slate-500 font-sans select-none">
            <Link
                href="/dashboard"
                className="hover:text-slate-900 transition-colors"
            >
                Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Master Data</span>
            <span className="text-slate-300">/</span>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold hover:border-emerald-500 hover:text-emerald-700 transition shadow-2xs cursor-pointer"
                    >
                        <ActiveIcon className="size-3.5 text-emerald-600" />
                        <span>{activeSection.label}</span>
                        <ChevronDown className="size-3 text-slate-400" />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-64 p-1.5">
                    <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Pindah Master Data
                    </DropdownMenuLabel>
                    {MASTER_SECTIONS.map((sec) => {
                        const Icon = sec.icon;
                        const isCurrent = sec.href === currentHref;

                        return (
                            <DropdownMenuItem asChild key={sec.href}>
                                <Link
                                    href={sec.href}
                                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                                        isCurrent
                                            ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-100'
                                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon
                                        className={`size-4 shrink-0 ${
                                            isCurrent
                                                ? 'text-emerald-600'
                                                : 'text-slate-400'
                                        }`}
                                    />
                                    <div className="flex flex-col">
                                        <span>{sec.label}</span>
                                        <span className="text-[10px] text-slate-400 font-normal">
                                            {sec.desc}
                                        </span>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
