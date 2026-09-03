import { Head, Link } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    CreditCard,
    FileText,
    GraduationCap,
    Home,
    Mail,
    MapPin,
    Phone,
    Printer,
    Shield,
    User,
    Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Mahasiswa = {
    id: number;
    nim: string;
    nama_lengkap: string;
    nik?: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    jenis_kelamin?: string;
    no_hp?: string;
    email_pribadi?: string;
    alamat_ktp?: string;
    alamat_domisili?: string;
    tahun_masuk: number;
    status_mahasiswa: string;
    program_studi?: {
        id: number;
        nama: string;
        kode: string;
        fakultas?: {
            id: number;
            nama: string;
        };
    };
    agama?: {
        id: number;
        nama: string;
    };
    data_orang_tua?: {
        nama_ayah?: string;
        pekerjaan_ayah?: string;
        nama_ibu?: string;
        pekerjaan_ibu?: string;
        no_hp_orang_tua?: string;
    };
    dosen_walis?: Array<{
        id: number;
        tahun_ajaran_id: number;
        dosen?: {
            id: number;
            nama_lengkap: string;
            nidn?: string;
        };
    }>;
    status_akademik_historis?: Array<{
        id: number;
        status: string;
        tahun_ajaran?: {
            id: number;
            nama: string;
        };
    }>;
};

export default function ProfilMahasiswa({ mahasiswa }: { mahasiswa?: Mahasiswa | null }) {
    if (!mahasiswa) {
        return (
            <>
                <Head title="Profil Mahasiswa" />
                <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
                    <div className="size-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                        <Users className="size-8" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary">Data Mahasiswa Tidak Ditemukan</h2>
                    <p className="text-xs text-text-secondary">
                        Akun Anda saat ini belum terhubung dengan data profil mahasiswa aktif. Silakan hubungi bagian Administrasi Akademik atau beralih ke akun Mahasiswa.
                    </p>
                    <Button asChild size="sm">
                        <Link href="/dashboard">Kembali ke Dashboard</Link>
                    </Button>
                </div>
            </>
        );
    }

    const activeDosenWali = mahasiswa.dosen_walis?.[0]?.dosen;

    return (
        <>
            <Head title={`Profil Mahasiswa - ${mahasiswa.nama_lengkap}`} />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
                {/* Header Banner */}
                <div className="rounded-2xl bg-gradient-to-r from-brand-primary via-emerald-800 to-teal-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="size-20 sm:size-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-bold text-amber-300 shadow-inner">
                                {mahasiswa.nama_lengkap.charAt(0)}
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                        NIM: {mahasiswa.nim}
                                    </span>
                                    <Badge variant={mahasiswa.status_mahasiswa === 'aktif' ? 'default' : 'secondary'} className="capitalize">
                                        {mahasiswa.status_mahasiswa}
                                    </Badge>
                                </div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                                    {mahasiswa.nama_lengkap}
                                </h1>
                                <p className="text-xs sm:text-sm text-emerald-100 flex items-center gap-2">
                                    <GraduationCap className="size-4 text-amber-300" />
                                    <span>Program Studi {mahasiswa.program_studi?.nama || '-'} (Angkatan {mahasiswa.tahun_masuk})</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <Button asChild size="sm" variant="secondary" className="bg-white text-emerald-900 hover:bg-emerald-50 text-xs">
                                <Link href="/krs/saya">
                                    <BookOpen className="size-3.5 mr-1.5" />
                                    Portal KRS
                                </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-xs">
                                <Link href="/dokumen/transkrip">
                                    <Printer className="size-3.5 mr-1.5" />
                                    Transkrip
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1: Biodata Mahasiswa */}
                    <Card className="lg:col-span-2 border-border-default bg-surface-card">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-text-primary">
                                <User className="size-4.5 text-brand-primary" />
                                Biodata & Identitas Mahasiswa
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Data pribadi resmi yang tercatat pada pangkalan data akademik
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                    <span className="text-[11px] font-semibold text-text-secondary uppercase">Tempat, Tanggal Lahir</span>
                                    <p className="font-medium text-text-primary text-sm">
                                        {mahasiswa.tempat_lahir || '-'}, {mahasiswa.tanggal_lahir ? new Date(mahasiswa.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                    <span className="text-[11px] font-semibold text-text-secondary uppercase">Jenis Kelamin</span>
                                    <p className="font-medium text-text-primary text-sm">
                                        {mahasiswa.jenis_kelamin === 'L' ? 'Laki-laki' : mahasiswa.jenis_kelamin === 'P' ? 'Perempuan' : '-'}
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                    <span className="text-[11px] font-semibold text-text-secondary uppercase">Agama</span>
                                    <p className="font-medium text-text-primary text-sm">
                                        {mahasiswa.agama?.nama || 'Islam'}
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                    <span className="text-[11px] font-semibold text-text-secondary uppercase">Nomor HP / WhatsApp</span>
                                    <p className="font-medium text-text-primary text-sm flex items-center gap-1.5">
                                        <Phone className="size-3.5 text-brand-primary" />
                                        {mahasiswa.no_hp || '-'}
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 sm:col-span-2">
                                    <span className="text-[11px] font-semibold text-text-secondary uppercase">Email Pribadi</span>
                                    <p className="font-medium text-text-primary text-sm flex items-center gap-1.5">
                                        <Mail className="size-3.5 text-brand-primary" />
                                        {mahasiswa.email_pribadi || '-'}
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 sm:col-span-2">
                                    <span className="text-[11px] font-semibold text-text-secondary uppercase">Alamat Domisili</span>
                                    <p className="font-medium text-text-primary text-sm flex items-start gap-1.5">
                                        <MapPin className="size-3.5 text-brand-primary shrink-0 mt-0.5" />
                                        <span>{mahasiswa.alamat_domisili || mahasiswa.alamat_ktp || 'Belum diisi'}</span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Column 2: Status Dosen Wali & Orang Tua */}
                    <div className="space-y-6">
                        {/* Dosen Wali Card */}
                        <Card className="border-border-default bg-surface-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-text-primary">
                                    <GraduationCap className="size-4 text-brand-primary" />
                                    Dosen Pembimbing Akademik (Wali)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs space-y-2.5">
                                {activeDosenWali ? (
                                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="size-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs">
                                                {activeDosenWali.nama_lengkap.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-text-primary text-sm">{activeDosenWali.nama_lengkap}</h4>
                                                <p className="text-[11px] text-text-secondary">NIDN: {activeDosenWali.nidn || '-'}</p>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-emerald-800 pt-1">
                                            Bertanggung jawab untuk persetujuan KRS dan konsultasi akademik per semester.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-text-secondary">
                                        Belum ada Dosen Wali yang ditugaskan untuk semester ini.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Data Orang Tua Card */}
                        <Card className="border-border-default bg-surface-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-text-primary">
                                    <Users className="size-4 text-amber-600" />
                                    Data Orang Tua / Wali
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs space-y-3">
                                <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-text-secondary">Nama Ayah:</span>
                                        <p className="font-semibold text-text-primary">{mahasiswa.data_orang_tua?.nama_ayah || '-'}</p>
                                        <p className="text-[11px] text-text-secondary">{mahasiswa.data_orang_tua?.pekerjaan_ayah || '-'}</p>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200">
                                        <span className="text-[10px] uppercase font-bold text-text-secondary">Nama Ibu:</span>
                                        <p className="font-semibold text-text-primary">{mahasiswa.data_orang_tua?.nama_ibu || '-'}</p>
                                        <p className="text-[11px] text-text-secondary">{mahasiswa.data_orang_tua?.pekerjaan_ibu || '-'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

ProfilMahasiswa.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Profil Mahasiswa', href: '/mahasiswa/profil' },
    ],
};
