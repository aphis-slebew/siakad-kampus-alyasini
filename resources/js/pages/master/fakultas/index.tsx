import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';

import { Building2, Edit, Plus, Trash2 } from 'lucide-react';
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

type Fakultas = {
    id: number;
    kode: string;
    nama: string;
    program_studis_count?: number;
};

export default function FakultasIndex({ fakultas = [] }: { fakultas: Fakultas[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingFakultas, setEditingFakultas] = useState<Fakultas | null>(null);

    const createForm = useForm({
        kode: '',
        nama: '',
    });

    const editForm = useForm({
        kode: '',
        nama: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/master/fakultas', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFakultas) return;

        editForm.put(`/master/fakultas/${editingFakultas.id}`, {
            onSuccess: () => {
                setEditingFakultas(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (item: Fakultas) => {
        if (confirm(`Apakah Anda yakin ingin menghapus fakultas ${item.nama}?`)) {
            router.delete(`/master/fakultas/${item.id}`);
        }
    };

    const openEditModal = (item: Fakultas) => {
        setEditingFakultas(item);
        editForm.setData({
            kode: item.kode,
            nama: item.nama,
        });
    };

    return (
        <>
            <Head title="Kelola Fakultas" />

            <div className="p-6 space-y-6">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Fakultas</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Kelola data fakultas penyelenggara program studi di STAI Al-Yasini.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Tambah Fakultas
                    </Button>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-border-default pb-2">
                    <span className="px-3 py-1.5 text-xs font-semibold text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5 rounded-t-md">
                        Fakultas
                    </span>
                    <Link
                        href="/master/program-studi"
                        className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-base rounded-md transition-colors"
                    >
                        Program Studi
                    </Link>
                </div>

                {/* Data Table */}

                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {fakultas.length === 0 ? (
                        <div className="p-12 text-center">
                            <Building2 className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Belum ada data fakultas</h3>
                            <p className="text-xs text-text-secondary mt-1 mb-4">
                                Silakan tambahkan data fakultas baru untuk memulai struktur akademik.
                            </p>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md inline-flex items-center gap-1.5"
                            >
                                <Plus className="size-4" />
                                Tambah Fakultas
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-surface-base border-b border-border-default text-text-secondary font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12">No</th>
                                        <th className="py-3 px-4 w-32 font-mono">Kode</th>
                                        <th className="py-3 px-4">Nama Fakultas</th>
                                        <th className="py-3 px-4 text-center w-36">Jumlah Prodi</th>
                                        <th className="py-3 px-4 text-right w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default text-text-primary">
                                    {fakultas.map((item, index) => (
                                        <tr key={item.id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                            <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                            <td className="py-3 px-4 font-mono font-semibold text-brand-primary">{item.kode}</td>
                                            <td className="py-3 px-4 font-semibold">{item.nama}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-primary/10 text-brand-primary">
                                                    {item.program_studis_count || 0} Prodi
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-brand-primary hover:bg-surface-base transition-colors duration-150"
                                                        title="Edit Fakultas"
                                                    >
                                                        <Edit className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-status-danger hover:bg-surface-base transition-colors duration-150"
                                                        title="Hapus Fakultas"
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

            {/* Modal Tambah Fakultas */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Tambah Fakultas Baru</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Isi formulir berikut untuk menambahkan fakultas baru.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="kode" className="text-xs font-semibold text-text-primary">
                                Kode Fakultas <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="kode"
                                placeholder="Misal: FTI"
                                value={createForm.data.kode}
                                onChange={(e) => createForm.setData('kode', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {createForm.errors.kode && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.kode}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="nama" className="text-xs font-semibold text-text-primary">
                                Nama Fakultas <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="nama"
                                placeholder="Misal: Fakultas Tarbiyah dan Ilmu Keguruan"
                                value={createForm.data.nama}
                                onChange={(e) => createForm.setData('nama', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {createForm.errors.nama && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.nama}</p>
                            )}
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
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Fakultas'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Fakultas */}
            <Dialog open={!!editingFakultas} onOpenChange={(open) => !open && setEditingFakultas(null)}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Edit Fakultas</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Perbarui informasi fakultas.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_kode" className="text-xs font-semibold text-text-primary">
                                Kode Fakultas <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="edit_kode"
                                value={editForm.data.kode}
                                onChange={(e) => editForm.setData('kode', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {editForm.errors.kode && (
                                <p className="text-[11px] text-status-danger">{editForm.errors.kode}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_nama" className="text-xs font-semibold text-text-primary">
                                Nama Fakultas <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="edit_nama"
                                value={editForm.data.nama}
                                onChange={(e) => editForm.setData('nama', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {editForm.errors.nama && (
                                <p className="text-[11px] text-status-danger">{editForm.errors.nama}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingFakultas(null)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
                            >
                                {editForm.processing ? 'Menyimpan...' : 'Perbarui Fakultas'}
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
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Master Data',
            href: '#',
        },
        {
            title: 'Fakultas',
            href: '/master/fakultas',
        },
    ],
};
