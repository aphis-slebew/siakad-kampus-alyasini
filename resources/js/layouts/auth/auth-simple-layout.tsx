import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50/80 via-slate-50 to-teal-50/60 relative overflow-hidden flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans selection:bg-emerald-100 selection:text-emerald-900">
            {/* Ambient Warm Blur Circles */}
            <div className="absolute -top-32 -left-32 size-96 rounded-full bg-emerald-300/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-amber-300/15 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-128 rounded-full bg-teal-200/10 blur-3xl pointer-events-none" />

            {/* Top Navigation Bar */}
            <header className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between py-2">
                <Link
                    href="/"
                    className="flex items-center gap-3 transition-opacity hover:opacity-90 group"
                >
                    <AppLogoIcon className="size-10" />
                    <div className="flex flex-col text-left">
                        <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                            <span>SIAKAD</span>
                            <span className="inline-block size-2 rounded-full bg-amber-500 animate-pulse" />
                        </span>
                        <span className="text-xs font-semibold text-emerald-800 -mt-0.5">
                            STAI Al-Yasini Pasuruan
                        </span>
                    </div>
                </Link>

                <Link
                    href="/"
                    className="text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/70 hover:bg-white border border-slate-200/80 shadow-2xs"
                >
                    <span>&larr; Beranda Utama</span>
                </Link>
            </header>

            {/* Center Main Card */}
            <main className="relative z-10 w-full max-w-lg mx-auto my-auto py-6">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-100/80 shadow-xl shadow-emerald-950/5 p-6 sm:p-8 space-y-6">
                    {/* Header Text */}
                    <div className="text-center space-y-1.5 border-b border-slate-100 pb-5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px] font-bold mb-2 shadow-2xs">
                            <svg className="size-3.5 text-emerald-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 22h16" />
                                <path d="M2 11h20" />
                                <path d="M12 2l10 9H2l10-9z" />
                                <path d="M6 11v11" />
                                <path d="M10 11v11" />
                                <path d="M14 11v11" />
                                <path d="M18 11v11" />
                            </svg>
                            <span>Portal Akademik Terpadu</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                            {title || 'Masuk ke Akun Anda'}
                        </h1>
                        {description && (
                            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Form Content */}
                    <div>
                        {children}
                    </div>
                </div>
            </main>

            {/* Institutional Footer */}
            <footer className="relative z-10 text-center py-4 text-xs text-slate-500 space-y-1">
                <p className="font-medium">
                    &copy; {new Date().getFullYear()} STAI Al-Yasini Pasuruan &bull; Terakreditasi BAN-PT & Kopertais Wilayah IV
                </p>
                <p className="text-[11px] text-slate-400">
                    Sistem Informasi Akademik Berbasis Standar PD-DIKTI Neo Feeder
                </p>
            </footer>
        </div>
    );
}
