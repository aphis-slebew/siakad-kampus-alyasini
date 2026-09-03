import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    Award,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    FileCheck,
    Printer,
    ShieldAlert,
    UserCheck,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';

type Mahasiswa = {
    id: number;
    nama_lengkap: string;
    nim: string;
};

type TahunAjaran = {
    id: number;
    nama: string;
};

type PresensiItem = {
    kelas_id: number;
    kelas_nama: string;
    matakuliah_kode: string;
    matakuliah_nama: string;
    sks: number;
    dosen: string;
    total_sesi: number;
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
    persentase: number;
    is_eligible_uas: boolean;
};

export default function PresensiMahasiswa({
    mahasiswa,
    tahunAjaran,
    presensiSummary = [],
}: {
    mahasiswa?: Mahasiswa | null;
    tahunAjaran?: TahunAjaran | null;
    presensiSummary?: PresensiItem[];
}) {
    if (!mahasiswa) {
        return (
            <>
                <Head title="Presensi Kehadiran Mahasiswa" />
                <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
                    <div className="size-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                        <UserCheck className="size-8" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary">Data Mahasiswa Tidak Ditemukan</h2>
                    <p className="text-xs text-text-secondary">
                        Akun Anda saat ini belum terhubung dengan data profil mahasiswa aktif. Silakan hubungi bagian Administrasi Akademik.
                    </p>
                    <Button asChild size="sm">
                        <Link href="/dashboard">Kembali ke Dashboard</Link>
                    </Button>
                </div>
            </>
        );
    }

    const safePresensiSummary = presensiSummary || [];

    return (
        <>
            <Head title="Rekapitulasi Presensi Kehadiran Mahasiswa" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary">
                                {tahunAjaran?.nama || 'Semester Ganjil 2026/2027'}
                            </span>
                            <Badge variant="outline" className="text-[11px] bg-slate-100 text-slate-700">
                                Syarat Ujian: Minimal 75%
                            </Badge>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                            Rekapitulasi Kehadiran Kuliah
                        </h1>
                        <p className="text-xs sm:text-sm text-text-secondary">
                            Pemantauan presensi per mata kuliah untuk syarat kelayakan mengikuti Ujian Akhir Semester (UAS).
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="text-xs">
                            <Link href="/dokumen/kartu-ujian">
                                <Printer className="size-3.5 mr-1.5" />
                                Cetak Kartu Ujian
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Important Notice */}
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
                    <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="font-bold">Ketentuan Kehadiran STAI Al-Yasini:</p>
                        <p className="text-amber-800 leading-relaxed">
                            Mahasiswa diwajibkan menghadiri minimal <strong>75% dari total tatap muka</strong> (minimal 12 dari 16 sesi) untuk setiap mata kuliah agar berhak mengikuti UAS dan memperoleh Kartu Ujian.
                        </p>
                    </div>
                </div>

                {presensiSummary.length === 0 ? (
                    <Card className="border-border-default bg-surface-card text-center p-8">
                        <CardContent className="space-y-3">
                            <div className="size-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                                <UserCheck className="size-6" />
                            </div>
                            <h3 className="font-bold text-base text-text-primary">Belum Ada Catatan Presensi</h3>
                            <p className="text-xs text-text-secondary max-w-md mx-auto">
                                Belum ada mata kuliah yang diambil atau dosen belum membuka sesi jurnal perkuliahan.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-border-default bg-surface-card overflow-hidden">
                        <CardHeader className="pb-3 border-b border-border-default bg-slate-50/50">
                            <CardTitle className="text-sm font-bold flex items-center gap-2 text-text-primary">
                                <FileCheck className="size-4 text-brand-primary" />
                                Daftar Rekap Kehadiran Mata Kuliah ({presensiSummary.length} MK)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ResponsiveTable>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mata Kuliah & Kelas</TableHead>
                                        <TableHead className="text-center">Total Sesi</TableHead>
                                        <TableHead className="text-center">Hadir</TableHead>
                                        <TableHead className="text-center">Izin / Sakit</TableHead>
                                        <TableHead className="text-center">Alpa</TableHead>
                                        <TableHead className="text-center">Persentase</TableHead>
                                        <TableHead className="text-center">Status Syarat UAS</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {presensiSummary.map((item) => (
                                        <TableRow key={item.kelas_id}>
                                            <TableCell>
                                                <div className="font-bold text-text-primary text-sm">{item.matakuliah_nama}</div>
                                                <div className="text-[11px] text-text-secondary flex items-center gap-2">
                                                    <span>Kelas: {item.kelas_nama}</span>
                                                    <span>•</span>
                                                    <span>{item.sks} SKS</span>
                                                    <span>•</span>
                                                    <span>Dosen: {item.dosen}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {item.total_sesi} sesi
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                                                    {item.hadir}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center text-xs text-text-secondary">
                                                {item.izin + item.sakit} ({item.izin} I / {item.sakit} S)
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`font-bold px-2 py-0.5 rounded text-xs ${item.alpa > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-text-secondary'}`}>
                                                    {item.alpa}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`font-bold text-xs ${item.persentase >= 75 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                                        {item.persentase}%
                                                    </span>
                                                    <div className="w-16 h-1.5 rounded-full bg-slate-200 mt-1 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${item.persentase >= 75 ? 'bg-emerald-600' : 'bg-rose-500'}`}
                                                            style={{ width: `${Math.min(100, item.persentase)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {item.is_eligible_uas ? (
                                                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px]">
                                                        <CheckCircle2 className="size-3 mr-1" />
                                                        Memenuhi Syarat
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="text-[10px]">
                                                        <XCircle className="size-3 mr-1" />
                                                        Kurang ({item.persentase}%)
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </ResponsiveTable>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

PresensiMahasiswa.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Presensi Saya', href: '/mahasiswa/presensi' },
    ],
};
