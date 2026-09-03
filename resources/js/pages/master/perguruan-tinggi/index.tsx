import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, Award, Users, Phone, Mail, Globe, MapPin, Edit, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

interface PerguruanTinggi {
    id: number;
    kode_unit: string;
    nama_unit: string;
    nama_unit_en: string | null;
    nama_singkat: string | null;
    jenis_perguruan_tinggi: string;
    lembaga_naungan: string;
    periode_berdiri: string | null;
    no_sk_pendirian: string | null;
    tanggal_sk_pendirian: string | null;
    ketua_nama: string | null;
    ketua_nidn: string | null;
    wakil_ketua_1: string | null;
    wakil_ketua_2: string | null;
    wakil_ketua_3: string | null;
    wakil_ketua_4: string | null;
    lembaga_akreditasi: string;
    peringkat_akreditasi: string;
    nilai_akreditasi: string | null;
    no_sk_akreditasi: string | null;
    tanggal_sk_akreditasi: string | null;
    tanggal_berlaku_akreditasi: string | null;
    tanggal_berakhir_akreditasi: string | null;
    file_sertifikat_akreditasi: string | null;
    visi: string | null;
    misi: string | null;
    alamat: string;
    telepon: string | null;
    email: string | null;
    website: string | null;
    fax: string | null;
}

interface DosenOption {
    id: number;
    nama_lengkap: string;
    nidn: string | null;
}

interface Props {
    perguruanTinggi: PerguruanTinggi;
    dosens: DosenOption[];
}

export default function PerguruanTinggiIndex({ perguruanTinggi, dosens }: Props) {
    const [isEditOpen, setIsEditOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        kode_unit: perguruanTinggi.kode_unit || '',
        nama_unit: perguruanTinggi.nama_unit || '',
        nama_unit_en: perguruanTinggi.nama_unit_en || '',
        nama_singkat: perguruanTinggi.nama_singkat || '',
        jenis_perguruan_tinggi: perguruanTinggi.jenis_perguruan_tinggi || '',
        lembaga_naungan: perguruanTinggi.lembaga_naungan || '',
        periode_berdiri: perguruanTinggi.periode_berdiri || '',
        no_sk_pendirian: perguruanTinggi.no_sk_pendirian || '',
        tanggal_sk_pendirian: perguruanTinggi.tanggal_sk_pendirian || '',
        ketua_nama: perguruanTinggi.ketua_nama || '',
        ketua_nidn: perguruanTinggi.ketua_nidn || '',
        wakil_ketua_1: perguruanTinggi.wakil_ketua_1 || '',
        wakil_ketua_2: perguruanTinggi.wakil_ketua_2 || '',
        wakil_ketua_3: perguruanTinggi.wakil_ketua_3 || '',
        wakil_ketua_4: perguruanTinggi.wakil_ketua_4 || '',
        lembaga_akreditasi: perguruanTinggi.lembaga_akreditasi || 'BAN-PT',
        peringkat_akreditasi: perguruanTinggi.peringkat_akreditasi || 'Baik',
        nilai_akreditasi: perguruanTinggi.nilai_akreditasi || '',
        no_sk_akreditasi: perguruanTinggi.no_sk_akreditasi || '',
        tanggal_sk_akreditasi: perguruanTinggi.tanggal_sk_akreditasi || '',
        tanggal_berlaku_akreditasi: perguruanTinggi.tanggal_berlaku_akreditasi || '',
        tanggal_berakhir_akreditasi: perguruanTinggi.tanggal_berakhir_akreditasi || '',
        visi: perguruanTinggi.visi || '',
        misi: perguruanTinggi.misi || '',
        alamat: perguruanTinggi.alamat || '',
        telepon: perguruanTinggi.telepon || '',
        email: perguruanTinggi.email || '',
        website: perguruanTinggi.website || '',
        fax: perguruanTinggi.fax || '',
        file_sertifikat_akreditasi: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/master/perguruan-tinggi', {
            onSuccess: () => setIsEditOpen(false),
        });
    };

    return (
        <>
            <Head title="Data Perguruan Tinggi" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                            <Building2 className="size-6 sm:size-7" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                {perguruanTinggi.nama_unit}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Profil identitas perguruan tinggi, SK pendirian, akreditasi, dan pimpinan struktural kampus.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsEditOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition self-start sm:self-auto"
                    >
                        <Edit className="size-3.5" />
                        <span>Edit Data Institusi</span>
                    </Button>
                </div>

                {/* Sub-nav Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto whitespace-nowrap text-xs font-medium">
                    <Link
                        href="/master/perguruan-tinggi"
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 shadow-2xs"
                    >
                        Perguruan Tinggi
                    </Link>
                    <Link
                        href="/master/fakultas"
                        className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                        Fakultas
                    </Link>
                    <Link
                        href="/master/program-studi"
                        className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                        Program Studi
                    </Link>
                    <Link
                        href="/master/tahun-ajaran"
                        className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                        Tahun Ajaran & Periode
                    </Link>
                    <Link
                        href="/master/ruang-kuliah"
                        className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                        Ruang Kuliah
                    </Link>
                </div>

                {/* 1. Identitas Perguruan Tinggi Card */}
                <Card className="border border-slate-200 shadow-xs overflow-hidden bg-white border-t-2 border-t-emerald-600 rounded-xl">
                    <CardHeader className="p-4 sm:p-6 border-b border-slate-100 pb-3">
                        <CardTitle className="text-base font-bold text-slate-900">
                            Identitas Perguruan Tinggi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Kode Unit</span>
                                <span className="font-semibold text-text-primary font-mono">{perguruanTinggi.kode_unit}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Lembaga Naungan</span>
                                <span className="text-text-primary font-medium">{perguruanTinggi.lembaga_naungan}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Nama Unit</span>
                                <span className="text-text-primary font-semibold">{perguruanTinggi.nama_unit}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Periode Berdiri</span>
                                <span className="text-text-primary">{perguruanTinggi.periode_berdiri || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Nama Unit (EN)</span>
                                <span className="text-text-primary italic">{perguruanTinggi.nama_unit_en || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">No. SK Pendirian</span>
                                <span className="text-text-primary font-mono text-xs">{perguruanTinggi.no_sk_pendirian || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Nama Singkat</span>
                                <span className="text-text-primary">{perguruanTinggi.nama_singkat || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Tanggal SK Pendirian</span>
                                <span className="text-text-primary">
                                    {perguruanTinggi.tanggal_sk_pendirian ? new Date(perguruanTinggi.tanggal_sk_pendirian).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Jenis Perguruan Tinggi</span>
                                <span className="text-text-primary font-medium">{perguruanTinggi.jenis_perguruan_tinggi}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Pejabat STAI Al-Yasini Card */}
                <Card className="border border-slate-200 shadow-xs overflow-hidden bg-white border-t-2 border-t-emerald-600 rounded-xl">
                    <CardHeader className="p-4 sm:p-6 border-b border-slate-100 pb-3">
                        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Users className="size-4.5 text-emerald-600" />
                            <span>Pejabat {perguruanTinggi.nama_unit}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Ketua / Rektor</span>
                                <span className="font-semibold text-text-primary">
                                    {perguruanTinggi.ketua_nidn ? `${perguruanTinggi.ketua_nidn} - ` : ''}{perguruanTinggi.ketua_nama || '-'}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Wakil Ketua 3</span>
                                <span className="text-text-primary">{perguruanTinggi.wakil_ketua_3 || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Wakil Ketua 1</span>
                                <span className="text-text-primary font-medium">{perguruanTinggi.wakil_ketua_1 || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Wakil Ketua 4</span>
                                <span className="text-text-primary">{perguruanTinggi.wakil_ketua_4 || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Wakil Ketua 2</span>
                                <span className="text-text-primary font-medium">{perguruanTinggi.wakil_ketua_2 || '-'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Akreditasi Perguruan Tinggi Card */}
                <Card className="border border-slate-200 shadow-xs overflow-hidden bg-white border-t-2 border-t-emerald-600 rounded-xl">
                    <CardHeader className="p-4 sm:p-6 border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Award className="size-4.5 text-emerald-600" />
                            <span>Akreditasi {perguruanTinggi.nama_unit}</span>
                        </CardTitle>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="size-3" />
                            <span>Peringkat {perguruanTinggi.peringkat_akreditasi}</span>
                        </span>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Lembaga Akreditasi</span>
                                <span className="font-semibold text-text-primary">{perguruanTinggi.lembaga_akreditasi}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Tanggal SK Akreditasi</span>
                                <span className="text-text-primary">
                                    {perguruanTinggi.tanggal_sk_akreditasi ? new Date(perguruanTinggi.tanggal_sk_akreditasi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Peringkat Akreditasi</span>
                                <span className="text-emerald-700 font-bold">{perguruanTinggi.peringkat_akreditasi}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Tanggal Berlaku</span>
                                <span className="text-text-primary">
                                    {perguruanTinggi.tanggal_berlaku_akreditasi ? new Date(perguruanTinggi.tanggal_berlaku_akreditasi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Nilai Akreditasi</span>
                                <span className="text-text-primary font-mono">{perguruanTinggi.nilai_akreditasi || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Tanggal Berakhir</span>
                                <span className="text-text-primary">
                                    {perguruanTinggi.tanggal_berakhir_akreditasi ? new Date(perguruanTinggi.tanggal_berakhir_akreditasi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">No. SK Akreditasi</span>
                                <span className="text-text-primary font-mono text-xs">{perguruanTinggi.no_sk_akreditasi || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">File Sertifikat</span>
                                <div>
                                    {perguruanTinggi.file_sertifikat_akreditasi ? (
                                        <a
                                            href={`/storage/${perguruanTinggi.file_sertifikat_akreditasi}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-brand-primary hover:underline font-medium flex items-center gap-1 text-xs"
                                        >
                                            <FileText className="size-3.5" />
                                            <span>Sertifikat-Akreditasi-Institusi.pdf</span>
                                        </a>
                                    ) : (
                                        <span className="text-text-secondary italic text-xs">Belum diunggah</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Visi, Misi & Kontak */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Visi Misi */}
                    <Card className="border border-slate-200 shadow-xs overflow-hidden bg-white border-t-2 border-t-emerald-600 rounded-xl">
                        <CardHeader className="p-4 sm:p-6 border-b border-slate-100 pb-3">
                            <CardTitle className="text-base font-bold text-slate-900">
                                Informasi Visi & Misi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-4 text-sm">
                            <div>
                                <h4 className="font-semibold text-text-primary mb-1">Visi</h4>
                                <p className="text-text-secondary whitespace-pre-line leading-relaxed">
                                    {perguruanTinggi.visi || 'Menjadi Perguruan Tinggi Islam yang Unggul, Berkarakter Pesantren, dan Berdaya Saing Global.'}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-text-primary mb-1">Misi</h4>
                                <p className="text-text-secondary whitespace-pre-line leading-relaxed">
                                    {perguruanTinggi.misi || '1. Menyelenggarakan pendidikan akademik yang berkualitas berbasis nilai pesantren.\n2. Mengembangkan riset dan pengabdian masyarakat yang solutif dan aplikatif.\n3. Mewujudkan tata kelola perguruan tinggi yang kredibel dan akuntabel.'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Kontak */}
                    <Card className="border border-slate-200 shadow-xs overflow-hidden bg-white border-t-2 border-t-emerald-600 rounded-xl">
                        <CardHeader className="p-4 sm:p-6 border-b border-slate-100 pb-3">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Phone className="size-4.5 text-emerald-600" />
                                <span>Kontak {perguruanTinggi.nama_unit}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <MapPin className="size-4 text-text-secondary shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-xs text-text-secondary block">Alamat Kampus</span>
                                    <span className="text-text-primary font-medium">{perguruanTinggi.alamat}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="size-4 text-text-secondary shrink-0" />
                                <div>
                                    <span className="text-xs text-text-secondary block">Telepon</span>
                                    <span className="text-text-primary font-medium">{perguruanTinggi.telepon || '-'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="size-4 text-text-secondary shrink-0" />
                                <div>
                                    <span className="text-xs text-text-secondary block">Email Resmi</span>
                                    <span className="text-text-primary font-medium">{perguruanTinggi.email || '-'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Globe className="size-4 text-text-secondary shrink-0" />
                                <div>
                                    <span className="text-xs text-text-secondary block">Website</span>
                                    <a
                                        href={perguruanTinggi.website || '#'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-brand-primary hover:underline font-medium"
                                    >
                                        {perguruanTinggi.website || '-'}
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Perguruan Tinggi Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Data Perguruan Tinggi</DialogTitle>
                        <DialogDescription>
                            Perbarui identitas institusi, pejabat pimpinan, akreditasi, visi-misi, dan kontak resmi.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                        {/* Section 1: Identitas */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-3">
                                1. Identitas Institusi
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Kode Unit</Label>
                                    <Input
                                        value={data.kode_unit}
                                        onChange={(e) => setData('kode_unit', e.target.value)}
                                        className="h-8 text-xs font-mono"
                                    />
                                    {errors.kode_unit && <p className="text-[11px] text-red-600">{errors.kode_unit}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Lembaga Naungan</Label>
                                    <Input
                                        value={data.lembaga_naungan}
                                        onChange={(e) => setData('lembaga_naungan', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Nama Unit</Label>
                                    <Input
                                        value={data.nama_unit}
                                        onChange={(e) => setData('nama_unit', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Nama Unit (EN)</Label>
                                    <Input
                                        value={data.nama_unit_en}
                                        onChange={(e) => setData('nama_unit_en', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Nama Singkat</Label>
                                    <Input
                                        value={data.nama_singkat}
                                        onChange={(e) => setData('nama_singkat', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Jenis Perguruan Tinggi</Label>
                                    <Input
                                        value={data.jenis_perguruan_tinggi}
                                        onChange={(e) => setData('jenis_perguruan_tinggi', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">No. SK Pendirian</Label>
                                    <Input
                                        value={data.no_sk_pendirian}
                                        onChange={(e) => setData('no_sk_pendirian', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Tanggal SK Pendirian</Label>
                                    <Input
                                        type="date"
                                        value={data.tanggal_sk_pendirian}
                                        onChange={(e) => setData('tanggal_sk_pendirian', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Pejabat */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-3">
                                2. Pejabat Pimpinan
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Ketua / Rektor (Nama & Gelar)</Label>
                                    <Input
                                        value={data.ketua_nama}
                                        onChange={(e) => setData('ketua_nama', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">NIDN Ketua</Label>
                                    <Input
                                        value={data.ketua_nidn}
                                        onChange={(e) => setData('ketua_nidn', e.target.value)}
                                        className="h-8 text-xs font-mono"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Wakil Ketua 1</Label>
                                    <Input
                                        value={data.wakil_ketua_1}
                                        onChange={(e) => setData('wakil_ketua_1', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Wakil Ketua 2</Label>
                                    <Input
                                        value={data.wakil_ketua_2}
                                        onChange={(e) => setData('wakil_ketua_2', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Wakil Ketua 3</Label>
                                    <Input
                                        value={data.wakil_ketua_3}
                                        onChange={(e) => setData('wakil_ketua_3', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Wakil Ketua 4</Label>
                                    <Input
                                        value={data.wakil_ketua_4}
                                        onChange={(e) => setData('wakil_ketua_4', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Akreditasi */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-3">
                                3. Akreditasi Institusi
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Lembaga Akreditasi</Label>
                                    <Input
                                        value={data.lembaga_akreditasi}
                                        onChange={(e) => setData('lembaga_akreditasi', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Peringkat Akreditasi</Label>
                                    <Input
                                        value={data.peringkat_akreditasi}
                                        onChange={(e) => setData('peringkat_akreditasi', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">No. SK Akreditasi</Label>
                                    <Input
                                        value={data.no_sk_akreditasi}
                                        onChange={(e) => setData('no_sk_akreditasi', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Nilai Akreditasi</Label>
                                    <Input
                                        value={data.nilai_akreditasi}
                                        onChange={(e) => setData('nilai_akreditasi', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Tanggal Berlaku</Label>
                                    <Input
                                        type="date"
                                        value={data.tanggal_berlaku_akreditasi}
                                        onChange={(e) => setData('tanggal_berlaku_akreditasi', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Tanggal Berakhir</Label>
                                    <Input
                                        type="date"
                                        value={data.tanggal_berakhir_akreditasi}
                                        onChange={(e) => setData('tanggal_berakhir_akreditasi', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="sm:col-span-2 space-y-1">
                                    <Label className="text-xs">Unggah Sertifikat Akreditasi (PDF / Gambar)</Label>
                                    <Input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setData('file_sertifikat_akreditasi', e.target.files?.[0] || null)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Kontak */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-3">
                                4. Kontak & Lokasi
                            </h4>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Alamat Lengkap</Label>
                                    <Input
                                        value={data.alamat}
                                        onChange={(e) => setData('alamat', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Telepon</Label>
                                        <Input
                                            value={data.telepon}
                                            onChange={(e) => setData('telepon', e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Email</Label>
                                        <Input
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Website</Label>
                                        <Input
                                            value={data.website}
                                            onChange={(e) => setData('website', e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" size="sm" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

PerguruanTinggiIndex.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Data Pelengkap', href: '/master/perguruan-tinggi' },
        { title: 'Perguruan Tinggi', href: '/master/perguruan-tinggi' },
    ],
};

