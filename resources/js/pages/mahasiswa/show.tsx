import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    CreditCard,
    DollarSign,
    FileText,
    GraduationCap,
    Home,
    Mail,
    MapPin,
    Phone,
    Printer,
    Receipt,
    Shield,
    User,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';

type MahasiswaDetail = {
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
        fakultas?: { id: number; nama: string };
    };
    agama?: { id: number; nama: string };
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
        dosen?: { id: number; nama_lengkap: string; nidn?: string };
    }>;
    krss?: Array<{
        id: number;
        status: string;
        tahun_ajaran?: { id: number; nama: string };
        krs_details?: Array<{
            id: number;
            kelas_kuliah?: {
                id: number;
                nama_kelas: string;
                kurikulum_matakuliah?: {
                    matakuliah?: { id: number; kode: string; nama: string; sks: number };
                };
            };
        }>;
    }>;
    tagihans?: Array<{
        id: number;
        jenis: string;
        nominal: number;
        status: string;
        tahun_ajaran?: { id: number; nama: string };
        pembayarans?: Array<{ id: number; nominal_dibayar: number; status_verifikasi: string }>;
    }>;
};

export default function DataMahasiswaDetail({ mahasiswa }: { mahasiswa?: MahasiswaDetail | null }) {
    const [activeTab, setActiveTab] = useState<'biodata' | 'krs' | 'keuangan'>('biodata');

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    if (!mahasiswa) {
        return (
            <>
                <Head title="Detail Mahasiswa" />
                <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
                    <div className="size-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                        <Users className="size-8" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary">Data Mahasiswa Tidak Ditemukan</h2>
                    <p className="text-xs text-text-secondary">
                        Data mahasiswa yang Anda tuju tidak ditemukan atau telah dihapus dari sistem.
                    </p>
                    <Button asChild size="sm">
                        <Link href="/mahasiswa">Kembali ke Direktori Mahasiswa</Link>
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Data Mahasiswa - ${mahasiswa.nama_lengkap} (${mahasiswa.nim})`} />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
                {/* Top Action */}
                <div className="flex items-center justify-between">
                    <Button asChild variant="ghost" size="sm" className="text-xs">
                        <Link href="/mahasiswa">
                            <ArrowLeft className="size-3.5 mr-1.5" />
                            Kembali ke Direktori Mahasiswa
                        </Link>
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button asChild size="sm" variant="outline" className="text-xs">
                            <Link href={`/dokumen/transkrip/${mahasiswa.id}`}>
                                <Printer className="size-3.5 mr-1.5" />
                                Cetak Transkrip
                            </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="text-xs">
                            <Link href={`/dokumen/krs/${mahasiswa.id}`}>
                                <FileText className="size-3.5 mr-1.5" />
                                Cetak KRS
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Header Card */}
                <Card className="border-border-default bg-surface-card shadow-xs overflow-hidden">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-brand-primary via-emerald-800 to-teal-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="size-16 rounded-xl bg-white/10 flex items-center justify-center text-2xl font-bold text-amber-300 border border-white/20 shrink-0">
                                {mahasiswa.nama_lengkap.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-amber-300">NIM: {mahasiswa.nim}</span>
                                    <Badge variant="secondary" className="capitalize text-[10px]">
                                        {mahasiswa.status_mahasiswa}
                                    </Badge>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">{mahasiswa.nama_lengkap}</h1>
                                <p className="text-xs text-emerald-100">
                                    Prodi: {mahasiswa.program_studi?.nama || '-'} • Angkatan {mahasiswa.tahun_masuk}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center border-b border-border-default px-4 sm:px-6 bg-slate-50/50 overflow-x-auto whitespace-nowrap">
                        <button
                            onClick={() => setActiveTab('biodata')}
                            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
                                activeTab === 'biodata'
                                    ? 'border-brand-primary text-brand-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            Biodata & Orang Tua
                        </button>
                        <button
                            onClick={() => setActiveTab('krs')}
                            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
                                activeTab === 'krs'
                                    ? 'border-brand-primary text-brand-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            Riwayat KRS ({mahasiswa.krss?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('keuangan')}
                            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
                                activeTab === 'keuangan'
                                    ? 'border-brand-primary text-brand-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            Riwayat Tagihan & UKT ({mahasiswa.tagihans?.length || 0})
                        </button>
                    </div>

                    {/* Tab Contents */}
                    <CardContent className="p-4 sm:p-6">
                        {activeTab === 'biodata' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                                        <User className="size-4 text-brand-primary" />
                                        Data Diri Mahasiswa
                                    </h3>
                                    <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                                        <div><b>Tempat, Tgl Lahir:</b> {mahasiswa.tempat_lahir || '-'}, {mahasiswa.tanggal_lahir ? new Date(mahasiswa.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</div>
                                        <div><b>Jenis Kelamin:</b> {mahasiswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                                        <div><b>Agama:</b> {mahasiswa.agama?.nama || 'Islam'}</div>
                                        <div><b>No HP:</b> {mahasiswa.no_hp || '-'}</div>
                                        <div><b>Email:</b> {mahasiswa.email_pribadi || '-'}</div>
                                        <div><b>Alamat:</b> {mahasiswa.alamat_domisili || mahasiswa.alamat_ktp || '-'}</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                                        <Users className="size-4 text-amber-600" />
                                        Data Orang Tua & Dosen Wali
                                    </h3>
                                    <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                                        <div><b>Nama Ayah:</b> {mahasiswa.data_orang_tua?.nama_ayah || '-'} ({mahasiswa.data_orang_tua?.pekerjaan_ayah || '-'})</div>
                                        <div><b>Nama Ibu:</b> {mahasiswa.data_orang_tua?.nama_ibu || '-'} ({mahasiswa.data_orang_tua?.pekerjaan_ibu || '-'})</div>
                                        <div><b>Kontak Ortu:</b> {mahasiswa.data_orang_tua?.no_hp_orang_tua || '-'}</div>
                                        <div className="pt-2 border-t border-slate-200">
                                            <b>Dosen Wali:</b> {mahasiswa.dosen_walis?.[0]?.dosen?.nama_lengkap || 'Belum ditugaskan'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'krs' && (
                            <div className="space-y-4">
                                {mahasiswa.krss?.length === 0 ? (
                                    <p className="text-xs text-text-secondary italic">Belum ada riwayat KRS.</p>
                                ) : (
                                    mahasiswa.krss?.map((krs) => (
                                        <div key={krs.id} className="p-4 rounded-xl border border-border-default space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-sm text-text-primary">{krs.tahun_ajaran?.nama}</h4>
                                                <Badge variant={krs.status === 'disetujui_wali' ? 'default' : 'secondary'} className="capitalize text-xs">
                                                    {krs.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-text-secondary">
                                                Total Mata Kuliah: {krs.krs_details?.length || 0} MK
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'keuangan' && (
                            <div className="space-y-4">
                                {mahasiswa.tagihans?.length === 0 ? (
                                    <p className="text-xs text-text-secondary italic">Belum ada riwayat tagihan UKT.</p>
                                ) : (
                                    <ResponsiveTable>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tahun Ajaran</TableHead>
                                                <TableHead>Jenis</TableHead>
                                                <TableHead>Nominal</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mahasiswa.tagihans?.map((t) => (
                                                <TableRow key={t.id}>
                                                    <TableCell className="font-medium text-xs">{t.tahun_ajaran?.nama}</TableCell>
                                                    <TableCell className="uppercase text-xs">{t.jenis}</TableCell>
                                                    <TableCell className="font-mono text-xs">{formatRupiah(t.nominal)}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={t.status === 'lunas' ? 'default' : 'destructive'} className="capitalize text-[10px]">
                                                            {t.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </ResponsiveTable>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

DataMahasiswaDetail.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Mahasiswa', href: '/mahasiswa' },
        { title: 'Detail Mahasiswa', href: '#' },
    ],
};
