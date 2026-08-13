import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';


import { Calendar, CheckCircle2, Edit, Plus, Trash2, XCircle } from 'lucide-react';
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

import { formatDateIndonesian } from '@/lib/utils';

type Gelombang = {

    id: number;
    nama: string;
    mulai_pendaftaran: string;
    selesai_pendaftaran: string;
    kuota: number;
    is_active: boolean;
    calon_mahasiswas_count?: number;
};

export default function GelombangIndex({ gelombangs = [] }: { gelombangs: Gelombang[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingGelombang, setEditingGelombang] = useState<Gelombang | null>(null);

    const createForm = useForm({
        nama: '',
        mulai_pendaftaran: '',
        selesai_pendaftaran: '',
        kuota: 100,
        is_active: true,
    });

    const editForm = useForm({
        nama: '',
        mulai_pendaftaran: '',
        selesai_pendaftaran: '',
        kuota: 100,
        is_active: true,
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/pmb/gelombang', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGelombang) return;

        editForm.put(`/pmb/gelombang/${editingGelombang.id}`, {
            onSuccess: () => {
                setEditingGelombang(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (item: Gelombang) => {
        if (confirm(`Apakah Anda yakin ingin menghapus gelombang ${item.nama}?`)) {
            router.delete(`/pmb/gelombang/${item.id}`);
        }
    };

    const openEditModal = (item: Gelombang) => {
        setEditingGelombang(item);
        editForm.setData({
            nama: item.nama,
            mulai_pendaftaran: item.mulai_pendaftaran,
            selesai_pendaftaran: item.selesai_pendaftaran,
            kuota: item.kuota,
            is_active: item.is_active,
        });
    };

    return (
        <>
            <Head title="Kelola Gelombang PMB" />

            <div className="p-6 space-y-6">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Gelombang Pendaftaran PMB</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Kelola periode dan kuota pendaftaran penerimaan mahasiswa baru STAI Al-Yasini.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Tambah Gelombang
                    </Button>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-border-default pb-2">
                    <span className="px-3 py-1.5 text-xs font-semibold text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5 rounded-t-md">
                        Gelombang Pendaftaran
                    </span>
                    <Link
                        href="/pmb/jalur"
                        className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-base rounded-md transition-colors"
                    >
                        Jalur Pendaftaran
                    </Link>
                </div>


                {/* Data Table */}
                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {gelombangs.length === 0 ? (
                        <div className="p-12 text-center">
                            <Calendar className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Belum ada gelombang pendaftaran</h3>
                            <p className="text-xs text-text-secondary mt-1 mb-4">
                                Silakan buat gelombang pendaftaran baru untuk membuka pendaftaran PMB.
                            </p>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md inline-flex items-center gap-1.5"
                            >
                                <Plus className="size-4" />
                                Tambah Gelombang
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-surface-base border-b border-border-default text-text-secondary font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12">No</th>
                                        <th className="py-3 px-4">Nama Gelombang</th>
                                        <th className="py-3 px-4 w-32 font-mono">Periode Mulai</th>
                                        <th className="py-3 px-4 w-32 font-mono">Periode Selesai</th>
                                        <th className="py-3 px-4 text-center w-28 font-mono">Kuota</th>
                                        <th className="py-3 px-4 text-center w-28">Status</th>
                                        <th className="py-3 px-4 text-right w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default text-text-primary">
                                    {gelombangs.map((item, index) => (
                                        <tr key={item.id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                            <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                            <td className="py-3 px-4 font-semibold text-brand-primary">{item.nama}</td>
                                            <td className="py-3 px-4 font-medium">{formatDateIndonesian(item.mulai_pendaftaran)}</td>
                                            <td className="py-3 px-4 font-medium">{formatDateIndonesian(item.selesai_pendaftaran)}</td>

                                            <td className="py-3 px-4 text-center font-mono">{item.kuota} Kursi</td>
                                            <td className="py-3 px-4 text-center">
                                                {item.is_active ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-status-success/10 text-status-success border border-status-success/20">
                                                        <CheckCircle2 className="size-3" />
                                                        Buka
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-base text-text-secondary border border-border-default">
                                                        <XCircle className="size-3" />
                                                        Tutup
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-brand-primary hover:bg-surface-base transition-colors duration-150"
                                                        title="Edit Gelombang"
                                                    >
                                                        <Edit className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-status-danger hover:bg-surface-base transition-colors duration-150"
                                                        title="Hapus Gelombang"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tambah Gelombang */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Tambah Gelombang PMB</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Isi detail nama dan tanggal periode pendaftaran.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="nama" className="text-xs font-semibold text-text-primary">
                                Nama Gelombang <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="nama"
                                placeholder="Misal: Gelombang 1 TA 2026/2027"
                                value={createForm.data.nama}
                                onChange={(e) => createForm.setData('nama', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {createForm.errors.nama && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.nama}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="mulai_pendaftaran" className="text-xs font-semibold text-text-primary">
                                    Mulai Pendaftaran <span className="text-status-danger">*</span>
                                </Label>
                                <Input
                                    id="mulai_pendaftaran"
                                    type="date"
                                    value={createForm.data.mulai_pendaftaran}
                                    onChange={(e) => createForm.setData('mulai_pendaftaran', e.target.value)}
                                    className="text-xs border-border-default focus-visible:ring-brand-primary"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="selesai_pendaftaran" className="text-xs font-semibold text-text-primary">
                                    Selesai Pendaftaran <span className="text-status-danger">*</span>
                                </Label>
                                <Input
                                    id="selesai_pendaftaran"
                                    type="date"
                                    value={createForm.data.selesai_pendaftaran}
                                    onChange={(e) => createForm.setData('selesai_pendaftaran', e.target.value)}
                                    className="text-xs border-border-default focus-visible:ring-brand-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="kuota" className="text-xs font-semibold text-text-primary">
                                Kuota Mahasiswa <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="kuota"
                                type="number"
                                min={1}
                                value={createForm.data.kuota}
                                onChange={(e) => createForm.setData('kuota', Number(e.target.value))}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={createForm.data.is_active}
                                onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                className="rounded border-border-default text-brand-primary focus:ring-brand-primary"
                            />
                            <Label htmlFor="is_active" className="text-xs font-semibold text-text-primary cursor-pointer">
                                Buka Pendaftaran (Aktif)
                            </Label>
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
                            >
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Gelombang'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Gelombang */}
            <Dialog open={!!editingGelombang} onOpenChange={(open) => !open && setEditingGelombang(null)}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Edit Gelombang PMB</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Perbarui detail gelombang pendaftaran.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_nama" className="text-xs font-semibold text-text-primary">
                                Nama Gelombang <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="edit_nama"
                                value={editForm.data.nama}
                                onChange={(e) => editForm.setData('nama', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit_mulai" className="text-xs font-semibold text-text-primary">
                                    Mulai Pendaftaran <span className="text-status-danger">*</span>
                                </Label>
                                <Input
                                    id="edit_mulai"
                                    type="date"
                                    value={editForm.data.mulai_pendaftaran}
                                    onChange={(e) => editForm.setData('mulai_pendaftaran', e.target.value)}
                                    className="text-xs border-border-default focus-visible:ring-brand-primary"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit_selesai" className="text-xs font-semibold text-text-primary">
                                    Selesai Pendaftaran <span className="text-status-danger">*</span>
                                </Label>
                                <Input
                                    id="edit_selesai"
                                    type="date"
                                    value={editForm.data.selesai_pendaftaran}
                                    onChange={(e) => editForm.setData('selesai_pendaftaran', e.target.value)}
                                    className="text-xs border-border-default focus-visible:ring-brand-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_kuota" className="text-xs font-semibold text-text-primary">
                                Kuota Mahasiswa <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="edit_kuota"
                                type="number"
                                min={1}
                                value={editForm.data.kuota}
                                onChange={(e) => editForm.setData('kuota', Number(e.target.value))}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="edit_is_active"
                                checked={editForm.data.is_active}
                                onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                className="rounded border-border-default text-brand-primary focus:ring-brand-primary"
                            />
                            <Label htmlFor="edit_is_active" className="text-xs font-semibold text-text-primary cursor-pointer">
                                Buka Pendaftaran (Aktif)
                            </Label>
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingGelombang(null)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
                            >
                                Perbarui Gelombang
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

GelombangIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'PMB',
            href: '#',
        },
        {
            title: 'Gelombang & Jalur',
            href: '/pmb/gelombang',
        },
    ],
};
