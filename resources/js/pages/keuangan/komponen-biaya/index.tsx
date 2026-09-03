import { Head, Link, useForm, router } from '@inertiajs/react';
import { Coins, Plus, Edit, Trash2, Filter, Receipt, CheckCircle, Clock } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

interface KomponenBiaya {
    id: number;
    kode: string;
    nama: string;
    kategori: string;
    program_studi_id: number | null;
    angkatan: number | null;
    nominal: string | number;
    is_active: boolean;
    keterangan: string | null;
    program_studi?: {
        id: number;
        nama: string;
    };
}

interface ProgramStudi {
    id: number;
    kode: string;
    nama: string;
}

interface Props {
    komponens: KomponenBiaya[];
    programStudis: ProgramStudi[];
    filters: {
        kategori: string;
        program_studi_id: string;
    };
}

export default function KomponenBiayaIndex({ komponens, programStudis, filters }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<KomponenBiaya | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        kode: '',
        nama: '',
        kategori: 'akademik',
        program_studi_id: '' as string | number,
        angkatan: '' as string | number,
        nominal: '',
        is_active: true,
        keterangan: '',
    });

    const openCreateModal = () => {
        reset();
        setEditingItem(null);
        setIsCreateOpen(true);
    };

    const openEditModal = (item: KomponenBiaya) => {
        setEditingItem(item);
        setData({
            kode: item.kode,
            nama: item.nama,
            kategori: item.kategori,
            program_studi_id: item.program_studi_id || '',
            angkatan: item.angkatan || '',
            nominal: String(item.nominal),
            is_active: item.is_active,
            keterangan: item.keterangan || '',
        });
        setIsCreateOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingItem) {
            put(`/keuangan/komponen-biaya/${editingItem.id}`, {
                onSuccess: () => setIsCreateOpen(false),
            });
        } else {
            post('/keuangan/komponen-biaya', {
                onSuccess: () => setIsCreateOpen(false),
            });
        }
    };

    const handleDelete = (item: KomponenBiaya) => {
        if (confirm(`Hapus tarif komponen biaya "${item.nama}"?`)) {
            router.delete(`/keuangan/komponen-biaya/${item.id}`);
        }
    };

    const formatRupiah = (val: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(val));
    };

    return (
        <>
            <Head title="Tarif Komponen Biaya & UKT" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
                {/* Header & Sub-Navigation */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
                            <Coins className="size-6 text-brand-primary" />
                            <span>Tarif Komponen Biaya Kampus</span>
                        </h1>
                        <p className="text-sm text-text-secondary mt-1">
                            Kelola berbagai jenis tarif biaya perkuliahan: SPP/UKT, UTS/UAS, KKN/PBL, Ujian Skripsi, Wisuda, dan Pendaftaran PMB.
                        </p>
                    </div>

                    <Button
                        onClick={openCreateModal}
                        size="sm"
                        className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="size-3.5" />
                        <span>Tambah Tarif Biaya</span>
                    </Button>
                </div>

                {/* Sub-nav tabs */}
                <div className="flex items-center gap-2 border-b border-border-default pb-2 overflow-x-auto whitespace-nowrap text-xs font-medium">
                    <Link
                        href="/keuangan/kasir"
                        className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    >
                        Kasir Pembayaran POS
                    </Link>
                    <Link
                        href="/keuangan/komponen-biaya"
                        className="px-3 py-1.5 rounded-md bg-brand-primary/10 text-brand-primary font-semibold"
                    >
                        Tarif Komponen Biaya
                    </Link>
                    <Link
                        href="/keuangan/kelompok-ukt"
                        className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    >
                        Kelompok UKT
                    </Link>
                    <Link
                        href="/keuangan/pembayaran"
                        className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    >
                        Verifikasi Transfer Bank
                    </Link>
                    <Link
                        href="/keuangan/periode-registrasi"
                        className="px-3 py-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    >
                        Periode Registrasi
                    </Link>
                </div>

                {/* Filter Toolbar */}
                <Card className="border border-border-default shadow-xs">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-text-secondary font-medium">Kategori:</span>
                            {['all', 'akademik', 'kegiatan', 'pendaftaran', 'kelulusan'].map((kat) => (
                                <Link
                                    key={kat}
                                    href={`/keuangan/komponen-biaya?kategori=${kat}&program_studi_id=${filters.program_studi_id}`}
                                    className={`px-2.5 py-1 rounded-full text-xs capitalize ${
                                        filters.kategori === kat
                                            ? 'bg-brand-primary text-white font-medium'
                                            : 'bg-surface-base text-text-secondary hover:bg-surface-hover border border-border-default'
                                    }`}
                                >
                                    {kat === 'all' ? 'Semua Kategori' : kat}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <Label className="text-xs text-text-secondary whitespace-nowrap">Prodi:</Label>
                            <select
                                value={filters.program_studi_id}
                                onChange={(e) => router.get(`/keuangan/komponen-biaya?kategori=${filters.kategori}&program_studi_id=${e.target.value}`)}
                                className="h-8 text-xs border border-border-default rounded-md px-2 bg-surface-base"
                            >
                                <option value="all">Semua Program Studi</option>
                                {programStudis.map((p) => (
                                    <option key={p.id} value={p.id}>{p.nama}</option>
                                ))}
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Table of Fee Components */}
                <Card className="border border-border-default shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-surface-base border-b border-border-default text-text-secondary font-medium uppercase tracking-wider">
                                    <th className="p-3 w-12 text-center">No</th>
                                    <th className="p-3 w-28">Kode Biaya</th>
                                    <th className="p-3">Nama Komponen Biaya</th>
                                    <th className="p-3 w-28">Kategori</th>
                                    <th className="p-3 w-40">Program Studi</th>
                                    <th className="p-3 w-24 text-center">Angkatan</th>
                                    <th className="p-3 text-right w-36">Nominal Standar</th>
                                    <th className="p-3 w-24 text-center">Status</th>
                                    <th className="p-3 w-24 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-default">
                                {komponens.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="p-8 text-center text-text-secondary italic">
                                            Belum ada data komponen tarif biaya. Klik tombol "Tambah Tarif Biaya" di atas.
                                        </td>
                                    </tr>
                                ) : (
                                    komponens.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-surface-hover transition-colors">
                                            <td className="p-3 text-center text-text-secondary font-mono">{idx + 1}</td>
                                            <td className="p-3 font-mono font-semibold text-text-primary">{item.kode}</td>
                                            <td className="p-3">
                                                <span className="font-semibold text-text-primary block">{item.nama}</span>
                                                {item.keterangan && <span className="text-[11px] text-text-secondary block">{item.keterangan}</span>}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                                    item.kategori === 'akademik'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : item.kategori === 'kegiatan'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : item.kategori === 'pendaftaran'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-emerald-100 text-emerald-800'
                                                }`}>
                                                    {item.kategori}
                                                </span>
                                            </td>
                                            <td className="p-3 text-text-primary">
                                                {item.program_studi ? item.program_studi.nama : <span className="text-text-secondary italic">Semua Prodi</span>}
                                            </td>
                                            <td className="p-3 text-center text-text-primary font-mono">
                                                {item.angkatan || 'Semua'}
                                            </td>
                                            <td className="p-3 text-right font-semibold text-emerald-700 font-mono">
                                                {formatRupiah(item.nominal)}
                                            </td>
                                            <td className="p-3 text-center">
                                                {item.is_active ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Aktif</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">Nonaktif</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        onClick={() => openEditModal(item)}
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0 text-text-secondary hover:text-brand-primary"
                                                    >
                                                        <Edit className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(item)}
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0 text-text-secondary hover:text-red-600"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Create/Edit Modal Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Komponen Biaya' : 'Tambah Komponen Biaya Baru'}</DialogTitle>
                        <DialogDescription>
                            Tentukan kode, nama, kategori, prodi dan besaran nominal standar biaya.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Kode Komponen Biaya</Label>
                                <Input
                                    value={data.kode}
                                    onChange={(e) => setData('kode', e.target.value.toUpperCase())}
                                    placeholder="e.g. UKT, UTS, KKN"
                                    className="h-8 text-xs font-mono"
                                />
                                {errors.kode && <p className="text-[11px] text-red-600">{errors.kode}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Kategori Biaya</Label>
                                <select
                                    value={data.kategori}
                                    onChange={(e) => setData('kategori', e.target.value)}
                                    className="w-full h-8 text-xs border border-border-default rounded-md px-2 bg-surface-base capitalize"
                                >
                                    <option value="akademik">Akademik (SPP/UKT/UTS/UAS)</option>
                                    <option value="kegiatan">Kegiatan (KKN/PBL/PPL)</option>
                                    <option value="pendaftaran">Pendaftaran (Formulir PMB/Her-Reg)</option>
                                    <option value="kelulusan">Kelulusan (Skripsi/Wisuda)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Nama Biaya</Label>
                            <Input
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                placeholder="e.g. Biaya Kuliah Kerja Nyata (KKN)"
                                className="h-8 text-xs"
                            />
                            {errors.nama && <p className="text-[11px] text-red-600">{errors.nama}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Program Studi</Label>
                                <select
                                    value={data.program_studi_id}
                                    onChange={(e) => setData('program_studi_id', e.target.value)}
                                    className="w-full h-8 text-xs border border-border-default rounded-md px-2 bg-surface-base"
                                >
                                    <option value="">Semua Program Studi</option>
                                    {programStudis.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nama}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Angkatan (Tahun Masuk)</Label>
                                <Input
                                    type="number"
                                    value={data.angkatan}
                                    onChange={(e) => setData('angkatan', e.target.value)}
                                    placeholder="Semua Angkatan"
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Nominal Standar (Rp)</Label>
                            <Input
                                type="number"
                                value={data.nominal}
                                onChange={(e) => setData('nominal', e.target.value)}
                                placeholder="0"
                                className="h-8 text-xs font-mono font-semibold"
                            />
                            {errors.nominal && <p className="text-[11px] text-red-600">{errors.nominal}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Keterangan Tambahan</Label>
                            <Input
                                value={data.keterangan}
                                onChange={(e) => setData('keterangan', e.target.value)}
                                placeholder="e.g. Dibayarkan sebelum pengajuan sidang"
                                className="h-8 text-xs"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded text-brand-primary focus:ring-brand-primary"
                            />
                            <Label htmlFor="is_active" className="text-xs cursor-pointer">
                                Aktifkan tarif biaya ini untuk penagihan
                            </Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" size="sm" disabled={processing} className="bg-brand-primary text-white">
                                {processing ? 'Menyimpan...' : 'Simpan Tarif'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

KomponenBiayaIndex.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Keuangan', href: '/keuangan/kasir' },
        { title: 'Tarif Komponen Biaya', href: '/keuangan/komponen-biaya' },
    ],
};

