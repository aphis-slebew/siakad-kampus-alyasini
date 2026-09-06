import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    ArrowRight,
    Award,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    ClipboardList,
    Clock,
    CreditCard,
    FileCheck,
    FileSpreadsheet,
    FileText,
    GraduationCap,
    HelpCircle,
    LayoutGrid,
    Printer,
    RefreshCw,
    Settings,
    ShieldAlert,
    Sparkles,
    UserCheck,
    Users,
} from 'lucide-react';
import { PageContainer } from '@/components/page-container';
import type { SharedData } from '@/types';

type LiveStats = {
    total_mahasiswa_aktif: number;
    total_dosen_aktif: number;
    total_prodi: number;
    prodi_names?: string[];
    tahun_ajaran_aktif: string;
    pending_krs_count: number;
    pending_pembayaran_count: number;
    pending_pmb_count: number;
    total_kelas_aktif: number;
};

type RecentActivityItem = {
    id: number;
    action: string;
    entity_type: string;
    entity_id: number;
    user_name: string;
    created_at: string;
};

export default function Dashboard({
    liveStats,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    studentData,
    dosenData,
    recentActivities,
}: {
    liveStats?: LiveStats;
    studentData?: { mahasiswa?: { id: number; nama_lengkap: string; nim: string }; active_krs_status?: string } | null;
    dosenData?: { dosen?: { id: number; nama_lengkap: string }; bimbingan_krs_count?: number } | null;
    recentActivities?: RecentActivityItem[] | null;
}) {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const userRoles = user?.roles || [];

    const isDosen = userRoles.includes('dosen') || userRoles.includes('kaprodi') || user?.user_type === 'dosen';
    const isMahasiswa = userRoles.includes('mahasiswa') || user?.user_type === 'mahasiswa';
    const isSuperAdmin = userRoles.includes('superadmin') || user?.user_type === 'superadmin';
    const isAdminAkademik = isSuperAdmin || userRoles.includes('admin_akademik') || user?.user_type === 'admin_akademik';

    const prodiSummaryText =
        liveStats?.prodi_names && liveStats.prodi_names.length > 0
            ? liveStats.prodi_names.slice(0, 3).join(' • ')
            : `${liveStats?.total_prodi || 0} Prodi Terakreditasi`;

    const stats = [
        {
            title: 'Mahasiswa Terdaftar',
            value: liveStats ? String(liveStats.total_mahasiswa_aktif) : '1.248',
            subtext: 'Aktif Semester Ini',
            icon: GraduationCap,
            href: '/mahasiswa',
            bgColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
            borderColor: 'border-emerald-200/80',
            iconBg: 'bg-emerald-600 text-white',
        },
        {
            title: 'Dosen & Pengajar',
            value: liveStats ? String(liveStats.total_dosen_aktif) : '64',
            subtext: 'Tenaga Pendidik Aktif',
            icon: Users,
            href: '/kepegawaian/dosen',
            bgColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
            borderColor: 'border-blue-200/80',
            iconBg: 'bg-blue-600 text-white',
        },
        {
            title: 'Program Studi S1',
            value: liveStats ? String(liveStats.total_prodi) : '3',
            subtext: prodiSummaryText,
            icon: Building2,
            href: '/master/program-studi',
            bgColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
            borderColor: 'border-amber-200/80',
            iconBg: 'bg-amber-600 text-white',
        },
        {
            title: 'Tahun Akademik',
            value: liveStats?.tahun_ajaran_aktif || '2026/2027',
            subtext: `${liveStats?.total_kelas_aktif || 0} Kelas Dibuka`,
            icon: Calendar,
            href: '/master/tahun-ajaran',
            bgColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
            borderColor: 'border-purple-200/80',
            iconBg: 'bg-purple-600 text-white',
        },
    ];

    const todayDateFormatted = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <>
            <Head title="Dashboard Utama" />

            <PageContainer variant="wide">
                {/* Welcoming Hero Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-primary via-brand-primary to-brand-primary-dark p-6 sm:p-8 text-white shadow-md">
                    {/* Background Islamic Geometric Circles */}
                    <div className="absolute right-0 top-0 -mt-8 -mr-8 size-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                    <div className="absolute right-24 bottom-0 -mb-10 size-48 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-amber-300 border border-white/20">
                                <Sparkles className="size-3.5 text-amber-300" />
                                <span>Selamat Datang di SIAKAD STAI Al-Yasini</span>
                            </div>

                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                                {isDosen
                                    ? `Ahlan wa Sahlan, Bapak/Ibu Dosen ${user?.name || ''}`
                                    : isMahasiswa
                                    ? `Halo, Rekan Mahasiswa ${user?.name || ''}`
                                    : `Selamat Datang, ${user?.name || 'Civitas Akademika'}`}
                            </h1>

                            <p className="text-xs sm:text-sm text-emerald-50/90 max-w-2xl leading-relaxed">
                                Sistem Informasi Akademik terpadu Institut Agama Islam STAI Al-Yasini Pasuruan. Mudah, transparan, dan terhubung langsung ke PD-DIKTI.
                            </p>
                        </div>

                        {/* Status Chip */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-xs flex items-center gap-2.5">
                                <Clock className="size-4 text-amber-300" />
                                <div>
                                    <p className="font-semibold text-white">{todayDateFormatted}</p>
                                    <p className="text-[10px] text-emerald-100">Status Server: <span className="text-emerald-300 font-bold">Online</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Access Menu Hub (Aksi Cepat Berdasarkan Peran) */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                            <LayoutGrid className="size-4.5 text-brand-primary" />
                            <span>Menu Aksi Cepat</span>
                        </h2>
                        <span className="text-xs text-text-secondary">Pintasan fitur utama sesuai peran Anda</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                        {/* Dosen Quick Actions */}
                        {isDosen && (
                            <>
                                <Link
                                    href="/perwalian/krs"
                                    className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-brand-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-emerald-50 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                            <CheckCircle2 className="size-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                            Wali ({dosenData?.bimbingan_krs_count || 0})
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-primary transition-colors">
                                            Approval KRS Mahasiswa
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">Persetujuan rencana studi bimbingan</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/akademik/presensi"
                                    className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-blue-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Calendar className="size-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                            16 Sesi
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-primary group-hover:text-blue-600 transition-colors">
                                            Presensi & Jurnal Kuliah
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">Input kehadiran & materi tatap muka</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/akademik/penilaian"
                                    className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                            <FileSpreadsheet className="size-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                            Nilai
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-primary group-hover:text-amber-600 transition-colors">
                                            Penilaian Mahasiswa
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">Input Tugas, UTS, UAS & KHS</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/skripsi/bimbingan"
                                    className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-purple-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <GraduationCap className="size-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                                            Skripsi
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-primary group-hover:text-purple-600 transition-colors">
                                            Bimbingan Tugas Akhir
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">Proposal, bimbingan & ujian skripsi</p>
                                    </div>
                                </Link>
                            </>
                        )}

                        {/* Mahasiswa Quick Actions */}
                        {isMahasiswa && (
                            <>
                                <Link
                                    href="/krs/saya"
                                    className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-brand-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-emerald-50 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                            <BookOpen className="size-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                            KRS
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-primary transition-colors">
                                            Portal KRS Online
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">Pilih matakuliah & ajukan ke dosen</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/khs/saya"
                                    className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-blue-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Award className="size-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                            KHS
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-primary group-hover:text-blue-600 transition-colors">
                                            Kartu Hasil Studi (KHS)
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">Cek nilai semester & IPK</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/dokumen/kartu-ujian"
                                    className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                            <Printer className="size-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                            UTS/UAS
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-primary group-hover:text-amber-600 transition-colors">
                                            Cetak Kartu Ujian
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">Kartu tanda peserta ujian resmi</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/dokumen/transkrip"
                                    className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-purple-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <FileText className="size-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                                            Transkrip
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-primary group-hover:text-purple-600 transition-colors">
                                            Transkrip Nilai
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">Rekapitulasi seluruh semester</p>
                                    </div>
                                </Link>
                            </>
                        )}

                        {/* Superadmin Control Center Quick Actions */}
                        {isSuperAdmin && (
                            <>
                                <Link
                                    href="/users"
                                    className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-brand-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-emerald-50 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                            <Users className="size-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                            Akses User
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-primary transition-colors">
                                            Manajemen Pengguna
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">Kelola civitas, peran & impersonasi</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/superadmin/monitoring"
                                    className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-blue-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Activity className="size-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                            Audit Log
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-primary group-hover:text-blue-600 transition-colors">
                                            Monitoring Sistem
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">Status runtime, queue & log aktivitas</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/settings/system-configs"
                                    className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                            <Settings className="size-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                            Config
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-primary group-hover:text-amber-600 transition-colors">
                                            Konfigurasi Sistem
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">Batas SKS, jadwal KRS & denda UKT</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/pddikti"
                                    className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-indigo-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <RefreshCw className="size-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                                            Neo Feeder
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-primary group-hover:text-indigo-600 transition-colors">
                                            PD-DIKTI Feeder
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">Sinkronisasi data ke Kemdikbud</p>
                                    </div>
                                </Link>
                            </>
                        )}

                        {/* Admin / General Quick Actions */}
                        {!isDosen && !isMahasiswa && !isSuperAdmin && (
                            <>
                                <Link
                                    href="/pmb/calon-mahasiswa"
                                    className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-brand-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-emerald-50 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                            <UserCheck className="size-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                            PMB
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-primary transition-colors">
                                            Pendaftar PMB
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">Verifikasi berkas & kelulusan</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/keuangan/pembayaran"
                                    className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-purple-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <CreditCard className="size-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                                            UKT
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-primary group-hover:text-purple-600 transition-colors">
                                            Verifikasi UKT
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">Validasi pembayaran & bebas piutang</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/pddikti"
                                    className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-blue-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <RefreshCw className="size-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                            Neo Feeder
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-primary group-hover:text-blue-600 transition-colors">
                                            PD-DIKTI Feeder
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">Sinkronisasi data ke Kemdikbud</p>
                                    </div>
                                </Link>

                                <Link
                                    href="/master/program-studi"
                                    className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                            <Building2 className="size-5" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                            Master
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-text-primary group-hover:text-amber-600 transition-colors">
                                            Master Data Kampus
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-0.5">Fakultas, prodi, ruang & jadwal</p>
                                    </div>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Operational Workload Queue for Superadmin & Admin Akademik */}
                {(isSuperAdmin || isAdminAkademik) && liveStats && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                                <AlertCircle className="size-4.5 text-amber-600" />
                                <span>Antrean Tindakan Operasional Kampus</span>
                            </h2>
                            <span className="text-xs text-text-secondary">Persetujuan & verifikasi yang membutuhkan tindak lanjut</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                            {/* Pending KRS */}
                            <Link
                                href="/perwalian/krs"
                                className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-brand-primary/50 hover:shadow-md transition-all flex items-center justify-between"
                            >
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-text-secondary">Persetujuan KRS Mahasiswa</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-text-primary group-hover:text-brand-primary transition-colors">
                                            {liveStats.pending_krs_count}
                                        </span>
                                        <span className="text-xs text-text-secondary">menunggu persetujuan</span>
                                    </div>
                                </div>
                                <div className={`p-2.5 rounded-xl transition-colors ${liveStats.pending_krs_count > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                    <ClipboardList className="size-5" />
                                </div>
                            </Link>

                            {/* Pending Pembayaran */}
                            <Link
                                href="/keuangan/pembayaran"
                                className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-purple-500/50 hover:shadow-md transition-all flex items-center justify-between"
                            >
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-text-secondary">Verifikasi Pembayaran UKT</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-text-primary group-hover:text-purple-600 transition-colors">
                                            {liveStats.pending_pembayaran_count}
                                        </span>
                                        <span className="text-xs text-text-secondary">menunggu kasir</span>
                                    </div>
                                </div>
                                <div className={`p-2.5 rounded-xl transition-colors ${liveStats.pending_pembayaran_count > 0 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                                    <CreditCard className="size-5" />
                                </div>
                            </Link>

                            {/* Pending PMB */}
                            <Link
                                href="/pmb/calon-mahasiswa"
                                className="group p-4 rounded-xl bg-surface-card border border-border-default hover:border-blue-500/50 hover:shadow-md transition-all flex items-center justify-between"
                            >
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-text-secondary">Verifikasi Pendaftar PMB</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-text-primary group-hover:text-blue-600 transition-colors">
                                            {liveStats.pending_pmb_count}
                                        </span>
                                        <span className="text-xs text-text-secondary">menunggu berkas</span>
                                    </div>
                                </div>
                                <div className={`p-2.5 rounded-xl transition-colors ${liveStats.pending_pmb_count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                    <UserCheck className="size-5" />
                                </div>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Metric Summary Cards (Interactive & Clickable) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <Link
                            key={stat.title}
                            href={stat.href}
                            className="group rounded-2xl border border-border-default bg-surface-card p-5 shadow-xs hover:shadow-md hover:border-brand-primary/40 transition-all block cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider group-hover:text-brand-primary transition-colors">
                                    {stat.title}
                                </span>
                                <div className={`p-2.5 rounded-xl ${stat.iconBg} shadow-xs`}>
                                    <stat.icon className="size-4" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-bold tracking-tight text-text-primary group-hover:text-brand-primary transition-colors">
                                        {stat.value}
                                    </span>
                                    <ArrowRight className="size-4 text-text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                </div>
                                <p className="text-xs font-medium text-text-secondary mt-1 flex items-center gap-1">
                                    <span className="inline-block size-1.5 rounded-full bg-brand-primary shrink-0" />
                                    <span className="truncate">{stat.subtext}</span>
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Information Boards */}
                <div className={`grid grid-cols-1 gap-6 ${isSuperAdmin && recentActivities && recentActivities.length > 0 ? 'lg:grid-cols-3' : 'md:grid-cols-2'}`}>
                    <div className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-xs space-y-3">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-border-default">
                            <div className="p-2 rounded-lg bg-emerald-50 text-brand-primary">
                                <FileCheck className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-text-primary">Kalender Perwalian & Akademik</h3>
                                <p className="text-[11px] text-text-secondary">Semester Ganjil 2026/2027</p>
                            </div>
                        </div>
                        <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
                            <li className="flex items-start gap-2">
                                <span className="size-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                                <span><strong>Masa Pengisian KRS:</strong> Mahasiswa dapat mengajukan matakuliah setelah melunasi tagihan UKT.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="size-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                <span><strong>Persetujuan Dosen Wali:</strong> Dosen dapat meninjau dan menyetujui KRS melalui menu Approval Perwalian.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="size-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                <span><strong>Batas Akhir Penilaian:</strong> Dosen wajib memfinalisasi nilai akhir sebelum tanggal penutupan semester.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-xs space-y-3">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-border-default">
                            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                                <HelpCircle className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-text-primary">Pusat Bantuan & Layanan BAA</h3>
                                <p className="text-[11px] text-text-secondary">Layanan administrasi kampus STAI Al-Yasini</p>
                            </div>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Bagi Bapak/Ibu Dosen dan Mahasiswa yang membutuhkan panduan teknis pengisian nilai, kendala presensi kelas, atau verifikasi biodata, silakan menghubungi:
                        </p>
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-border-default space-y-2 text-xs text-text-primary">
                            <p className="flex items-center gap-2">
                                <svg className="size-3.5 text-brand-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                                    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                                    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                                    <path d="M10 6h4" />
                                    <path d="M10 10h4" />
                                    <path d="M10 14h4" />
                                    <path d="M10 18h4" />
                                </svg>
                                <span><strong>Gedung Rektorat Lt. 1</strong> — Biro Administrasi Akademik (BAA)</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <svg className="size-3.5 text-brand-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                <span><strong>Email Resmi:</strong> akademik@stai-alyasini.ac.id</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <svg className="size-3.5 text-brand-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <span><strong>Helpdesk IT:</strong> (0343) 611-xxx / WhatsApp Layanan SIAKAD</span>
                            </p>
                        </div>
                    </div>

                    {/* Recent Audit Activities Board (Superadmin Exclusive) */}
                    {isSuperAdmin && recentActivities && recentActivities.length > 0 && (
                        <div className="rounded-2xl border border-border-default bg-surface-card p-6 shadow-xs space-y-3 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between pb-3 border-b border-border-default">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                            <Activity className="size-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-text-primary">Aktivitas Sistem Terkini</h3>
                                            <p className="text-[11px] text-text-secondary">Log audit & pengawasan terkini</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                        Live
                                    </span>
                                </div>

                                <div className="mt-3 space-y-2.5 text-xs">
                                    {recentActivities.map((act) => (
                                        <div key={act.id} className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                                            <div className="space-y-0.5 min-w-0">
                                                <p className="font-semibold text-text-primary truncate">
                                                    {act.action}
                                                </p>
                                                <p className="text-[11px] text-text-secondary truncate">
                                                    oleh <strong>{act.user_name}</strong> • {act.entity_type} #{act.entity_id}
                                                </p>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                                {act.created_at}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Link
                                href="/superadmin/monitoring"
                                className="pt-3 border-t border-border-default text-xs font-semibold text-brand-primary hover:text-brand-primary-dark flex items-center justify-between group"
                            >
                                <span>Buka Seluruh Log Audit</span>
                                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    )}
                </div>
            </PageContainer>
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
