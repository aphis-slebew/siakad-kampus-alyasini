import { Head, Link, router, useForm } from '@inertiajs/react';
import { CreditCard, Edit, Plus, Trash2 } from 'lucide-react';
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

type Jalur = {
    id: number;
    nama: string;
    biaya_pendaftaran: number;
};

export default function JalurIndex({ jalurs = [] }: { jalurs: Jalur[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingJalur, setEditingJalur] = useState<Jalur | null>(null);

    const createForm = useForm({
        nama: '',
        biaya_pendaftaran: 250000,
    });

    const editForm = useForm({
        nama: '',
        biaya_pendaftaran: 250000,
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/pmb/jalur', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingJalur) {
return;
}

        editForm.put(`/pmb/jalur/${editingJalur.id}`, {
            onSuccess: () => {
                setEditingJalur(null);
                editForm.reset();
            },
        });
    };

    const { confirm, confirmDialog } = useConfirmDialog();

    const handleDelete = (item: Jalur) => {
        confirm({
            title: 'Hapus Jalur Pendaftaran',
            description: `Apakah Anda yakin ingin menghapus jalur pendaftaran "${item.nama}" (Biaya: Rp ${Number(item.biaya_pendaftaran).toLocaleString('id-ID')})? Calon mahasiswa yang mendaftar melalui jalur ini akan terpengaruh.`,
            variant: 'destructive',
            confirmText: 'Ya, Hapus',
            onConfirm: () => {
                router.delete(`/pmb/jalur/${item.id}`);
            },
        });
    };

    const openEditModal = (item: Jalur) => {
        setEditingJalur(item);
        editForm.setData({
            nama: item.nama,
            biaya_pendaftaran: Number(item.biaya_pendaftaran),
        });
    };

    return (
        <>
            {confirmDialog}
            <Head title="Kelola Jalur PMB" />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Jalur Pendaftaran PMB</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Kelola kategori dan biaya jalur pendaftaran (Reguler, Prestasi, Beasiswa) di STAI Al-Yasini.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Tambah Jalur
                    </Button>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-border-default pb-2 overflow-x-auto whitespace-nowrap">
                    <Link
                        href="/pmb/gelombang"
                        className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-base rounded-md transition-colors"
                    >
                        Gelombang Pendaftaran
                    </Link>
                    <span className="px-3 py-1.5 text-xs font-semibold text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5 rounded-t-md">
                        Jalur Pendaftaran
                    </span>
                </div>

                {/* Data Table */}
                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {jalurs.length === 0 ? (
                        <div className="p-12 text-center">
                            <CreditCard className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Belum ada jalur pendaftaran</h3>
                            <p className="text-xs text-text-secondary mt-1 mb-4">
                                Silakan buat jalur pendaftaran baru (misal: Reguler, Prestasi, Beasiswa).
                            </p>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md inline-flex items-center gap-1.5"
                            >
                                <Plus className="size-4" />
                                Tambah Jalur
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-surface-base border-b border-border-default text-text-secondary font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12">No</th>
                                        <th className="py-3 px-4">Nama Jalur Pendaftaran</th>
                                        <th className="py-3 px-4 font-mono w-44">Biaya Pendaftaran</th>
                                        <th className="py-3 px-4 text-right w-28">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default text-text-primary">
                                    {jalurs.map((item, index) => (
                                        <tr key={item.id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                            <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                            <td className="py-3 px-4 font-semibold text-brand-primary">{item.nama}</td>
                                            <td className="py-3 px-4 font-mono">
                                                Rp {Number(item.biaya_pendaftaran).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-brand-primary hover:bg-surface-base transition-colors duration-150"
                                                        title="Edit Jalur"
                                                    >
                                                        <Edit className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 rounded-md text-text-secondary hover:text-status-danger hover:bg-surface-base transition-colors duration-150"
                                                        title="Hapus Jalur"
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

            {/* Modal Tambah Jalur */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Tambah Jalur Pendaftaran</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Isi nama jalur dan nominal biaya pendaftaran.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="nama" className="text-xs font-semibold text-text-primary">
                                Nama Jalur Pendaftaran <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="nama"
                                placeholder="Misal: Jalur Reguler / Beasiswa KIP"
                                value={createForm.data.nama}
                                onChange={(e) => createForm.setData('nama', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {createForm.errors.nama && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.nama}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="biaya_pendaftaran" className="text-xs font-semibold text-text-primary">
                                Biaya Pendaftaran (Rp) <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="biaya_pendaftaran"
                                type="number"
                                min={0}
                                value={createForm.data.biaya_pendaftaran}
                                onChange={(e) => createForm.setData('biaya_pendaftaran', Number(e.target.value))}
                                className="text-xs border-border-default focus-visible:ring-brand-primary font-mono"
                            />
                            {createForm.errors.biaya_pendaftaran && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.biaya_pendaftaran}</p>
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
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Jalur'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Jalur */}
            <Dialog open={!!editingJalur} onOpenChange={(open) => !open && setEditingJalur(null)}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Edit Jalur Pendaftaran</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Perbarui detail jalur pendaftaran.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_nama" className="text-xs font-semibold text-text-primary">
                                Nama Jalur Pendaftaran <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="edit_nama"
                                value={editForm.data.nama}
                                onChange={(e) => editForm.setData('nama', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_biaya" className="text-xs font-semibold text-text-primary">
                                Biaya Pendaftaran (Rp) <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="edit_biaya"
                                type="number"
                                min={0}
                                value={editForm.data.biaya_pendaftaran}
                                onChange={(e) => editForm.setData('biaya_pendaftaran', Number(e.target.value))}
                                className="text-xs border-border-default focus-visible:ring-brand-primary font-mono"
                            />
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingJalur(null)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
                            >
                                Perbarui Jalur
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

JalurIndex.layout = {
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
            title: 'Jalur Pendaftaran',
            href: '/pmb/jalur',
        },
    ],
};
