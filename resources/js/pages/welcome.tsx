import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    FileCheck,
    GraduationCap,
    LogIn,
    Phone,
    Shield,
    Sparkles,
    UserCheck,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    const prodis = [
        {
            kode: 'PAI',
            jenjang: 'S1',
            nama: 'Pendidikan Agama Islam',
            akreditasi: 'Baik Sekali (LAMDIK)',
            deskripsi: 'Mencetak sarjana pendidikan Islam yang berakhlak karimah, kompeten, dan unggul dalam teknologi pembelajaran.',
            icon: BookOpen,
            color: 'from-emerald-600 to-emerald-800',
        },
        {
            kode: 'ES',
            jenjang: 'S1',
            nama: 'Ekonomi Syariah',
            akreditasi: 'Terakreditasi BAN-PT',
            deskripsi: 'Mengembangkan keilmuan ekonomi Islam, perbankan syariah, dan kewirausahaan berbasis nilai-nilai pesantren.',
            icon: Award,
            color: 'from-amber-600 to-amber-800',
        },
        {
            kode: 'PGMI',
            jenjang: 'S1',
            nama: 'Pendidikan Guru Madrasah Ibtidaiyah',
            akreditasi: 'Baik Sekali (LAMDIK)',
            deskripsi: 'Menyiapkan pendidik profesional untuk tingkat dasar/madrasah ibtidaiyah yang kreatif, berdaya saing, dan berjiwa santri.',
            icon: GraduationCap,
            color: 'from-teal-600 to-teal-800',
        },
    ];

    return (
        <>
            <Head title="SIAKAD — STAI Al-Yasini Pasuruan" />

            <div className="min-h-screen bg-surface-base font-sans text-text-primary flex flex-col">
                {/* Navbar */}
                <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border-default shadow-xs">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        {/* Logo & Institute Name */}
                        <div className="flex items-center gap-3">
                            <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white shadow-xs">
                                <GraduationCap className="size-6 text-amber-300" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-base tracking-tight text-text-primary">
                                    SIAKAD STAI AL-YASINI
                                </span>
                                <span className="text-[11px] text-text-secondary">
                                    Institut Agama Islam Pasuruan
                                </span>
                            </div>
                        </div>

                        {/* Navigation Actions */}
                        <div className="flex items-center gap-3">
                            <Link href="/pmb/daftar">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="hidden sm:inline-flex border-brand-primary text-brand-primary hover:bg-emerald-50 text-xs font-semibold"
                                >
                                    Pendaftaran PMB
                                </Button>
                            </Link>

                            {user ? (
                                <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-primary-dark text-white shadow-xs font-semibold px-4 text-xs">
                                    <Link href="/dashboard">
                                        Buka Dashboard
                                        <ArrowRight className="size-3.5 ml-1.5" />
                                    </Link>
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Button asChild variant="outline" size="sm" className="border-border-default hover:border-brand-primary text-text-primary text-xs">
                                        <Link href="/login">
                                            <LogIn className="size-3.5 mr-1.5 text-brand-primary" />
                                            Masuk SIAKAD
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-semibold shadow-xs">
                                        <Link href="/pmb/daftar">
                                            Daftar PMB Online
                                            <ArrowRight className="size-3.5 ml-1.5" />
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-surface-base to-surface-base py-12 sm:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-semibold shadow-xs">
                            <Sparkles className="size-3.5 text-amber-600" />
                            <span>Tahun Akademik 2026/2027 Ganjil • Terhubung PD-DIKTI Neo Feeder 2.0</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight max-w-4xl mx-auto leading-tight">
                            Layanan Akademik Terpadu{' '}
                            <span className="text-brand-primary underline decoration-amber-400 decoration-wavy underline-offset-8">
                                STAI Al-Yasini
                            </span>
                        </h1>

                        <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
                            Portal digital resmi untuk seluruh civitas akademika: Pendaftaran Mahasiswa Baru (PMB), Perwalian & KRS Online, Rekap Nilai KHS, Bimbingan Skripsi, dan Cetak Dokumen Resmi.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            {user ? (
                                <Link href="/dashboard">
                                    <Button size="lg" className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-sm px-6 h-12 shadow-md flex items-center gap-2">
                                        <span>Masuk ke Dashboard Sistem</span>
                                        <ArrowRight className="size-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button size="lg" className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-sm px-6 h-12 shadow-md flex items-center gap-2">
                                            <LogIn className="size-4" />
                                            <span>Masuk Portal SIAKAD</span>
                                        </Button>
                                    </Link>
                                    <Link href="/pmb/daftar">
                                        <Button size="lg" variant="outline" className="border-border-default hover:bg-white text-text-primary font-bold text-sm px-6 h-12 shadow-xs flex items-center gap-2">
                                            <UserCheck className="size-4 text-brand-primary" />
                                            <span>Daftar Mahasiswa Baru (PMB)</span>
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Program Studi Showcase */}
                <section className="py-12 sm:py-16 bg-white border-y border-border-default">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-text-primary">Program Studi Sarjana (S1) Unggulan</h2>
                            <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
                                Membina generasi santri intelektual berwawasan global yang siap mengabdi untuk bangsa dan agama.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {prodis.map((p) => (
                                <div
                                    key={p.kode}
                                    className="rounded-2xl border border-border-default bg-surface-base p-6 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="p-3 rounded-xl bg-brand-primary text-white shadow-xs">
                                                <p.icon className="size-6 text-amber-300" />
                                            </div>
                                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                {p.akreditasi}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">{p.jenjang} - {p.kode}</span>
                                            <h3 className="text-lg font-bold text-text-primary mt-0.5">{p.nama}</h3>
                                        </div>

                                        <p className="text-xs text-text-secondary leading-relaxed">
                                            {p.deskripsi}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-border-default flex items-center justify-between text-xs text-brand-primary font-semibold">
                                        <span>Kurikulum Merdeka / OBE</span>
                                        <span>Gelar S.Pd / S.E</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Key Features for Dosen & Mahasiswa */}
                <section className="py-12 sm:py-16 bg-surface-base">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-text-primary">Kemudahan Pengelolaan Akademik</h2>
                            <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
                                Dirancang khusus untuk kemudahan navigasi dosen senior dan kecepatan akses mahasiswa.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-5 rounded-xl bg-white border border-border-default space-y-2 shadow-xs">
                                <div className="p-2 rounded-lg bg-emerald-50 text-brand-primary w-fit">
                                    <CheckCircle2 className="size-5" />
                                </div>
                                <h4 className="text-sm font-bold text-text-primary">KRS & KHS Online</h4>
                                <p className="text-xs text-text-secondary leading-relaxed">Pengajuan rencana studi dan pemantauan indeks prestasi semester secara real-time.</p>
                            </div>

                            <div className="p-5 rounded-xl bg-white border border-border-default space-y-2 shadow-xs">
                                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 w-fit">
                                    <Calendar className="size-5" />
                                </div>
                                <h4 className="text-sm font-bold text-text-primary">Jurnal 16 Pertemuan</h4>
                                <p className="text-xs text-text-secondary leading-relaxed">Presensi mahasiswa kelas dan berita acara perkuliahan dosen yang tersinkronisasi.</p>
                            </div>

                            <div className="p-5 rounded-xl bg-white border border-border-default space-y-2 shadow-xs">
                                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 w-fit">
                                    <FileCheck className="size-5" />
                                </div>
                                <h4 className="text-sm font-bold text-text-primary">Cetak Dokumen Resmi</h4>
                                <p className="text-xs text-text-secondary leading-relaxed">Cetak KRS, KHS, Kartu Peserta Ujian, dan Transkrip Nilai berstandar Kopertais/Kemenag.</p>
                            </div>

                            <div className="p-5 rounded-xl bg-white border border-border-default space-y-2 shadow-xs">
                                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 w-fit">
                                    <Shield className="size-5" />
                                </div>
                                <h4 className="text-sm font-bold text-text-primary">Sync PD-DIKTI Feeder</h4>
                                <p className="text-xs text-text-secondary leading-relaxed">Pelaporan otomatis mahasiswa, kelas kuliah, dan nilai ke Pangkalan Data Dikti Kemdikbud.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Institutional Footer */}
                <footer className="mt-auto bg-slate-900 text-slate-300 py-10 border-t border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="size-5 text-amber-400" />
                                <span className="font-bold text-sm text-white">STAI AL-YASINI PASURUAN</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed">
                                Yayasan Pondok Pesantren Ngalah<br />
                                Jl. Pesantren Ngalah No. 16, Sengonagung, Kec. Purwosari, Kab. Pasuruan, Jawa Timur 67162
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="font-bold text-white text-xs uppercase tracking-wider">Kontak & Layanan</p>
                            <p className="text-slate-400">Email: info@stai-alyasini.ac.id</p>
                            <p className="text-slate-400">Akademik: bpa@stai-alyasini.ac.id</p>
                            <p className="text-slate-400">Website: www.stai-alyasini.ac.id</p>
                        </div>

                        <div className="space-y-1 md:text-right">
                            <p className="font-bold text-white text-xs uppercase tracking-wider">SIAKAD STAI Al-Yasini</p>
                            <p className="text-slate-400">&copy; {new Date().getFullYear()} STAI Al-Yasini Pasuruan.</p>
                            <p className="text-[11px] text-slate-500">Sistem Informasi Akademik Terpadu & PD-DIKTI Feeder</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
