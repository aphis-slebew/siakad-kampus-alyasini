import { Head, Link, router, useForm } from '@inertiajs/react';
import { Building2, Edit, Plus, Trash2, Users, MapPin, CheckCircle } from 'lucide-react';
import { useState } from 'react';

import { useConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MasterDataNav } from '@/components/master-data-nav';

type Fakultas = {
    id: number;
    kode: string;
    nama: string;
    nama_en?: string | null;
    telepon?: string | null;
    periode_berdiri?: string | null;
    visi?: string | null;
    misi?: string | null;
    nama_singkat?: string | null;
    alamat?: string | null;
    tahun_berdiri?: number | null;
    status: string;
    luas_m2?: string | null;
    dekan_nama?: string | null;
    dekan_nidn?: string | null;
    wakil_dekan_1?: string | null;
    wakil_dekan_2?: string | null;
    wakil_dekan_3?: string | null;
    wakil_dekan_4?: string | null;
    program_studis_count?: number;
};

type DosenOption = {
    id: number;
    nama_lengkap: string;
    nidn: string | null;
};

export default function FakultasIndex({
    fakultas = [],
    dosens = [],
}: {
    fakultas: Fakultas[];
    dosens?: DosenOption[];
}) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingFakultas, setEditingFakultas] = useState<Fakultas | null>(null);

    const form = useForm({
        kode: '',
        nama: '',
        nama_en: '',
        telepon: '',
        periode_berdiri: '',
        visi: '',
        misi: '',
        nama_singkat: '',
        alamat: '',
        tahun_berdiri: '' as string | number,
        status: 'aktif',
        luas_m2: '',
        dekan_nama: '',
        dekan_nidn: '',
        wakil_dekan_1: '',
        wakil_dekan_2: '',
        wakil_dekan_3: '',
        wakil_dekan_4: '',
    });

    const openCreateModal = () => {
        form.reset();
        setEditingFakultas(null);
        setIsCreateOpen(true);
    };

    const openEditModal = (item: Fakultas) => {
        setEditingFakultas(item);
        form.setData({
            kode: item.kode,
            nama: item.nama,
            nama_en: item.nama_en || '',
            telepon: item.telepon || '',
            periode_berdiri: item.periode_berdiri || '',
            visi: item.visi || '',
            misi: item.misi || '',
            nama_singkat: item.nama_singkat || '',
            alamat: item.alamat || '',
            tahun_berdiri: item.tahun_berdiri || '',
            status: item.status || 'aktif',
            luas_m2: item.luas_m2 || '',
            dekan_nama: item.dekan_nama || '',
            dekan_nidn: item.dekan_nidn || '',
            wakil_dekan_1: item.wakil_dekan_1 || '',
            wakil_dekan_2: item.wakil_dekan_2 || '',
            wakil_dekan_3: item.wakil_dekan_3 || '',
            wakil_dekan_4: item.wakil_dekan_4 || '',
        });
        setIsCreateOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingFakultas) {
            form.put(`/master/fakultas/${editingFakultas.id}`, {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    setEditingFakultas(null);
                },
            });
        } else {
            form.post('/master/fakultas', {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    form.reset();
                },
            });
        }
    };

    const { confirm, confirmDialog } = useConfirmDialog();

    const handleDelete = (item: Fakultas) => {
        confirm({
            title: 'Hapus Fakultas',
            description: `Apakah Anda yakin ingin menghapus fakultas "${item.nama}" (${item.kode})? Seluruh program studi dan data terkait di bawah fakultas ini akan terpengaruh.`,
            variant: 'destructive',
            confirmText: 'Ya, Hapus',
            onConfirm: () => {
                router.delete(`/master/fakultas/${item.id}`);
            },
        });
    };

    return (
        <>
            {confirmDialog}
            <Head title="Kelola Fakultas" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto">
                {/* Clean Dropdown Breadcrumb Nav */}
                <MasterDataNav currentHref="/master/fakultas" />

                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                            <Building2 className="size-6 sm:size-7" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Fakultas & Unit Pengelola
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Kelola data fakultas, pimpinan dekanat (Dekan & Wadek 1–4), dan luas wilayah di STAI Al-Yasini.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={openCreateModal}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition self-start sm:self-auto cursor-pointer"
                    >
                        <Plus className="size-4" />
                        <span>Tambah Fakultas</span>
                    </Button>
                </div>

                {/* Table Container */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs border-t-2 border-t-emerald-600">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                                    <th className="p-3 w-16 text-center">Kode</th>
                                    <th className="p-3">Nama Fakultas</th>
                                    <th className="p-3">Pimpinan Dekanat (Dekan & Wadek)</th>
                                    <th className="p-3 text-center w-28">Tahun Berdiri</th>
                                    <th className="p-3 text-center w-28">Program Studi</th>
                                    <th className="p-3 text-center w-24">Status</th>
                                    <th className="p-3 text-center w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-default">
                                {fakultas.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-text-secondary italic">
                                            Belum ada data fakultas. Klik "Tambah Fakultas" untuk menambahkan data baru.
                                        </td>
                                    </tr>
                                ) : (
                                    fakultas.map((item) => (
                                        <tr key={item.id} className="hover:bg-surface-hover transition-colors">
                                            <td className="p-3 text-center font-mono font-semibold text-text-primary">
                                                {item.kode}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="size-4 text-brand-primary shrink-0" />
                                                    <div>
                                                        <span className="font-semibold text-text-primary block">
                                                            {item.nama}
                                                        </span>
                                                        {item.nama_singkat && (
                                                            <span className="text-[11px] text-text-secondary block">
                                                                Singkatan: {item.nama_singkat} {item.luas_m2 ? `| Luas: ${item.luas_m2}` : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="space-y-0.5">
                                                    <div className="text-text-primary font-medium">
                                                        <span className="text-text-secondary text-[11px]">Dekan: </span>
                                                        {item.dekan_nama ? (
                                                            <span>{item.dekan_nama} {item.dekan_nidn ? `(${item.dekan_nidn})` : ''}</span>
                                                        ) : (
                                                            <span className="text-text-secondary italic">-</span>
                                                        )}
                                                    </div>
                                                    {(item.wakil_dekan_1 || item.wakil_dekan_2) && (
                                                        <div className="text-[11px] text-text-secondary">
                                                            {item.wakil_dekan_1 && <span>Wadek 1: {item.wakil_dekan_1} </span>}
                                                            {item.wakil_dekan_2 && <span>| Wadek 2: {item.wakil_dekan_2}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 text-center text-text-secondary font-mono">
                                                {item.tahun_berdiri || '-'}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-primary/10 text-brand-primary">
                                                    {item.program_studis_count || 0} Prodi
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                                                    item.status === 'aktif'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {item.status || 'aktif'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Link
                                                        href={`/master/fakultas/${item.id}`}
                                                        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition"
                                                        title="Lihat Detail & Visi Misi Fakultas"
                                                    >
                                                        <Building2 className="size-3.5" />
                                                    </Link>
                                                    <Button
                                                        onClick={() => openEditModal(item)}
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0 text-text-secondary hover:text-brand-primary"
                                                        title="Edit Cepat"
                                                    >
                                                        <Edit className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(item)}
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0 text-text-secondary hover:text-red-600"
                                                        title="Hapus Fakultas"
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
                </div>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingFakultas ? 'Edit Data Fakultas' : 'Tambah Fakultas Baru'}</DialogTitle>
                        <DialogDescription>
                            Lengkapi identitas fakultas, pejabat pimpinan dekanat (Dekan & Wadek 1–4), serta lokasi.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Kode Fakultas</Label>
                                <Input
                                    value={form.data.kode}
                                    onChange={(e) => form.setData('kode', e.target.value.toUpperCase())}
                                    placeholder="e.g. FAI"
                                    className="h-8 text-xs font-mono"
                                />
                                {form.errors.kode && <p className="text-[11px] text-red-600">{form.errors.kode}</p>}
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                                <Label className="text-xs">Nama Lengkap Fakultas</Label>
                                <Input
                                    value={form.data.nama}
                                    onChange={(e) => form.setData('nama', e.target.value)}
                                    placeholder="e.g. Fakultas Agama Islam"
                                    className="h-8 text-xs"
                                />
                                {form.errors.nama && <p className="text-[11px] text-red-600">{form.errors.nama}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Nama Inggris (EN)</Label>
                                <Input
                                    value={form.data.nama_en}
                                    onChange={(e) => form.setData('nama_en', e.target.value)}
                                    placeholder="e.g. Faculty of Islamic Studies"
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">No. Telepon / Hotline</Label>
                                <Input
                                    value={form.data.telepon}
                                    onChange={(e) => form.setData('telepon', e.target.value)}
                                    placeholder="e.g. 0343-421234"
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Nama Singkat</Label>
                                <Input
                                    value={form.data.nama_singkat}
                                    onChange={(e) => form.setData('nama_singkat', e.target.value)}
                                    placeholder="e.g. FAI"
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Tahun Berdiri</Label>
                                <Input
                                    type="number"
                                    value={form.data.tahun_berdiri}
                                    onChange={(e) => form.setData('tahun_berdiri', e.target.value)}
                                    placeholder="2012"
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Periode Berdiri</Label>
                                <Input
                                    value={form.data.periode_berdiri}
                                    onChange={(e) => form.setData('periode_berdiri', e.target.value)}
                                    placeholder="e.g. 20121"
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Status</Label>
                                <select
                                    value={form.data.status}
                                    onChange={(e) => form.setData('status', e.target.value)}
                                    className="w-full h-8 text-xs border border-border-default rounded-md px-2 bg-surface-base"
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="nonaktif">Nonaktif</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Dekan (Nama Lengkap & Gelar)</Label>
                                <Input
                                    value={form.data.dekan_nama}
                                    onChange={(e) => form.setData('dekan_nama', e.target.value)}
                                    placeholder="e.g. Dr. H. Ahmad Fauzi, M.Pd.I"
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">NIDN Dekan</Label>
                                <Input
                                    value={form.data.dekan_nidn}
                                    onChange={(e) => form.setData('dekan_nidn', e.target.value)}
                                    placeholder="e.g. 2108098201"
                                    className="h-8 text-xs font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Wakil Dekan 1 (Bid. Akademik)</Label>
                                <Input
                                    value={form.data.wakil_dekan_1}
                                    onChange={(e) => form.setData('wakil_dekan_1', e.target.value)}
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Wakil Dekan 2 (Bid. Keuangan & Umum)</Label>
                                <Input
                                    value={form.data.wakil_dekan_2}
                                    onChange={(e) => form.setData('wakil_dekan_2', e.target.value)}
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Wakil Dekan 3 (Bid. Kemahasiswaan)</Label>
                                <Input
                                    value={form.data.wakil_dekan_3}
                                    onChange={(e) => form.setData('wakil_dekan_3', e.target.value)}
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Wakil Dekan 4 (Bid. Kelembagaan/Kerjasama)</Label>
                                <Input
                                    value={form.data.wakil_dekan_4}
                                    onChange={(e) => form.setData('wakil_dekan_4', e.target.value)}
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1 sm:col-span-2">
                                <Label className="text-xs">Alamat Kantor Fakultas</Label>
                                <Input
                                    value={form.data.alamat}
                                    onChange={(e) => form.setData('alamat', e.target.value)}
                                    placeholder="e.g. Gedung A Lantai 2 Kampus Al-Yasini"
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Luas Wilayah (m²)</Label>
                                <Input
                                    value={form.data.luas_m2}
                                    onChange={(e) => form.setData('luas_m2', e.target.value)}
                                    placeholder="e.g. 1200 m2"
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" size="sm" disabled={form.processing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                                {form.processing ? 'Menyimpan...' : 'Simpan Data'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

FakultasIndex.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Data Pelengkap', href: '/master/fakultas' },
        { title: 'Fakultas', href: '/master/fakultas' },
    ],
};

