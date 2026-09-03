import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    FileText,
    GraduationCap,
    Mail,
    Phone,
    User,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ProdiPilihan = { id: number; nama: string; kode: string };
type GelombangPendaftaran = { id: number; nama: string };
type JalurPendaftaran = { id: number; nama: string };
type BerkasPendaftaran = {
    id: number;
    nama_berkas: string;
    status_verifikasi: string;
    catatan_verifikasi?: string;
    file_path: string;
};
type JadwalSeleksi = { id: number; tanggal_seleksi: string; tempat?: string; keterangan?: string };
type HasilSeleksi = { id: number; nilai_tes?: number; status: string; catatan?: string };

type CalonMahasiswaDetail = {
    id: number;
    nama_lengkap: string;
    nik?: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    jenis_kelamin?: string;
    alamat?: string;
    no_hp?: string;
    email?: string;
    asal_sekolah?: string;
    tahun_lulus_sekolah?: number;
    status_pendaftaran: string;
    prodi_pilihan1?: ProdiPilihan;
    prodi_pilihan2?: ProdiPilihan;
    gelombang_pendaftaran?: GelombangPendaftaran;
    jalur_pendaftaran?: JalurPendaftaran;
    berkas_pendaftarans?: BerkasPendaftaran[];
    jadwal_seleksis?: JadwalSeleksi[];
    hasil_seleksi?: HasilSeleksi;
};

const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    diajukan: 'Diajukan',
    verifikasi_berkas: 'Verifikasi Berkas',
    lolos_verifikasi: 'Lolos Verifikasi',
    dijadwalkan_tes: 'Dijadwalkan Tes',
    lulus_seleksi: 'Lulus Seleksi',
    tidak_lulus: 'Tidak Lulus',
};

const BERKAS_STATUS: Record<string, { label: string; color: string }> = {
    menunggu: { label: 'Menunggu Verifikasi', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    diverifikasi: { label: 'Terverifikasi', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    ditolak: { label: 'Ditolak', color: 'text-red-600 bg-red-50 border-red-200' },
};

export default function CalonMahasiswaShow({
    calon,
}: {
    calon: CalonMahasiswaDetail;
}) {
    const berkas = calon.berkas_pendaftarans || [];
    const jadwalSeleksis = calon.jadwal_seleksis || [];

    return (
        <>
            <Head title={'Detail Pendaftaran — ' + calon.nama_lengkap} />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit('/pmb/calon-mahasiswa')}
                            className="h-8 w-8 p-0 text-text-secondary hover:text-brand-primary"
                        >
                            <ArrowLeft className="size-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                                <User className="size-5 text-brand-primary" />
                                {calon.nama_lengkap}
                            </h1>
                            <p className="text-xs text-text-secondary mt-0.5">
                                Detail berkas pendaftaran calon mahasiswa baru
                            </p>
                        </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 self-start sm:self-center">
                        {STATUS_LABELS[calon.status_pendaftaran] || calon.status_pendaftaran}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Biodata */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <User className="size-4 text-brand-primary" />
                                    Biodata Diri
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-medium text-text-secondary">Nama Lengkap</p>
                                        <p className="text-text-primary font-semibold">{calon.nama_lengkap}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-medium text-text-secondary">NIK</p>
                                        <p className="text-text-primary font-mono">{calon.nik || '-'}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-medium text-text-secondary">Tempat / Tanggal Lahir</p>
                                        <p className="text-text-primary">
                                            {[calon.tempat_lahir, calon.tanggal_lahir].filter(Boolean).join(', ') || '-'}
                                        </p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-medium text-text-secondary">Jenis Kelamin</p>
                                        <p className="text-text-primary">
                                            {calon.jenis_kelamin === 'L' ? 'Laki-laki' : calon.jenis_kelamin === 'P' ? 'Perempuan' : '-'}
                                        </p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-medium text-text-secondary flex items-center gap-1">
                                            <Mail className="size-3" /> Email
                                        </p>
                                        <p className="text-text-primary">{calon.email || '-'}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-medium text-text-secondary flex items-center gap-1">
                                            <Phone className="size-3" /> No. HP
                                        </p>
                                        <p className="text-text-primary">{calon.no_hp || '-'}</p>
                                    </div>
                                    <div className="space-y-0.5 sm:col-span-2">
                                        <p className="text-xs font-medium text-text-secondary">Alamat</p>
                                        <p className="text-text-primary">{calon.alamat || '-'}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-medium text-text-secondary flex items-center gap-1">
                                            <GraduationCap className="size-3" /> Asal Sekolah
                                        </p>
                                        <p className="text-text-primary">{calon.asal_sekolah || '-'}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-medium text-text-secondary">Tahun Lulus</p>
                                        <p className="text-text-primary">{calon.tahun_lulus_sekolah || '-'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Berkas Pendaftaran */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="size-4 text-brand-primary" />
                                    Berkas Pendaftaran
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    {berkas.length} berkas — {berkas.filter((b) => b.status_verifikasi === 'diverifikasi').length} terverifikasi
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {berkas.length === 0 ? (
                                    <p className="text-xs text-text-secondary italic text-center py-4">
                                        Belum ada berkas yang diunggah.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {berkas.map((b) => {
                                            const bs = BERKAS_STATUS[b.status_verifikasi] || BERKAS_STATUS['menunggu'];

                                            return (
                                                <div
                                                    key={b.id}
                                                    className="flex items-center justify-between rounded-lg border border-border-default p-3 text-xs"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="size-4 text-text-secondary shrink-0" />
                                                        <div>
                                                            <p className="font-medium text-text-primary">{b.nama_berkas}</p>
                                                            {b.catatan_verifikasi && (
                                                                <p className="text-text-secondary mt-0.5 italic">
                                                                    Catatan: {b.catatan_verifikasi}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ' + bs.color}>
                                                            {bs.label}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0"
                                                            onClick={() => window.open('/pmb/berkas/' + b.id + '/download', '_blank')}
                                                            title="Unduh berkas"
                                                        >
                                                            <Download className="size-3.5 text-text-secondary" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Jadwal Seleksi */}
                        {jadwalSeleksis.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <Calendar className="size-4 text-brand-primary" />
                                        Jadwal Seleksi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {jadwalSeleksis.map((j) => (
                                            <div key={j.id} className="flex items-start gap-3 rounded-lg border border-border-default p-3 text-xs">
                                                <Calendar className="size-4 text-brand-primary mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="font-semibold text-text-primary">{j.tanggal_seleksi}</p>
                                                    {j.tempat && <p className="text-text-secondary mt-0.5">Tempat: {j.tempat}</p>}
                                                    {j.keterangan && <p className="text-text-secondary mt-0.5 italic">{j.keterangan}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Briefcase className="size-4 text-brand-primary" />
                                    Info Pendaftaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-text-secondary">Gelombang</p>
                                    <p className="text-text-primary font-medium">{calon.gelombang_pendaftaran?.nama || '-'}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-text-secondary">Jalur Pendaftaran</p>
                                    <p className="text-text-primary font-medium">{calon.jalur_pendaftaran?.nama || '-'}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-text-secondary">Prodi Pilihan 1</p>
                                    <p className="text-text-primary font-medium">
                                        {calon.prodi_pilihan1 ? calon.prodi_pilihan1.kode + ' – ' + calon.prodi_pilihan1.nama : '-'}
                                    </p>
                                </div>
                                {calon.prodi_pilihan2 && (
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-medium text-text-secondary">Prodi Pilihan 2</p>
                                        <p className="text-text-primary font-medium">
                                            {calon.prodi_pilihan2.kode + ' – ' + calon.prodi_pilihan2.nama}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {calon.hasil_seleksi ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        {calon.hasil_seleksi.status === 'lulus'
                                            ? <CheckCircle2 className="size-4 text-emerald-600" />
                                            : <XCircle className="size-4 text-red-600" />}
                                        Hasil Seleksi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-text-secondary">Status</span>
                                        <span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ' + (calon.hasil_seleksi.status === 'lulus' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200')}>
                                            {calon.hasil_seleksi.status === 'lulus' ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                                            {calon.hasil_seleksi.status === 'lulus' ? 'Lulus' : 'Tidak Lulus'}
                                        </span>
                                    </div>
                                    {calon.hasil_seleksi.nilai_tes != null && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-text-secondary">Nilai Tes</span>
                                            <span className="font-bold text-xl text-text-primary">{calon.hasil_seleksi.nilai_tes}</span>
                                        </div>
                                    )}
                                    {calon.hasil_seleksi.catatan && (
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-medium text-text-secondary">Catatan</p>
                                            <p className="text-xs text-text-primary italic bg-muted/30 rounded p-2 border">{calon.hasil_seleksi.catatan}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="flex items-center gap-2 text-xs text-text-secondary py-6">
                                    <Clock className="size-4 shrink-0" />
                                    Hasil seleksi belum diinputkan.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

CalonMahasiswaShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'PMB', href: '#' },
        { title: 'Calon Mahasiswa', href: '/pmb/calon-mahasiswa' },
        { title: 'Detail', href: '#' },
    ],
};
