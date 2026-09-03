import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    Building2,
    Calendar,
    Clock,
    DoorOpen,
    GraduationCap,
    Printer,
    UserCheck,
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

type JadwalItem = {
    kelas_id: number;
    kelas_nama: string;
    matakuliah_kode: string;
    matakuliah_nama: string;
    sks: number;
    dosen: string;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruang: string;
};

export default function JadwalKuliahMahasiswa({
    mahasiswa,
    tahunAjaran,
    krsStatus = 'belum_krs',
    jadwalList = [],
}: {
    mahasiswa?: Mahasiswa | null;
    tahunAjaran?: TahunAjaran | null;
    krsStatus?: string;
    jadwalList?: JadwalItem[];
}) {
    if (!mahasiswa) {
        return (
            <>
                <Head title="Jadwal Perkuliahan Mahasiswa" />
                <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
                    <div className="size-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                        <Calendar className="size-8" />
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

    const safeJadwalList = jadwalList || [];
    const hariGroups = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    return (
        <>
            <Head title="Jadwal Perkuliahan Mahasiswa" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary">
                                {tahunAjaran?.nama || 'Semester Ganjil 2026/2027'}
                            </span>
                            <Badge variant={krsStatus === 'disetujui_wali' ? 'default' : 'secondary'} className="text-[11px] capitalize">
                                Status KRS: {krsStatus.replace('_', ' ')}
                            </Badge>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                            Jadwal Perkuliahan Mingguan
                        </h1>
                        <p className="text-xs sm:text-sm text-text-secondary">
                            Daftar sesi perkuliahan aktif berdasarkan KRS yang telah disetujui Dosen Wali.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="text-xs">
                            <Link href="/dokumen/krs">
                                <Printer className="size-3.5 mr-1.5" />
                                Cetak Jadwal & KRS
                            </Link>
                        </Button>
                    </div>
                </div>

                {jadwalList.length === 0 ? (
                    <Card className="border-border-default bg-surface-card text-center p-8">
                        <CardContent className="space-y-3">
                            <div className="size-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                                <AlertCircle className="size-6" />
                            </div>
                            <h3 className="font-bold text-base text-text-primary">Belum Ada Jadwal Kuliah</h3>
                            <p className="text-xs text-text-secondary max-w-md mx-auto">
                                Jadwal perkuliahan akan muncul secara otomatis setelah Anda mengisi KRS dan disetujui oleh Dosen Wali.
                            </p>
                            <Button asChild size="sm" className="mt-2 text-xs">
                                <Link href="/krs/saya">
                                    <BookOpen className="size-3.5 mr-1.5" />
                                    Buka Portal KRS
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Table View */}
                        <Card className="border-border-default bg-surface-card overflow-hidden">
                            <CardHeader className="pb-3 border-b border-border-default bg-slate-50/50">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-text-primary">
                                    <Calendar className="size-4 text-brand-primary" />
                                    Tabel Matriks Jadwal Kuliah ({jadwalList.length} Sesi)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ResponsiveTable>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Hari & Waktu</TableHead>
                                            <TableHead>Mata Kuliah</TableHead>
                                            <TableHead>Kelas & SKS</TableHead>
                                            <TableHead>Ruang Kuliah</TableHead>
                                            <TableHead>Dosen Pengajar</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {jadwalList.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="font-semibold bg-emerald-50 text-emerald-900 border-emerald-200">
                                                            {item.hari}
                                                        </Badge>
                                                        <span className="text-xs font-mono text-text-secondary flex items-center gap-1">
                                                            <Clock className="size-3 text-brand-primary" />
                                                            {item.jam_mulai} - {item.jam_selesai}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-bold text-text-primary text-sm">{item.matakuliah_nama}</div>
                                                    <div className="text-[11px] text-text-secondary font-mono">Kode: {item.matakuliah_kode}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-semibold text-text-primary">{item.kelas_nama}</span>
                                                    <span className="text-xs text-text-secondary ml-1.5">({item.sks} SKS)</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs text-text-primary flex items-center gap-1">
                                                        <DoorOpen className="size-3.5 text-amber-600" />
                                                        {item.ruang}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs text-text-secondary">{item.dosen}</span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </ResponsiveTable>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}

JadwalKuliahMahasiswa.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Jadwal Kuliah', href: '/mahasiswa/jadwal' },
    ],
};
