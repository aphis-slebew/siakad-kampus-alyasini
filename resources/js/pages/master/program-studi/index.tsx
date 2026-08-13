import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Building2, Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';


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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Fakultas = {
    id: number;
    kode: string;
    nama: string;
};

type ProgramStudi = {
    id: number;
    fakultas_id: number;
    kode: string;
    nama: string;
    jenjang: string;
    fakultas?: Fakultas;
    konsentrasis_count?: number;
};

export default function ProgramStudiIndex({
    programStudis = [],
    fakultas = [],
}: {
    programStudis: ProgramStudi[];
    fakultas: Fakultas[];
}) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingProdi, setEditingProdi] = useState<ProgramStudi | null>(null);

    const createForm = useForm({
        fakultas_id: '',
        kode: '',
        nama: '',
        jenjang: 'S1',
    });

    const editForm = useForm({
        fakultas_id: '',
        kode: '',
        nama: '',
        jenjang: 'S1',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/master/program-studi', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProdi) return;

        editForm.put(`/master/program-studi/${editingProdi.id}`, {
            onSuccess: () => {
                setEditingProdi(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (item: ProgramStudi) => {
        if (confirm(`Apakah Anda yakin ingin menghapus program studi ${item.nama}?`)) {
            router.delete(`/master/program-studi/${item.id}`);
        }
    };

    const openEditModal = (item: ProgramStudi) => {
        setEditingProdi(item);
        editForm.setData({
            fakultas_id: String(item.fakultas_id),
            kode: item.kode,
            nama: item.nama,
            jenjang: item.jenjang,
        });
    };

    return (
        <>
            <Head title="Kelola Program Studi" />

            <div className="p-6 space-y-6">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Program Studi</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Kelola data program studi dan jenjang pendidikan di STAI Al-Yasini.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Tambah Program Studi
                    </Button>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-border-default pb-2">
                    <Link
                        href="/master/fakultas"
                        className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-base rounded-md transition-colors"
                    >
                        Fakultas
                    </Link>
                    <span className="px-3 py-1.5 text-xs font-semibold text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5 rounded-t-md">
                        Program Studi
                    </span>
                </div>


                {/* Data Table */}
                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {programStudis.length === 0 ? (
                        <div className="p-12 text-center">
                            <Building2 className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Belum ada data program studi</h3>
                            <p className="text-xs text-text-secondary mt-1 mb-4">
                                Silakan tambahkan data program studi baru.
                            </p>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md inline-flex items-center gap-1.5"
                            >
                                <Plus className="size-4" />
                                Tambah Program Studi
                            </Button>
                        </div>
                    ) : (
                        <ResponsiveTable>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">No</TableHead>
                                    <TableHead>Program Studi & Jenjang</TableHead>
                                    <TableHead>Fakultas</TableHead>
                                    <TableHead align="right" className="w-24">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {programStudis.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="text-muted-foreground font-medium">{index + 1}</TableCell>
                                        <TableCell>
                                            <StackedCell
                                                primary={item.nama}
                                                secondary={`Kode: ${item.kode} • Jenjang ${item.jenjang}`}
                                            />
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{item.fakultas?.nama || '-'}</TableCell>
                                        <TableCell align="right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditModal(item)}
                                                    className="h-8 w-8 p-0"
                                                    title="Edit Program Studi"
                                                >
                                                    <Edit className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(item)}
                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                    title="Hapus Program Studi"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </ResponsiveTable>

                    )}
                </div>
            </div>

            {/* Modal Tambah Program Studi */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Tambah Program Studi Baru</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Isi formulir untuk menambahkan program studi.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Fakultas <span className="text-status-danger">*</span>
                            </Label>
                            <Select
                                value={createForm.data.fakultas_id}
                                onValueChange={(value) => createForm.setData('fakultas_id', value)}
                            >
                                <SelectTrigger className="text-xs border-border-default">
                                    <SelectValue placeholder="Pilih Fakultas" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fakultas.map((f) => (
                                        <SelectItem key={f.id} value={String(f.id)} className="text-xs">
                                            {f.kode} - {f.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {createForm.errors.fakultas_id && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.fakultas_id}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="kode" className="text-xs font-semibold text-text-primary">
                                Kode Program Studi <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="kode"
                                placeholder="Misal: PAI"
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
                                Nama Program Studi <span className="text-status-danger">*</span>
                            </Label>
                            <Input
                                id="nama"
                                placeholder="Misal: Pendidikan Agama Islam"
                                value={createForm.data.nama}
                                onChange={(e) => createForm.setData('nama', e.target.value)}
                                className="text-xs border-border-default focus-visible:ring-brand-primary"
                            />
                            {createForm.errors.nama && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.nama}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Jenjang <span className="text-status-danger">*</span>
                            </Label>
                            <Select
                                value={createForm.data.jenjang}
                                onValueChange={(value) => createForm.setData('jenjang', value)}
                            >
                                <SelectTrigger className="text-xs border-border-default">
                                    <SelectValue placeholder="Pilih Jenjang" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="S1" className="text-xs">S1 - Sarjana</SelectItem>
                                    <SelectItem value="S2" className="text-xs">S2 - Magister</SelectItem>
                                    <SelectItem value="D3" className="text-xs">D3 - Diploma III</SelectItem>
                                </SelectContent>
                            </Select>
                            {createForm.errors.jenjang && (
                                <p className="text-[11px] text-status-danger">{createForm.errors.jenjang}</p>
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
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Program Studi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Program Studi */}
            <Dialog open={!!editingProdi} onOpenChange={(open) => !open && setEditingProdi(null)}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Edit Program Studi</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Perbarui informasi program studi.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Fakultas <span className="text-status-danger">*</span>
                            </Label>
                            <Select
                                value={editForm.data.fakultas_id}
                                onValueChange={(value) => editForm.setData('fakultas_id', value)}
                            >
                                <SelectTrigger className="text-xs border-border-default">
                                    <SelectValue placeholder="Pilih Fakultas" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fakultas.map((f) => (
                                        <SelectItem key={f.id} value={String(f.id)} className="text-xs">
                                            {f.kode} - {f.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editForm.errors.fakultas_id && (
                                <p className="text-[11px] text-status-danger">{editForm.errors.fakultas_id}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit_kode" className="text-xs font-semibold text-text-primary">
                                Kode Program Studi <span className="text-status-danger">*</span>
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
                                Nama Program Studi <span className="text-status-danger">*</span>
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

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-text-primary">
                                Jenjang <span className="text-status-danger">*</span>
                            </Label>
                            <Select
                                value={editForm.data.jenjang}
                                onValueChange={(value) => editForm.setData('jenjang', value)}
                            >
                                <SelectTrigger className="text-xs border-border-default">
                                    <SelectValue placeholder="Pilih Jenjang" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="S1" className="text-xs">S1 - Sarjana</SelectItem>
                                    <SelectItem value="S2" className="text-xs">S2 - Magister</SelectItem>
                                    <SelectItem value="D3" className="text-xs">D3 - Diploma III</SelectItem>
                                </SelectContent>
                            </Select>
                            {editForm.errors.jenjang && (
                                <p className="text-[11px] text-status-danger">{editForm.errors.jenjang}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingProdi(null)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
                            >
                                {editForm.processing ? 'Menyimpan...' : 'Perbarui Program Studi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

ProgramStudiIndex.layout = {
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
            title: 'Program Studi',
            href: '/master/program-studi',
        },
    ],
};
