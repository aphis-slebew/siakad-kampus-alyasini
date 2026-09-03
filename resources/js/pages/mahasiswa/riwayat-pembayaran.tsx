import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    Award,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    FileText,
    Printer,
    Receipt,
    ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';

type TagihanItem = {
    id: number;
    jenis: string;
    nominal: number;
    sisa_piutang: number;
    jatuh_tempo: string;
    status: string;
    tahun_ajaran?: {
        id: number;
        nama: string;
    };
    pembayarans?: Array<{
        id: number;
        nominal_dibayar: number;
        tanggal_bayar: string;
        metode: string;
        status_verifikasi: string;
    }>;
    cicilan_tagihans?: Array<{
        id: number;
        cicilan_ke: number;
        nominal: number;
        status: string;
    }>;
};

export default function RiwayatPembayaranMahasiswa({
    mahasiswa,
    tagihans = [],
    ringkasan = {
        total_tagihan: 0,
        total_terbayar: 0,
        total_sisa_piutang: 0,
    },
}: {
    mahasiswa?: { id: number; nama_lengkap: string; nim: string } | null;
    tagihans?: TagihanItem[];
    ringkasan?: {
        total_tagihan: number;
        total_terbayar: number;
        total_sisa_piutang: number;
    };
}) {
    if (!mahasiswa) {
        return (
            <>
                <Head title="Riwayat Tagihan & Pembayaran UKT" />
                <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
                    <div className="size-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                        <CreditCard className="size-8" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary">Data Mahasiswa Tidak Ditemukan</h2>
                    <p className="text-xs text-text-secondary">
                        Akun Anda saat ini belum terhubung dengan data profil mahasiswa aktif. Silakan hubungi bagian Keuangan / Administrasi Akademik.
                    </p>
                    <Button asChild size="sm">
                        <Link href="/dashboard">Kembali ke Dashboard</Link>
                    </Button>
                </div>
            </>
        );
    }

    const safeTagihans = tagihans || [];
    const safeRingkasan = ringkasan || { total_tagihan: 0, total_terbayar: 0, total_sisa_piutang: 0 };

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    return (
        <>
            <Head title="Riwayat Tagihan & Pembayaran UKT" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                            Riwayat Tagihan & Pembayaran UKT
                        </h1>
                        <p className="text-xs sm:text-sm text-text-secondary">
                            Rekapitulasi seluruh tagihan semester, riwayat transfer, dan status verifikasi bebas piutang.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild size="sm" className="text-xs">
                            <Link href="/keuangan/bayar">
                                <CreditCard className="size-3.5 mr-1.5" />
                                Bayar Tagihan Baru
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-border-default bg-surface-card shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-text-secondary uppercase">Total Tagihan Terbit</span>
                                <h3 className="text-xl font-bold text-text-primary mt-1">{formatRupiah(ringkasan.total_tagihan)}</h3>
                            </div>
                            <div className="size-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                                <Receipt className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border-default bg-surface-card shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-text-secondary uppercase">Total Telah Diverifikasi</span>
                                <h3 className="text-xl font-bold text-emerald-700 mt-1">{formatRupiah(ringkasan.total_terbayar)}</h3>
                            </div>
                            <div className="size-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                <CheckCircle2 className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border-default bg-surface-card shadow-xs">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-text-secondary uppercase">Sisa Tunggakan (Piutang)</span>
                                <h3 className={`text-xl font-bold mt-1 ${ringkasan.total_sisa_piutang > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                                    {formatRupiah(ringkasan.total_sisa_piutang)}
                                </h3>
                            </div>
                            <div className={`size-10 rounded-xl flex items-center justify-center ${ringkasan.total_sisa_piutang > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                <ShieldCheck className="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table of Invoices & Payments */}
                <Card className="border-border-default bg-surface-card overflow-hidden">
                    <CardHeader className="pb-3 border-b border-border-default bg-slate-50/50">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-text-primary">
                            <Receipt className="size-4 text-brand-primary" />
                            Daftar Tagihan per Semester
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {tagihans.length === 0 ? (
                            <div className="p-8 text-center text-xs text-text-secondary">
                                Belum ada riwayat tagihan yang diterbitkan.
                            </div>
                        ) : (
                            <ResponsiveTable>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tahun Akademik</TableHead>
                                        <TableHead>Jenis Tagihan</TableHead>
                                        <TableHead>Nominal</TableHead>
                                        <TableHead>Jatuh Tempo</TableHead>
                                        <TableHead>Riwayat Pembayaran</TableHead>
                                        <TableHead className="text-center">Status Tagihan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tagihans.map((tagihan) => (
                                        <TableRow key={tagihan.id}>
                                            <TableCell className="font-bold text-text-primary">
                                                {tagihan.tahun_ajaran?.nama || 'Semester Aktif'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="uppercase font-semibold text-[10px]">
                                                    {tagihan.jenis}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono font-semibold text-text-primary">
                                                {formatRupiah(tagihan.nominal)}
                                            </TableCell>
                                            <TableCell className="text-xs text-text-secondary">
                                                {tagihan.jatuh_tempo ? new Date(tagihan.jatuh_tempo).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {tagihan.pembayarans && tagihan.pembayarans.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {tagihan.pembayarans.map((p) => (
                                                            <div key={p.id} className="flex items-center gap-2">
                                                                <span className="font-mono font-medium">{formatRupiah(p.nominal_dibayar)}</span>
                                                                <Badge
                                                                    variant={p.status_verifikasi === 'diterima' ? 'default' : p.status_verifikasi === 'menunggu' ? 'secondary' : 'destructive'}
                                                                    className="text-[9px] uppercase py-0"
                                                                >
                                                                    {p.status_verifikasi}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-text-secondary italic">Belum ada pembayaran</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={tagihan.status === 'lunas' ? 'default' : tagihan.status === 'cicilan' ? 'secondary' : 'destructive'}
                                                    className="capitalize text-xs font-bold"
                                                >
                                                    {tagihan.status === 'lunas' ? (
                                                        <CheckCircle2 className="size-3 mr-1" />
                                                    ) : (
                                                        <Clock className="size-3 mr-1" />
                                                    )}
                                                    {tagihan.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </ResponsiveTable>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

RiwayatPembayaranMahasiswa.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Riwayat Pembayaran', href: '/mahasiswa/riwayat-pembayaran' },
    ],
};
