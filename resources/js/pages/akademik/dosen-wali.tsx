import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Filter,
    GraduationCap,
    Plus,
    Search,
    Trash2,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { useConfirmDialog } from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';

type Dosen = {
    id: number;
    nama_lengkap: string;
    nidn?: string;
    program_studi_id?: number;
};

type MahasiswaUnassigned = {
    id: number;
    nim: string;
    nama_lengkap: string;
    program_studi_id?: number;
};

type DosenWaliAssignment = {
    id: number;
    tahun_ajaran_id: number;
    dosen?: { id: number; nama_lengkap: string; nidn?: string };
    mahasiswa?: {
        id: number;
        nim: string;
        nama_lengkap: string;
        program_studi?: { id: number; nama: string };
    };
    tahun_ajaran?: { id: number; nama: string };
};

type PaginationMeta = {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export default function DosenWaliManagement({
    assignments,
    dosens = [],
    programStudis = [],
    tahunAjarans = [],
    unassignedMahasiswas = [],
    filters = { tahun_ajaran_id: 0 },
}: {
    assignments?: ({ data: DosenWaliAssignment[] } & PaginationMeta) | null;
    dosens?: Dosen[];
    programStudis?: Array<{ id: number; kode: string; nama: string }>;
    tahunAjarans?: Array<{ id: number; nama: string; is_active: boolean }>;
    unassignedMahasiswas?: MahasiswaUnassigned[];
    filters?: { tahun_ajaran_id?: number; dosen_id?: string | number; program_studi_id?: string | number; search?: string };
}) {
    const safeAssignments = assignments || { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0, from: null, to: null, links: [] };
    const safeDosens = dosens || [];
    const safeProgramStudis = programStudis || [];
    const safeTahunAjarans = tahunAjarans || [];
    const safeUnassigned = unassignedMahasiswas || [];
    const safeFilters = filters || { tahun_ajaran_id: 0 };

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(safeFilters.search || '');
    const [dosenFilter, setDosenFilter] = useState(String(safeFilters.dosen_id || 'all'));
    const [prodiFilter, setProdiFilter] = useState(String(safeFilters.program_studi_id || 'all'));
    const [tahunFilter, setTahunFilter] = useState(String(safeFilters.tahun_ajaran_id || ''));

    // Form for new assignment
    const { data, setData, post, processing, reset, errors } = useForm<{
        dosen_id: string;
        tahun_ajaran_id: string;
        mahasiswa_ids: number[];
    }>({
        dosen_id: '',
        tahun_ajaran_id: String(safeFilters.tahun_ajaran_id || ''),
        mahasiswa_ids: [],
    });

    const handleApplyFilter = () => {
        router.get(
            '/akademik/dosen-wali',
            {
                tahun_ajaran_id: tahunFilter,
                dosen_id: dosenFilter !== 'all' ? dosenFilter : undefined,
                program_studi_id: prodiFilter !== 'all' ? prodiFilter : undefined,
                search: searchQuery || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleAssignSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/akademik/dosen-wali', {
            onSuccess: () => {
                setIsAssignModalOpen(false);
                reset();
            },
        });
    };

    const handleToggleMahasiswa = (id: number) => {
        if (data.mahasiswa_ids.includes(id)) {
            setData('mahasiswa_ids', data.mahasiswa_ids.filter((mId) => mId !== id));
        } else {
            setData('mahasiswa_ids', [...data.mahasiswa_ids, id]);
        }
    };

    const { confirm, confirmDialog } = useConfirmDialog();

    const handleSelectAllUnassigned = () => {
        if (data.mahasiswa_ids.length === unassignedMahasiswas.length) {
            setData('mahasiswa_ids', []);
        } else {
            setData('mahasiswa_ids', unassignedMahasiswas.map((m) => m.id));
        }
    };

    const handleDeleteAssignment = (id: number) => {
        confirm({
            title: 'Hapus Penugasan Dosen Wali',
            description: 'Apakah Anda yakin ingin menghapus penugasan Dosen Wali untuk mahasiswa ini? Mahasiswa akan kembali berstatus belum memiliki Dosen Wali.',
            variant: 'destructive',
            confirmText: 'Ya, Hapus',
            onConfirm: () => {
                router.delete(`/akademik/dosen-wali/${id}`);
            },
        });
    };

    const [isRolloverModalOpen, setIsRolloverModalOpen] = useState(false);

    const rolloverForm = useForm({
        from_tahun_ajaran_id: (tahunAjarans[1]?.id || tahunAjarans[0]?.id || '') as string | number,
        to_tahun_ajaran_id: (tahunAjarans.find(t => t.is_active)?.id || tahunAjarans[0]?.id || '') as string | number,
    });

    const handleRolloverSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        rolloverForm.post('/akademik/dosen-wali/rollover', {
            onSuccess: () => {
                setIsRolloverModalOpen(false);
            },
        });
    };

    return (
        <>
            {confirmDialog}
            <Head title="Pengelolaan Dosen Pembimbing Akademik (Wali)" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                            Penugasan Dosen Wali
                        </h1>
                        <p className="text-xs sm:text-sm text-text-secondary">
                            Atur penugasan Dosen Pembimbing Akademik (Wali) per mahasiswa untuk persetujuan KRS dan bimbingan studi.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsRolloverModalOpen(true)}
                            className="text-xs text-text-secondary hover:text-text-primary"
                        >
                            <Users className="size-3.5 mr-1.5" />
                            Salin dari Semester Lalu
                        </Button>
                        <Button size="sm" onClick={() => setIsAssignModalOpen(true)} className="text-xs bg-brand-primary text-white">
                            <Plus className="size-3.5 mr-1.5" />
                            Tugaskan Dosen Wali
                        </Button>
                    </div>
                </div>

                {/* Filter Bar */}
                <Card className="border-border-default bg-surface-card shadow-xs">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            <div className="relative lg:col-span-2">
                                <Search className="absolute left-3 top-2.5 size-4 text-text-secondary" />
                                <Input
                                    placeholder="Cari mahasiswa atau NIM..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                                    className="pl-9 text-xs"
                                />
                            </div>

                            <select
                                value={tahunFilter}
                                onChange={(e) => setTahunFilter(e.target.value)}
                                className="h-9 px-3 rounded-md border border-border-default bg-surface-base text-xs text-text-primary"
                            >
                                {tahunAjarans.map((t) => (
                                    <option key={t.id} value={t.id}>{t.nama} {t.is_active ? '(Aktif)' : ''}</option>
                                ))}
                            </select>

                            <select
                                value={dosenFilter}
                                onChange={(e) => setDosenFilter(e.target.value)}
                                className="h-9 px-3 rounded-md border border-border-default bg-surface-base text-xs text-text-primary"
                            >
                                <option value="all">Semua Dosen</option>
                                {dosens.map((d) => (
                                    <option key={d.id} value={d.id}>{d.nama_lengkap}</option>
                                ))}
                            </select>

                            <Button size="sm" onClick={handleApplyFilter} className="text-xs">
                                <Filter className="size-3.5 mr-1.5" />
                                Terapkan Filter
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Assignments Table */}
                <Card className="border-border-default bg-surface-card overflow-hidden">
                    <CardContent className="p-0">
                        {safeAssignments.data.length === 0 ? (
                            <div className="p-8 text-center text-xs text-text-secondary">
                                Belum ada data penugasan Dosen Wali pada kriteria filter ini.
                            </div>
                        ) : (
                            <ResponsiveTable>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mahasiswa</TableHead>
                                        <TableHead>Program Studi</TableHead>
                                        <TableHead>Dosen Pembimbing (Wali)</TableHead>
                                        <TableHead>Tahun Ajaran</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {safeAssignments.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-bold text-text-primary text-sm">{item.mahasiswa?.nama_lengkap}</div>
                                                <div className="text-[11px] font-mono text-text-secondary">NIM: {item.mahasiswa?.nim}</div>
                                            </TableCell>
                                            <TableCell className="text-xs text-text-primary">
                                                {item.mahasiswa?.program_studi?.nama || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-text-primary text-xs flex items-center gap-1.5">
                                                    <GraduationCap className="size-3.5 text-brand-primary" />
                                                    {item.dosen?.nama_lengkap}
                                                </div>
                                                <div className="text-[10px] text-text-secondary font-mono">NIDN: {item.dosen?.nidn || '-'}</div>
                                            </TableCell>
                                            <TableCell className="text-xs font-medium">
                                                {item.tahun_ajaran?.nama}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteAssignment(item.id)}
                                                    className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                                >
                                                    <Trash2 className="size-3.5 mr-1" />
                                                    Hapus
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </ResponsiveTable>
                        )}

                        {safeAssignments.links && (
                            <div className="p-4 border-t border-border-default">
                                <Pagination links={safeAssignments.links} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ASSIGNMENT MODAL */}
                <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold flex items-center gap-2">
                                <UserCheck className="size-4.5 text-brand-primary" />
                                Form Penugasan Dosen Wali
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Pilih dosen pembimbing dan centang mahasiswa yang akan ditugaskan.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="font-semibold text-text-primary">Pilih Dosen Wali:</label>
                                <select
                                    value={data.dosen_id}
                                    onChange={(e) => setData('dosen_id', e.target.value)}
                                    required
                                    className="w-full h-9 px-3 rounded-md border border-border-default bg-surface-base text-xs text-text-primary"
                                >
                                    <option value="">-- Pilih Dosen Pembimbing --</option>
                                    {dosens.map((d) => (
                                        <option key={d.id} value={d.id}>{d.nama_lengkap} (NIDN: {d.nidn || '-'})</option>
                                    ))}
                                </select>
                                {errors.dosen_id && <p className="text-rose-600 text-[11px]">{errors.dosen_id}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="font-semibold text-text-primary">
                                        Pilih Mahasiswa Belum Berwali ({unassignedMahasiswas.length} Tersedia):
                                    </label>
                                    {unassignedMahasiswas.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleSelectAllUnassigned}
                                            className="text-[11px] font-bold text-brand-primary hover:underline"
                                        >
                                            {data.mahasiswa_ids.length === unassignedMahasiswas.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-52 overflow-y-auto rounded-md border border-border-default p-2 space-y-1 bg-slate-50">
                                    {unassignedMahasiswas.length === 0 ? (
                                        <p className="p-3 text-center text-text-secondary italic">Semua mahasiswa aktif sudah memiliki Dosen Wali.</p>
                                    ) : (
                                        unassignedMahasiswas.map((mhs) => (
                                            <label
                                                key={mhs.id}
                                                className="flex items-center gap-2 p-1.5 rounded hover:bg-white cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={data.mahasiswa_ids.includes(mhs.id)}
                                                    onChange={() => handleToggleMahasiswa(mhs.id)}
                                                    className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary size-4"
                                                />
                                                <span className="font-bold text-text-primary">{mhs.nama_lengkap}</span>
                                                <span className="text-[11px] text-text-secondary font-mono">({mhs.nim})</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {errors.mahasiswa_ids && <p className="text-rose-600 text-[11px]">{errors.mahasiswa_ids}</p>}
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" size="sm" disabled={processing || data.mahasiswa_ids.length === 0}>
                                    Simpan Penugasan ({data.mahasiswa_ids.length} Mahasiswa)
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Rollover Dialog */}
                <Dialog open={isRolloverModalOpen} onOpenChange={setIsRolloverModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Salin Penugasan dari Semester Lalu</DialogTitle>
                            <DialogDescription>
                                Salin penugasan Dosen Wali dari semester sebelumnya ke semester aktif saat ini secara otomatis (1-klik).
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleRolloverSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1">
                                <Label className="text-xs">Dari Semester Sumber:</Label>
                                <select
                                    value={rolloverForm.data.from_tahun_ajaran_id}
                                    onChange={(e) => rolloverForm.setData('from_tahun_ajaran_id', Number(e.target.value))}
                                    className="w-full h-8 text-xs border border-border-default rounded-md px-2 bg-surface-base"
                                    required
                                >
                                    {tahunAjarans.map((t) => (
                                        <option key={t.id} value={t.id}>{t.nama}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Ke Semester Tujuan (Semester Aktif):</Label>
                                <select
                                    value={rolloverForm.data.to_tahun_ajaran_id}
                                    onChange={(e) => rolloverForm.setData('to_tahun_ajaran_id', Number(e.target.value))}
                                    className="w-full h-8 text-xs border border-border-default rounded-md px-2 bg-surface-base"
                                    required
                                >
                                    {tahunAjarans.map((t) => (
                                        <option key={t.id} value={t.id}>{t.nama} {t.is_active ? '(Aktif)' : ''}</option>
                                    ))}
                                </select>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsRolloverModalOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" size="sm" disabled={rolloverForm.processing} className="bg-brand-primary text-white">
                                    {rolloverForm.processing ? 'Menyalin...' : 'Mulai Salin Penugasan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

DosenWaliManagement.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Dosen Wali', href: '/akademik/dosen-wali' },
    ],
};
