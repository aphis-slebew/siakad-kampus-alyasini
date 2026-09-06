import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    GraduationCap,
    Award,
    Users,
    BookOpen,
    Phone,
    ArrowLeft,
    Edit,
    Trash2,
    FileText,
    CheckCircle,
    XCircle,
    UserCheck,
    Layers,
    Plus,
} from 'lucide-react';
import React, { useState } from 'react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface KonsentrasiItem {
    id: number;
    program_studi_id: number;
    nama: string;
    created_at?: string;
}

interface ProgramStudi {
    id: number;
    fakultas_id: number;
    kode: string;
    nama: string;
    nama_en: string | null;
    nama_singkat: string | null;
    jenjang: string;
    periode_berdiri: string | null;
    gelar: string | null;
    gelar_singkat: string | null;
    gelar_en: string | null;
    gelar_singkat_en: string | null;
    status: string;
    status_spmb: string;
    terdaftar_lptk: boolean;
    ketua_prodi_nama: string | null;
    ketua_prodi_nidn: string | null;
    sekretaris_prodi_nama: string | null;
    sks_lulus_min: number;
    ipk_lulus_min: string | number;
    tugas_akhir_syarat: boolean;
    jenis_tugas_akhir: string;
    pengaturan_transfer_nilai: string;
    max_dosen_pembimbing: number;
    max_dosen_penguji: number;
    periode_hitung_ips: string;
    lembaga_akreditasi: string | null;
    akreditasi: string | null;
    nilai_akreditasi: string | null;
    no_sk_akreditasi: string | null;
    tanggal_sk_akreditasi: string | null;
    tanggal_berlaku_akreditasi: string | null;
    tanggal_berakhir_akreditasi: string | null;
    file_sertifikat_akreditasi: string | null;
    alamat: string | null;
    telepon: string | null;
    email: string | null;
    website: string | null;
    fakultas?: {
        id: number;
        nama: string;
    };
    konsentrasis?: KonsentrasiItem[];
}

interface PerguruanTinggi {
    nama_unit: string;
}

interface DosenOption {
    id: number;
    nama_lengkap: string;
    nidn: string | null;
    gelar_depan?: string | null;
    gelar_belakang?: string | null;
    niy_nip?: string | null;
    nama_bergelar?: string;
}

interface FakultasOption {
    id: number;
    kode: string;
    nama: string;
}

interface Props {
    programStudi: ProgramStudi;
    perguruanTinggi: PerguruanTinggi | null;
    dosens: DosenOption[];
    fakultas: FakultasOption[];
}

export default function ProgramStudiShow({ programStudi, perguruanTinggi, dosens, fakultas }: Props) {
    const [isEditOpen, setIsEditOpen] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        fakultas_id: programStudi.fakultas_id,
        kode: programStudi.kode || '',
        nama: programStudi.nama || '',
        nama_en: programStudi.nama_en || '',
        nama_singkat: programStudi.nama_singkat || '',
        jenjang: programStudi.jenjang || 'S1',
        periode_berdiri: programStudi.periode_berdiri || '',
        gelar: programStudi.gelar || '',
        gelar_singkat: programStudi.gelar_singkat || '',
        gelar_en: programStudi.gelar_en || '',
        gelar_singkat_en: programStudi.gelar_singkat_en || '',
        status: programStudi.status || 'aktif',
        status_spmb: programStudi.status_spmb || 'aktif',
        terdaftar_lptk: Boolean(programStudi.terdaftar_lptk),
        ketua_prodi_nama: programStudi.ketua_prodi_nama || '',
        ketua_prodi_nidn: programStudi.ketua_prodi_nidn || '',
        sekretaris_prodi_nama: programStudi.sekretaris_prodi_nama || '',
        sks_lulus_min: programStudi.sks_lulus_min || 144,
        ipk_lulus_min: programStudi.ipk_lulus_min || 2.00,
        tugas_akhir_syarat: Boolean(programStudi.tugas_akhir_syarat),
        jenis_tugas_akhir: programStudi.jenis_tugas_akhir || 'Skripsi',
        pengaturan_transfer_nilai: programStudi.pengaturan_transfer_nilai || 'Masuk Transkrip Akademik',
        max_dosen_pembimbing: programStudi.max_dosen_pembimbing || 2,
        max_dosen_penguji: programStudi.max_dosen_penguji || 2,
        periode_hitung_ips: programStudi.periode_hitung_ips || 'Periode terakhir mahasiswa aktif',
        lembaga_akreditasi: programStudi.lembaga_akreditasi || 'LAMDIK',
        akreditasi: programStudi.akreditasi || 'Baik Sekali',
        nilai_akreditasi: programStudi.nilai_akreditasi || '',
        no_sk_akreditasi: programStudi.no_sk_akreditasi || '',
        tanggal_sk_akreditasi: programStudi.tanggal_sk_akreditasi || '',
        tanggal_berlaku_akreditasi: programStudi.tanggal_berlaku_akreditasi || '',
        tanggal_berakhir_akreditasi: programStudi.tanggal_berakhir_akreditasi || '',
        file_sertifikat_akreditasi: null as File | null,
        alamat: programStudi.alamat || '',
        telepon: programStudi.telepon || '',
        email: programStudi.email || '',
        website: programStudi.website || '',
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/master/program-studi/${programStudi.id}`, {
            onSuccess: () => setIsEditOpen(false),
        });
    };

    const handleDelete = () => {
        if (confirm(`Hapus program studi ${programStudi.nama}?`)) {
            router.delete(`/master/program-studi/${programStudi.id}`);
        }
    };

    // Konsentrasi Management State & Handlers
    const [isAddKonsentrasiOpen, setIsAddKonsentrasiOpen] = useState(false);
    const [editingKonsentrasi, setEditingKonsentrasi] = useState<KonsentrasiItem | null>(null);

    const addKonsentrasiForm = useForm({
        program_studi_id: programStudi.id,
        nama: '',
    });

    const editKonsentrasiForm = useForm({
        nama: '',
    });

    const { confirm: confirmDelete, confirmDialog } = useConfirmDialog();

    const handleAddKonsentrasi = (e: React.FormEvent) => {
        e.preventDefault();
        addKonsentrasiForm.post('/master/konsentrasi', {
            onSuccess: () => {
                setIsAddKonsentrasiOpen(false);
                addKonsentrasiForm.reset('nama');
            },
        });
    };

    const handleEditKonsentrasi = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingKonsentrasi) {
            return;
        }
        editKonsentrasiForm.put(`/master/konsentrasi/${editingKonsentrasi.id}`, {
            onSuccess: () => {
                setEditingKonsentrasi(null);
                editKonsentrasiForm.reset();
            },
        });
    };

    const handleDeleteKonsentrasi = (item: KonsentrasiItem) => {
        confirmDelete({
            title: 'Hapus Bidang Konsentrasi',
            description: `Apakah Anda yakin ingin menghapus bidang konsentrasi "${item.nama}"?`,
            variant: 'destructive',
            confirmText: 'Ya, Hapus Konsentrasi',
            onConfirm: () => {
                router.delete(`/master/konsentrasi/${item.id}`);
            },
        });
    };

    return (
        <>
            {confirmDialog}
            <Head title={`Detail Program Studi - ${programStudi.nama}`} />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
                {/* Header Action Bar (Matching Reference Layout) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <GraduationCap className="size-7 text-emerald-600" />
                            <span>{programStudi.nama}</span>
                            <span className="text-sm font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">{programStudi.jenjang}</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                            Kode Prodi: <span className="font-mono font-bold text-slate-900">{programStudi.kode}</span> &bull; Fakultas: {programStudi.fakultas?.nama || '-'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
                        <Link href="/master/program-studi">
                            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200">
                                <ArrowLeft className="size-3.5" />
                                <span>Kembali ke Daftar</span>
                            </Button>
                        </Link>
                        <Button
                            onClick={() => setIsEditOpen(true)}
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs flex items-center gap-1.5"
                        >
                            <Edit className="size-3.5" />
                            <span>Edit</span>
                        </Button>
                        <Button
                            onClick={handleDelete}
                            size="sm"
                            variant="destructive"
                            className="text-xs flex items-center gap-1.5"
                        >
                            <Trash2 className="size-3.5" />
                            <span>Hapus</span>
                        </Button>
                    </div>
                </div>

                {/* 1. Detail Program Studi Card */}
                <Card className="border border-border-default shadow-xs overflow-hidden">
                    <div className="h-1.5 bg-brand-primary" />
                    <CardHeader className="p-4 sm:p-6 border-b border-border-default pb-3">
                        <CardTitle className="text-base font-semibold text-text-primary">
                            Informasi Identitas & Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Perguruan Tinggi</span>
                                <span className="font-semibold text-text-primary">{perguruanTinggi?.nama_unit || 'STAI Al-Yasini Pasuruan'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Gelar (singkat)</span>
                                <span className="font-semibold text-text-primary">{programStudi.gelar_singkat || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Kode Prodi</span>
                                <span className="font-mono font-semibold text-text-primary">{programStudi.kode}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Gelar (EN)</span>
                                <span className="text-text-primary italic">{programStudi.gelar_en || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Nama Prodi</span>
                                <span className="font-semibold text-text-primary">{programStudi.nama}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Gelar (singkat) (EN)</span>
                                <span className="text-text-primary italic">{programStudi.gelar_singkat_en || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Nama Prodi (EN)</span>
                                <span className="text-text-primary italic">{programStudi.nama_en || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Status</span>
                                <span className="font-semibold text-emerald-700 capitalize">{programStudi.status}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Nama Singkat</span>
                                <span className="text-text-primary">{programStudi.nama_singkat || programStudi.nama}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Status di SPMB</span>
                                <span className="font-semibold text-emerald-700 capitalize">{programStudi.status_spmb}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Jenjang Pendidikan</span>
                                <span className="text-text-primary font-medium">{programStudi.jenjang}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Terdaftar pada LPTK?</span>
                                <span className="text-text-primary">
                                    {programStudi.terdaftar_lptk ? (
                                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                            <CheckCircle className="size-3.5" /> Ya
                                        </span>
                                    ) : (
                                        <span className="text-text-secondary flex items-center gap-1">
                                            <XCircle className="size-3.5 text-red-500" /> Tidak
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Periode Berdiri</span>
                                <span className="text-text-primary">{programStudi.periode_berdiri || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Gelar</span>
                                <span className="text-text-primary">{programStudi.gelar || '-'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Pejabat Program Studi Card */}
                <Card className="border border-border-default shadow-xs overflow-hidden">
                    <div className="h-1.5 bg-brand-primary" />
                    <CardHeader className="p-4 sm:p-6 border-b border-border-default pb-3">
                        <CardTitle className="text-base font-semibold text-text-primary flex items-center gap-2">
                            <Users className="size-4.5 text-brand-primary" />
                            <span>Pejabat Program Studi</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Ketua Prodi</span>
                                <span className="font-semibold text-text-primary">
                                    {programStudi.ketua_prodi_nidn ? `${programStudi.ketua_prodi_nidn} - ` : ''}{programStudi.ketua_prodi_nama || '-'}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Sekretaris Prodi</span>
                                <span className="text-text-primary font-medium">{programStudi.sekretaris_prodi_nama || '-'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Informasi Akademik Card */}
                <Card className="border border-border-default shadow-xs overflow-hidden">
                    <div className="h-1.5 bg-brand-primary" />
                    <CardHeader className="p-4 sm:p-6 border-b border-border-default pb-3">
                        <CardTitle className="text-base font-semibold text-text-primary flex items-center gap-2">
                            <BookOpen className="size-4.5 text-brand-primary" />
                            <span>Informasi Akademik</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-64">SKS Lulus Minimal</span>
                                <span className="font-semibold text-text-primary">{programStudi.sks_lulus_min} SKS</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-64">Pengaturan Hasil Transfer Nilai Mahasiswa</span>
                                <span className="text-text-primary font-medium">{programStudi.pengaturan_transfer_nilai}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-64">IPK Lulus Minimal</span>
                                <span className="font-semibold text-text-primary">{Number(programStudi.ipk_lulus_min).toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-64">Jumlah Maksimal Dosen Pembimbing</span>
                                <span className="text-text-primary font-medium">{programStudi.max_dosen_pembimbing} Orang</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-64">Tugas Akhir Menjadi Syarat Kelulusan?</span>
                                <span className="text-text-primary font-medium">{programStudi.tugas_akhir_syarat ? 'Ya' : 'Tidak'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-64">Jumlah Maksimal Dosen Penguji</span>
                                <span className="text-text-primary font-medium">{programStudi.max_dosen_penguji} Orang</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-64">Jenis Tugas Akhir</span>
                                <span className="text-text-primary font-medium">{programStudi.jenis_tugas_akhir}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-64">Periode untuk Menghitung IPS Lalu</span>
                                <span className="text-text-primary">{programStudi.periode_hitung_ips}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3.5. Bidang Konsentrasi / Peminatan Program Studi Card */}
                <Card className="border border-border-default shadow-xs overflow-hidden">
                    <div className="h-1.5 bg-emerald-600" />
                    <CardHeader className="p-4 sm:p-6 border-b border-border-default pb-3 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <Layers className="size-4.5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold text-text-primary">
                                    Bidang Konsentrasi / Peminatan Program Studi
                                </CardTitle>
                                <p className="text-xs text-text-secondary mt-0.5">
                                    Peminatan keilmuan yang dapat dikontrak oleh mahasiswa pada program studi ini.
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setIsAddKonsentrasiOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs"
                        >
                            <Plus className="size-3.5" />
                            <span>Tambah Konsentrasi</span>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        {(!programStudi.konsentrasis || programStudi.konsentrasis.length === 0) ? (
                            <div className="text-center py-8 text-slate-400">
                                <Layers className="size-8 mx-auto text-slate-300 mb-2" />
                                <p className="text-xs font-semibold text-slate-600">Belum Ada Bidang Konsentrasi Terdaftar</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Program studi ini belum memiliki bidang peminatan khusus. Klik Tambah Konsentrasi untuk menambahkan.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                                {programStudi.konsentrasis.map((k, idx) => (
                                    <div key={k.id} className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 transition">
                                        <div className="flex items-center gap-3">
                                            <span className="size-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">{k.nama}</p>
                                                <p className="text-[10px] text-slate-400">
                                                    Ditambahkan {k.created_at ? new Date(k.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingKonsentrasi(k);
                                                    editKonsentrasiForm.setData('nama', k.nama);
                                                }}
                                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                title="Edit Konsentrasi"
                                            >
                                                <Edit className="size-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteKonsentrasi(k)}
                                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                title="Hapus Konsentrasi"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 4. Akreditasi Program Studi Card */}
                <Card className="border border-border-default shadow-xs overflow-hidden">
                    <div className="h-1.5 bg-brand-primary" />
                    <CardHeader className="p-4 sm:p-6 border-b border-border-default pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold text-text-primary flex items-center gap-2">
                            <Award className="size-4.5 text-brand-primary" />
                            <span>Akreditasi Program Studi</span>
                        </CardTitle>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="size-3" />
                            <span>Akreditasi {programStudi.akreditasi || 'Baik Sekali'}</span>
                        </span>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Lembaga Akreditasi</span>
                                <span className="font-semibold text-text-primary">{programStudi.lembaga_akreditasi || 'LAMDIK'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Tanggal SK Akreditasi</span>
                                <span className="text-text-primary">
                                    {programStudi.tanggal_sk_akreditasi ? new Date(programStudi.tanggal_sk_akreditasi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Akreditasi</span>
                                <span className="text-emerald-700 font-bold">{programStudi.akreditasi || 'Baik Sekali'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Tanggal Berlaku Akreditasi</span>
                                <span className="text-text-primary">
                                    {programStudi.tanggal_berlaku_akreditasi ? new Date(programStudi.tanggal_berlaku_akreditasi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Nilai Akreditasi</span>
                                <span className="text-text-primary font-mono">{programStudi.nilai_akreditasi || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Tanggal Berakhir Akreditasi</span>
                                <span className="text-text-primary">
                                    {programStudi.tanggal_berakhir_akreditasi ? new Date(programStudi.tanggal_berakhir_akreditasi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">No. SK Akreditasi</span>
                                <span className="text-text-primary font-mono text-xs">{programStudi.no_sk_akreditasi || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">File Sertifikat Akreditasi</span>
                                <div>
                                    {programStudi.file_sertifikat_akreditasi ? (
                                        <a
                                            href={`/storage/${programStudi.file_sertifikat_akreditasi}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-brand-primary hover:underline font-medium flex items-center gap-1 text-xs"
                                        >
                                            <FileText className="size-3.5" />
                                            <span>Sertifikat-Akreditasi-{programStudi.kode}.pdf</span>
                                        </a>
                                    ) : (
                                        <span className="text-text-secondary italic text-xs">Belum diunggah</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Kontak Program Studi Card */}
                <Card className="border border-border-default shadow-xs overflow-hidden">
                    <div className="h-1.5 bg-brand-primary" />
                    <CardHeader className="p-4 sm:p-6 border-b border-border-default pb-3">
                        <CardTitle className="text-base font-semibold text-text-primary flex items-center gap-2">
                            <Phone className="size-4.5 text-brand-primary" />
                            <span>Kontak Program Studi</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Alamat</span>
                                <span className="text-text-primary">{programStudi.alamat || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Email</span>
                                <span className="text-text-primary">{programStudi.email || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Telepon</span>
                                <span className="text-text-primary">{programStudi.telepon || '-'}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-border-default/60">
                                <span className="text-text-secondary font-medium w-48">Alamat Website</span>
                                <span className="text-text-primary">{programStudi.website || '-'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Program Studi Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Program Studi - {programStudi.nama}</DialogTitle>
                        <DialogDescription>
                            Perbarui identitas prodi, gelar, status, pejabat, informasi akademik, dan akreditasi.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdate} className="space-y-6 pt-2">
                        {/* Section 1: Identitas & Gelar */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-3">
                                1. Identitas Program Studi & Gelar
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Fakultas</Label>
                                    <select
                                        value={data.fakultas_id}
                                        onChange={(e) => setData('fakultas_id', Number(e.target.value))}
                                        className="w-full h-8 text-xs border border-border-default rounded-md px-2 bg-surface-base"
                                    >
                                        {fakultas.map((f) => (
                                            <option key={f.id} value={f.id}>{f.nama}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Kode Prodi</Label>
                                    <Input
                                        value={data.kode}
                                        onChange={(e) => setData('kode', e.target.value)}
                                        className="h-8 text-xs font-mono"
                                    />
                                    {errors.kode && <p className="text-[11px] text-red-600">{errors.kode}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Jenjang</Label>
                                    <select
                                        value={data.jenjang}
                                        onChange={(e) => setData('jenjang', e.target.value)}
                                        className="w-full h-8 text-xs border border-border-default rounded-md px-2 bg-surface-base"
                                    >
                                        <option value="D3">D3 - Diploma</option>
                                        <option value="S1">S1 - Sarjana</option>
                                        <option value="S2">S2 - Magister</option>
                                    </select>
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <Label className="text-xs">Nama Prodi (Indonesia)</Label>
                                    <Input
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
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
                                <div className="space-y-1 sm:col-span-2">
                                    <Label className="text-xs">Nama Prodi (English)</Label>
                                    <Input
                                        value={data.nama_en}
                                        onChange={(e) => setData('nama_en', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Periode Berdiri</Label>
                                    <Input
                                        value={data.periode_berdiri}
                                        onChange={(e) => setData('periode_berdiri', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Gelar (contoh: Sarjana Pendidikan)</Label>
                                    <Input
                                        value={data.gelar}
                                        onChange={(e) => setData('gelar', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Gelar Singkat (contoh: S.Pd.)</Label>
                                    <Input
                                        value={data.gelar_singkat}
                                        onChange={(e) => setData('gelar_singkat', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Gelar (EN)</Label>
                                    <Input
                                        value={data.gelar_en}
                                        onChange={(e) => setData('gelar_en', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Pejabat */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                                2. Pejabat Program Studi
                            </h4>

                            {/* Dosen Picker for Kaprodi */}
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                        <UserCheck className="size-3.5 text-emerald-600" />
                                        <span>Pilih Ketua Program Studi (Kaprodi) dari Data Dosen</span>
                                    </Label>
                                    <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Snapshot Reference</span>
                                </div>
                                <Select
                                    onValueChange={(val) => {
                                        const selected = dosens.find((d) => String(d.id) === val);

                                        if (selected) {
                                            setData((prev) => ({
                                                ...prev,
                                                ketua_prodi_nama: selected.nama_bergelar || selected.nama_lengkap,
                                                ketua_prodi_nidn: selected.nidn || selected.niy_nip || '',
                                            }));
                                        }
                                    }}
                                >
                                    <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-900">
                                        <SelectValue placeholder="-- Pilih Dosen untuk Kaprodi --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dosens.map((d) => (
                                            <SelectItem key={d.id} value={String(d.id)} className="text-xs">
                                                <span className="font-mono text-muted-foreground mr-1.5">[{d.nidn || d.niy_nip || 'Tanpa NIDN'}]</span>
                                                <span className="font-medium">{d.nama_bergelar || d.nama_lengkap}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[11px] text-muted-foreground">
                                    Memilih dosen akan otomatis mengisi kolom Nama Bergelar dan NIDN Kaprodi di bawah.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Ketua Prodi (Nama & Gelar)</Label>
                                    <Input
                                        value={data.ketua_prodi_nama}
                                        onChange={(e) => setData('ketua_prodi_nama', e.target.value)}
                                        className="h-8 text-xs"
                                        placeholder="Nama Lengkap & Gelar Kaprodi"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">NIDN Ketua Prodi</Label>
                                    <Input
                                        value={data.ketua_prodi_nidn}
                                        onChange={(e) => setData('ketua_prodi_nidn', e.target.value)}
                                        className="h-8 text-xs font-mono"
                                        placeholder="NIDN Kaprodi"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs">Sekretaris Prodi</Label>
                                        <Select
                                            onValueChange={(val) => {
                                                const selected = dosens.find((d) => String(d.id) === val);

                                                if (selected) {
                                                    const name = selected.nama_bergelar || selected.nama_lengkap;
                                                    setData('sekretaris_prodi_nama', name);
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="h-6 text-[10px] px-1.5 py-0 border-dashed text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/50 border-emerald-300 w-auto gap-1">
                                                <span>Pilih Dosen</span>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {dosens.map((d) => (
                                                    <SelectItem key={d.id} value={String(d.id)} className="text-xs">
                                                        <span className="font-mono text-muted-foreground mr-1.5">[{d.nidn || d.niy_nip || '-'}]</span>
                                                        <span>{d.nama_bergelar || d.nama_lengkap}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Input
                                        value={data.sekretaris_prodi_nama}
                                        onChange={(e) => setData('sekretaris_prodi_nama', e.target.value)}
                                        className="h-8 text-xs"
                                        placeholder="Nama Lengkap & Gelar Sekprodi"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Informasi Akademik */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-3">
                                3. Pengaturan & Ketentuan Akademik
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">SKS Lulus Minimal</Label>
                                    <Input
                                        type="number"
                                        value={data.sks_lulus_min}
                                        onChange={(e) => setData('sks_lulus_min', Number(e.target.value))}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">IPK Lulus Minimal</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={data.ipk_lulus_min}
                                        onChange={(e) => setData('ipk_lulus_min', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Jenis Tugas Akhir</Label>
                                    <Input
                                        value={data.jenis_tugas_akhir}
                                        onChange={(e) => setData('jenis_tugas_akhir', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Maksimal Pembimbing</Label>
                                    <Input
                                        type="number"
                                        value={data.max_dosen_pembimbing}
                                        onChange={(e) => setData('max_dosen_pembimbing', Number(e.target.value))}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Maksimal Penguji</Label>
                                    <Input
                                        type="number"
                                        value={data.max_dosen_penguji}
                                        onChange={(e) => setData('max_dosen_penguji', Number(e.target.value))}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Pengaturan Transfer Nilai</Label>
                                    <Input
                                        value={data.pengaturan_transfer_nilai}
                                        onChange={(e) => setData('pengaturan_transfer_nilai', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Akreditasi */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-3">
                                4. Akreditasi Program Studi
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Lembaga Akreditasi</Label>
                                    <Input
                                        value={data.lembaga_akreditasi}
                                        onChange={(e) => setData('lembaga_akreditasi', e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Peringkat (Akreditasi)</Label>
                                    <Input
                                        value={data.akreditasi}
                                        onChange={(e) => setData('akreditasi', e.target.value)}
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
                                    <Label className="text-xs">Tanggal SK</Label>
                                    <Input
                                        type="date"
                                        value={data.tanggal_sk_akreditasi}
                                        onChange={(e) => setData('tanggal_sk_akreditasi', e.target.value)}
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

            {/* Modal Tambah Konsentrasi */}
            <Dialog open={isAddKonsentrasiOpen} onOpenChange={setIsAddKonsentrasiOpen}>
                <DialogContent className="sm:max-w-md bg-white">
                    <form onSubmit={handleAddKonsentrasi}>
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Layers className="size-5 text-emerald-600" />
                                <span>Tambah Bidang Konsentrasi</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Masukkan nama peminatan atau konsentrasi keilmuan untuk program studi ini.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-3 text-xs">
                            <div className="space-y-1">
                                <Label htmlFor="konsentrasi-nama" className="text-xs font-semibold">
                                    Nama Bidang Konsentrasi / Peminatan
                                </Label>
                                <Input
                                    id="konsentrasi-nama"
                                    value={addKonsentrasiForm.data.nama}
                                    onChange={(e) => addKonsentrasiForm.setData('nama', e.target.value)}
                                    placeholder="Contoh: Pendidikan Agama Islam Transformatif"
                                    required
                                />
                                {addKonsentrasiForm.errors.nama && (
                                    <p className="text-rose-600 text-[11px]">{addKonsentrasiForm.errors.nama}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddKonsentrasiOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={addKonsentrasiForm.processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            >
                                {addKonsentrasiForm.processing ? 'Menyimpan...' : 'Simpan Konsentrasi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Konsentrasi */}
            <Dialog open={!!editingKonsentrasi} onOpenChange={(open) => !open && setEditingKonsentrasi(null)}>
                <DialogContent className="sm:max-w-md bg-white">
                    <form onSubmit={handleEditKonsentrasi}>
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Edit className="size-5 text-emerald-600" />
                                <span>Edit Bidang Konsentrasi</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                Perbarui nama peminatan atau konsentrasi keilmuan.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-3 text-xs">
                            <div className="space-y-1">
                                <Label htmlFor="edit-konsentrasi-nama" className="text-xs font-semibold">
                                    Nama Bidang Konsentrasi / Peminatan
                                </Label>
                                <Input
                                    id="edit-konsentrasi-nama"
                                    value={editKonsentrasiForm.data.nama}
                                    onChange={(e) => editKonsentrasiForm.setData('nama', e.target.value)}
                                    required
                                />
                                {editKonsentrasiForm.errors.nama && (
                                    <p className="text-rose-600 text-[11px]">{editKonsentrasiForm.errors.nama}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingKonsentrasi(null)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={editKonsentrasiForm.processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            >
                                {editKonsentrasiForm.processing ? 'Menyimpan...' : 'Perbarui Konsentrasi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

ProgramStudiShow.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Data Pelengkap', href: '/master/program-studi' },
        { title: 'Program Studi', href: '/master/program-studi' },
        { title: 'Detail Program Studi', href: '/master/program-studi' },
    ],
};

