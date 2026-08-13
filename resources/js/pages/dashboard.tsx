import { Head, usePage } from '@inertiajs/react';
import { BookOpen, Building2, Calendar, FileCheck, GraduationCap, Users } from 'lucide-react';
import type { SharedData } from '@/types';

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    const stats = [
        {
            title: 'Mahasiswa Aktif',
            value: '1.248',
            subtext: 'Semester Ganjil 2026/2027',
            icon: GraduationCap,
            color: 'bg-brand-primary/10 text-brand-primary',
        },
        {
            title: 'Dosen Pengajar',
            value: '64',
            subtext: '3 Program Studi (S1)',
            icon: Users,
            color: 'bg-brand-primary/10 text-brand-primary',
        },

        {
            title: 'Program Studi',
            value: '3',
            subtext: 'PAI, PBA, PGMI',
            icon: Building2,
            color: 'bg-status-success/10 text-status-success',
        },
        {
            title: 'Tahun Ajaran Aktif',
            value: '2026/2027',
            subtext: 'Periode Ganjil',
            icon: Calendar,
            color: 'bg-brand-primary/10 text-brand-primary',
        },
    ];

    return (
        <>
            <Head title="Dashboard Utama" />

            <div className="p-6 space-y-6">
                {/* Welcome Card */}
                <div className="rounded-lg border border-border-default bg-surface-card p-6 shadow-xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-text-primary">
                                Selamat Datang, {user?.name || 'Pengguna'}
                            </h1>
                            <p className="mt-1 text-sm text-text-secondary">
                                Sistem Informasi Akademik STAI Al-Yasini Pasuruan. Kelola kegiatan akademik dan perwalian secara terpadu.
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 rounded-md bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold text-brand-primary">
                            <span className="size-2 rounded-full bg-status-success" />
                            Sistem Normal
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.title} className="rounded-lg border border-border-default bg-surface-card p-4 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-text-secondary">{stat.title}</span>
                                <div className={`p-2 rounded-md ${stat.color}`}>
                                    <stat.icon className="size-4" />
                                </div>
                            </div>
                            <div className="mt-2">
                                <span className="text-2xl font-semibold text-text-primary">{stat.value}</span>
                                <p className="text-xs text-text-secondary mt-0.5">{stat.subtext}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Info & Guidelines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-lg border border-border-default bg-surface-card p-5 shadow-xs">
                        <div className="flex items-center gap-2 mb-3">
                            <FileCheck className="size-4 text-brand-primary" />
                            <h2 className="text-sm font-semibold text-text-primary">Informasi Masa Perwalian & KRS</h2>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Pengisian dan pengajuan KRS Mahasiswa untuk Semester Ganjil 2026/2027 dibuka sesuai kalender akademik. Wajib menyelesaikan registrasi ulang dan pelunasan UKT sebelum mengajukan KRS.
                        </p>
                    </div>

                    <div className="rounded-lg border border-border-default bg-surface-card p-5 shadow-xs">
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="size-4 text-brand-accent" />
                            <h2 className="text-sm font-semibold text-text-primary">Panduan & Bantuan Sistem</h2>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Jika terdapat kendala akses menu atau data akademik yang tidak pas, silakan hubungi bagian Administrasi Akademik (BAA) atau Staf IT STAI Al-Yasini.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};
