import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Clock, Edit, MapPin, Plus, Trash2, Users } from 'lucide-react';
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
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';
import type { SharedData } from '@/types';


type Matakuliah = {
    id: number;
    kode: string;
    nama: string;
    sks: number;
};

type KurikulumMatakuliah = {
    id: number;
    semester: number;
    matakuliah?: Matakuliah;
    kurikulum_prodi?: {
        program_studi?: { nama: string };
    };
};

type TahunAjaran = {
    id: number;
    nama: string;
};

type Dosen = {
    id: number;
    nama_lengkap: string;
    nidn: string;
};

type DosenPengajar = {
    id: number;
    peran: string;
    dosen_id?: number;
    dosen?: Dosen;
};

type RuangKuliah = {
    id: number;
    kode: string;
    nama: string;
};

type JadwalPerkuliahan = {
    id: number;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruang_kuliah_id?: number | null;
    ruang_kuliah?: RuangKuliah | null;
};

type KelasKuliah = {
    id: number;
    kurikulum_matakuliah_id: number;
    tahun_ajaran_id: number;
    nama_kelas: string;
    kuota: number;
    kurikulum_matakuliah?: KurikulumMatakuliah;
    tahun_ajaran?: TahunAjaran;
    dosen_pengajars?: DosenPengajar[];
    jadwal_perkuliahans?: JadwalPerkuliahan[];
};

export default function KelasKuliahIndex({
    kelases = [],
    tahunAjarans = [],
    kurikulumMatakuliahs = [],
    dosens = [],
    ruangs = [],
}: {
    kelases: KelasKuliah[];
    tahunAjarans: TahunAjaran[];
    kurikulumMatakuliahs: KurikulumMatakuliah[];
    dosens: Dosen[];
    ruangs: RuangKuliah[];
}) {
    const { errors } = usePage<SharedData & { errors?: Record<string, string> }>().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingKelas, setEditingKelas] = useState<KelasKuliah | null>(null);

    const createForm = useForm({
        kurikulum_matakuliah_id: kurikulumMatakuliahs[0]?.id || '',
        tahun_ajaran_id: tahunAjarans[0]?.id || '',
        nama_kelas: 'A',
        kuota: 30, // TODO: Langkah 6 - validasi kuota saat KRS dibangun
        dosen_ids: [] as number[],
        ruang_kuliah_id: ruangs[0]?.id || '',
        hari: 'Senin',
        jam_mulai: '08:00',
        jam_selesai: '10:30',
    });

    const editForm = useForm({
        kurikulum_matakuliah_id: kurikulumMatakuliahs[0]?.id || '',
        tahun_ajaran_id: tahunAjarans[0]?.id || '',
        nama_kelas: 'A',
        kuota: 30,
        dosen_ids: [] as number[],
        ruang_kuliah_id: ruangs[0]?.id || '',
        hari: 'Senin',
        jam_mulai: '08:00',
        jam_selesai: '10:30',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/akademik/kelas-kuliah', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingKelas) return;

        editForm.put(`/akademik/kelas-kuliah/${editingKelas.id}`, {
            onSuccess: () => {
                setEditingKelas(null);
                editForm.reset();
            },
        });
    };

    const openEditModal = (item: KelasKuliah) => {
        const jadwal = item.jadwal_perkuliahans && item.jadwal_perkuliahans[0];
        const ruangId = (jadwal?.ruang_kuliah_id || (jadwal?.ruang_kuliah ? jadwal.ruang_kuliah.id : '')) || '';
        const assignedDosenIds = item.dosen_pengajars ? item.dosen_pengajars.map(dp => dp.dosen_id || dp.dosen?.id).filter(Boolean) as number[] : [];

        setEditingKelas(item);
        editForm.setData({
            kurikulum_matakuliah_id: item.kurikulum_matakuliah_id,
            tahun_ajaran_id: item.tahun_ajaran_id,
            nama_kelas: item.nama_kelas,
            kuota: item.kuota,
            dosen_ids: assignedDosenIds.length > 0 ? assignedDosenIds : (dosens[0] ? [dosens[0].id] : []),
            ruang_kuliah_id: ruangId || (ruangs[0] ? ruangs[0].id : ''),
            hari: jadwal?.hari || 'Senin',
            jam_mulai: jadwal?.jam_mulai ? jadwal.jam_mulai.substring(0, 5) : '08:00',
            jam_selesai: jadwal?.jam_selesai ? jadwal.jam_selesai.substring(0, 5) : '10:30',
        });
    };

    const handleDelete = (item: KelasKuliah) => {
        if (confirm(`Apakah Anda yakin ingin menghapus kelas ${item.nama_kelas}?`)) {
            router.delete(`/akademik/kelas-kuliah/${item.id}`);
        }
    };

    const conflictErrorMessage = errors?.jadwal || errors?.ruang_kuliah_id || errors?.dosen_ids || createForm.errors.ruang_kuliah_id || createForm.errors.dosen_ids || editForm.errors.ruang_kuliah_id || editForm.errors.dosen_ids;


    return (
        <>
            <Head title="Kelola Kelas Kuliah & Jadwal Perkuliahan" />

            <div className="p-6 space-y-6 font-sans">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Kelas Kuliah & Penjadwalan</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Kelola pembagian kelas per matakuliah, kuota mahasiswa, penugasan dosen pengajar, dan pencegahan bentrok jadwal.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Tambah Kelas & Jadwal
                    </Button>
                </div>

                {/* Error Banner Alert untuk Bentrok Jadwal Ruang / Dosen di Halaman Utama */}
                {conflictErrorMessage && (
                    <div className="bg-status-danger/10 border border-status-danger/30 rounded-lg p-3.5 text-status-danger text-xs font-semibold flex items-center gap-2.5">
                        <AlertCircle className="size-5 shrink-0" />
                        <span>{conflictErrorMessage}</span>
                    </div>
                )}

                {/* Data Table */}
                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    {kelases.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Belum ada kelas kuliah</h3>
                            <p className="text-xs text-text-secondary mt-1 mb-4">
                                Buka kelas perkuliahan baru dan atur jadwal perkuliahan.
                            </p>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md inline-flex items-center gap-1.5"
                            >
                                <Plus className="size-4" />
                                Tambah Kelas & Jadwal
                            </Button>
                        </div>
                    ) : (
                        <ResponsiveTable>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">No</TableHead>
                                    <TableHead>Matakuliah & Kelas</TableHead>
                                    <TableHead>Dosen & Penjadwalan</TableHead>
                                    <TableHead align="center" className="w-28">Kuota</TableHead>
                                    <TableHead align="center" className="w-28">Status KRS</TableHead>
                                    <TableHead align="right" className="w-24">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kelases.map((item, index) => {
                                    const jadwal = item.jadwal_perkuliahans && item.jadwal_perkuliahans[0];
                                    const ruang = jadwal?.ruang_kuliah;
                                    const hasDosen = item.dosen_pengajars && item.dosen_pengajars.length > 0;
                                    const hasRuang = !!ruang;
                                    const isReadyForKrs = hasDosen && hasRuang;

                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-muted-foreground font-medium">{index + 1}</TableCell>
                                            <TableCell>
                                                <StackedCell
                                                    primary={`${item.kurikulum_matakuliah?.matakuliah?.nama} (${item.kurikulum_matakuliah?.matakuliah?.kode})`}
                                                    secondary={`Kelas ${item.nama_kelas} • ${item.tahun_ajaran?.nama}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div>
                                                        {hasDosen ? (
                                                            item.dosen_pengajars?.map((dp) => (
                                                                <div key={dp.id} className="font-medium text-foreground text-xs">
                                                                    {dp.dosen?.nama_lengkap} <span className="text-muted-foreground">({dp.peran})</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-amber-600 font-medium italic text-xs">Dosen belum ditugaskan</span>
                                                        )}
                                                    </div>
                                                    {jadwal ? (
                                                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                            <span className="flex items-center gap-1 font-medium text-foreground">
                                                                <Clock className="size-3 text-emerald-600" />
                                                                {jadwal.hari}, {jadwal.jam_mulai.substring(0, 5)}-{jadwal.jam_selesai.substring(0, 5)}
                                                            </span>
                                                            •
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="size-3" />
                                                                {ruang ? `${ruang.nama}` : 'Belum Ada Ruang'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-muted-foreground italic">Belum dijadwalkan</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell align="center" className="font-mono font-semibold">
                                                {item.kuota} Mhs
                                            </TableCell>
                                            <TableCell align="center">
                                                {isReadyForKrs ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                        <CheckCircle2 className="size-3" />
                                                        Siap KRS
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                        <Clock className="size-3" />
                                                        Belum Siap
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditModal(item)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Edit className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(item)}
                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>

                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </ResponsiveTable>
                    )}
                </div>
            </div>

            {/* Modal Tambah Kelas Kuliah & Jadwal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Buka Kelas Kuliah & Jadwal Baru</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Atur matakuliah, kelas, kuota, dosen pengajar, dan pencegahan bentrok jadwal.
                        </DialogDescription>
                    </DialogHeader>

                    {conflictErrorMessage && (
                        <div className="bg-status-danger/10 border border-status-danger/40 rounded-lg p-3 text-status-danger text-xs font-semibold flex items-start gap-2.5 my-1">
                            <AlertCircle className="size-4 shrink-0 mt-0.5 text-status-danger" />
                            <div className="space-y-0.5">
                                <span className="font-bold block">VALIDASI BENTROK JADWAL:</span>
                                <span className="font-normal text-[11.5px] leading-relaxed block">{conflictErrorMessage}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleCreateSubmit} className="space-y-3.5 py-1 text-xs">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-text-primary">
                                Matakuliah <span className="text-status-danger">*</span>
                            </Label>
                            <select
                                value={createForm.data.kurikulum_matakuliah_id}
                                onChange={(e) => createForm.setData('kurikulum_matakuliah_id', Number(e.target.value))}
                                className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary"
                            >
                                <option value="">Pilih Matakuliah</option>
                                {kurikulumMatakuliahs.map((km) => (
                                    <option key={km.id} value={km.id}>
                                        {km.matakuliah?.kode} - {km.matakuliah?.nama} (Sem {km.semester})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-text-primary">Nama Kelas (A/B/C) *</Label>
                                <Input
                                    value={createForm.data.nama_kelas}
                                    onChange={(e) => createForm.setData('nama_kelas', e.target.value)}
                                    className="text-xs border-border-default font-semibold uppercase"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-text-primary">Kuota Mahasiswa *</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={200}
                                    value={createForm.data.kuota}
                                    onChange={(e) => createForm.setData('kuota', Number(e.target.value))}
                                    className="text-xs border-border-default font-mono"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-text-primary">Tugaskan Dosen Pengajar Utama *</Label>
                            <select
                                value={createForm.data.dosen_ids[0] || ''}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val) createForm.setData('dosen_ids', [val]);
                                }}
                                className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary"
                            >
                                <option value="">Pilih Dosen Utama</option>
                                {dosens.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.nama_lengkap} (NIDN: {d.nidn})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-surface-base p-3 rounded-md border border-border-default space-y-2.5">
                            <span className="font-semibold text-text-primary block text-xs">Penjadwalan Perkuliahan:</span>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-[11px] text-text-secondary block">Ruang Kuliah *</Label>
                                    <select
                                        value={createForm.data.ruang_kuliah_id}
                                        onChange={(e) => createForm.setData('ruang_kuliah_id', Number(e.target.value))}
                                        className="w-full text-xs rounded-md border border-border-default bg-surface-card p-1.5 text-text-primary"
                                    >
                                        {ruangs.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.nama} ({r.kode})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-[11px] text-text-secondary block">Hari *</Label>
                                    <select
                                        value={createForm.data.hari}
                                        onChange={(e) => createForm.setData('hari', e.target.value)}
                                        className="w-full text-xs rounded-md border border-border-default bg-surface-card p-1.5 text-text-primary"
                                    >
                                        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((h) => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-[11px] text-text-secondary block">Jam Mulai *</Label>
                                    <Input
                                        type="time"
                                        value={createForm.data.jam_mulai}
                                        onChange={(e) => createForm.setData('jam_mulai', e.target.value)}
                                        className="text-xs font-mono p-1.5"
                                    />
                                </div>
                                <div>
                                    <Label className="text-[11px] text-text-secondary block">Jam Selesai *</Label>
                                    <Input
                                        type="time"
                                        value={createForm.data.jam_selesai}
                                        onChange={(e) => createForm.setData('jam_selesai', e.target.value)}
                                        className="text-xs font-mono p-1.5"
                                    />
                                </div>
                            </div>
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
                                Simpan Kelas & Jadwal
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Kelas Kuliah & Jadwal */}
            <Dialog open={!!editingKelas} onOpenChange={(open) => !open && setEditingKelas(null)}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Edit Kelas Kuliah & Jadwal</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Perbarui dosen pengajar, kuota, atau ubah jadwal perkuliahan.
                        </DialogDescription>
                    </DialogHeader>

                    {conflictErrorMessage && (
                        <div className="bg-status-danger/10 border border-status-danger/40 rounded-lg p-3 text-status-danger text-xs font-semibold flex items-start gap-2.5 my-1">
                            <AlertCircle className="size-4 shrink-0 mt-0.5 text-status-danger" />
                            <div className="space-y-0.5">
                                <span className="font-bold block">VALIDASI BENTROK JADWAL:</span>
                                <span className="font-normal text-[11.5px] leading-relaxed block">{conflictErrorMessage}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleEditSubmit} className="space-y-3.5 py-1 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-text-primary">Nama Kelas (A/B/C) *</Label>
                                <Input
                                    value={editForm.data.nama_kelas}
                                    onChange={(e) => editForm.setData('nama_kelas', e.target.value)}
                                    className="text-xs border-border-default font-semibold uppercase"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-text-primary">Kuota Mahasiswa *</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={200}
                                    value={editForm.data.kuota}
                                    onChange={(e) => editForm.setData('kuota', Number(e.target.value))}
                                    className="text-xs border-border-default font-mono"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-text-primary">Tugaskan Dosen Pengajar Utama *</Label>
                            <select
                                value={editForm.data.dosen_ids[0] || ''}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val) editForm.setData('dosen_ids', [val]);
                                }}
                                className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary"
                            >
                                <option value="">Pilih Dosen Utama</option>
                                {dosens.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.nama_lengkap} (NIDN: {d.nidn})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-surface-base p-3 rounded-md border border-border-default space-y-2.5">
                            <span className="font-semibold text-text-primary block text-xs">Penjadwalan Perkuliahan:</span>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-[11px] text-text-secondary block">Ruang Kuliah *</Label>
                                    <select
                                        value={editForm.data.ruang_kuliah_id}
                                        onChange={(e) => editForm.setData('ruang_kuliah_id', Number(e.target.value))}
                                        className="w-full text-xs rounded-md border border-border-default bg-surface-card p-1.5 text-text-primary"
                                    >
                                        {ruangs.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.nama} ({r.kode})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-[11px] text-text-secondary block">Hari *</Label>
                                    <select
                                        value={editForm.data.hari}
                                        onChange={(e) => editForm.setData('hari', e.target.value)}
                                        className="w-full text-xs rounded-md border border-border-default bg-surface-card p-1.5 text-text-primary"
                                    >
                                        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((h) => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-[11px] text-text-secondary block">Jam Mulai *</Label>
                                    <Input
                                        type="time"
                                        value={editForm.data.jam_mulai}
                                        onChange={(e) => editForm.setData('jam_mulai', e.target.value)}
                                        className="text-xs font-mono p-1.5"
                                    />
                                </div>
                                <div>
                                    <Label className="text-[11px] text-text-secondary block">Jam Selesai *</Label>
                                    <Input
                                        type="time"
                                        value={editForm.data.jam_selesai}
                                        onChange={(e) => editForm.setData('jam_selesai', e.target.value)}
                                        className="text-xs font-mono p-1.5"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingKelas(null)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
                            >
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

KelasKuliahIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Akademik', href: '#' },
        { title: 'Kelas Kuliah & Jadwal', href: '/akademik/kelas-kuliah' },
    ],
};
