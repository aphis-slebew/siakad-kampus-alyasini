import { Head, router, useForm } from '@inertiajs/react';
import { BookOpen, CheckCircle, Clock, Calendar } from 'lucide-react';
import { useState  } from 'react';
import type {FormEventHandler} from 'react';
import { EmptyState } from '@/components/empty-state';
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
import { Textarea } from '@/components/ui/textarea';
import { formatDateIndonesian } from '@/lib/utils';


type Dosen = { id: number; nama_lengkap: string };
type BimbinganSkripsi = { id: number; tanggal: string; catatan: string; divalidasi: boolean };
type Skripsi = {
    id: number;
    judul: string;
    status: string;
    tanggal_ujian?: string;
    dosen_pembimbing?: Dosen;
    mahasiswa?: { nama_lengkap: string; nim: string };
    bimbingan_skripsis?: BimbinganSkripsi[];
};

export default function SkripsiIndexPage({
    skripsi,
    skripsis = [],
    role = 'admin',
    errors = {},
}: {
    skripsi?: Skripsi;
    skripsis?: Skripsi[];
    role?: string;
    errors?: Record<string, string>;
}) {
    const [schedulingSkripsi, setSchedulingSkripsi] = useState<Skripsi | null>(null);

    const bimbinganForm = useForm({
        tanggal: new Date().toISOString().split('T')[0],
        catatan: '',
    });

    const scheduleForm = useForm({
        tanggal_ujian: '',
    });

    const handleAddBimbingan: FormEventHandler = (e) => {
        e.preventDefault();

        if (skripsi) {
            bimbinganForm.post(`/skripsi/${skripsi.id}/bimbingan`, {
                onSuccess: () => bimbinganForm.reset('catatan'),
            });
        }
    };

    const handleValidateBimbingan = (id: number) => {
        router.post(`/skripsi/bimbingan/${id}/validate`);
    };

    const handleOpenScheduleModal = (item: Skripsi) => {
        setSchedulingSkripsi(item);
        scheduleForm.setData('tanggal_ujian', item.tanggal_ujian || new Date().toISOString().split('T')[0]);
    };

    const handleScheduleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!schedulingSkripsi) {
return;
}

        scheduleForm.post(`/skripsi/${schedulingSkripsi.id}/schedule`, {
            onSuccess: () => {
                setSchedulingSkripsi(null);
                scheduleForm.reset();
            },
        });
    };

    const handlePass = (skripsiId: number) => {
        router.post(`/skripsi/${skripsiId}/pass`);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'bimbingan': return <Badge variant="outline" className="border-blue-500 text-blue-600"><BookOpen className="mr-1 h-3 w-3" /> Dalam Bimbingan</Badge>;
            case 'siap_ujian': return <Badge variant="outline" className="border-amber-500 text-amber-600"><Calendar className="mr-1 h-3 w-3" /> Siap Ujian</Badge>;
            case 'lulus_ujian': return <Badge className="bg-emerald-600"><CheckCircle className="mr-1 h-3 w-3" /> Lulus Ujian Skripsi</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <>
            <Head title="Skripsi & Bimbingan Tugas Akhir" />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Skripsi & Bimbingan Tugas Akhir</h1>
                    <p className="text-sm text-muted-foreground">Monitoring bimbingan skripsi penuh, validasi log konsultasi, dan penetapan jadwal sidang skripsi.</p>
                </div>

                {(errors?.bimbingan || errors?.ujian) && (
                    <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive border border-destructive/20">
                        {errors.bimbingan || errors.ujian}
                    </div>
                )}

                {role === 'mahasiswa' && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Informasi Skripsi Mahasiswa</span>
                                    {skripsi && getStatusBadge(skripsi.status)}
                                </CardTitle>
                                <CardDescription>Detail skripsi dan Dosen Pembimbing yang ditugaskan.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!skripsi ? (
                                    <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                                        Anda belum memiliki skripsi aktif. Selesaikan Ujian Proposal Skripsi terlebih dahulu.
                                    </div>
                                ) : (
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="text-xs font-semibold uppercase text-muted-foreground">Judul Skripsi</span>
                                            <p className="font-medium text-foreground mt-1">{skripsi.judul}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold uppercase text-muted-foreground">Dosen Pembimbing</span>
                                            <p className="font-medium text-foreground">{skripsi.dosen_pembimbing?.nama_lengkap || '-'}</p>
                                        </div>
                                        {skripsi.tanggal_ujian && (
                                            <div>
                                                <span className="text-xs font-semibold uppercase text-muted-foreground">Jadwal Ujian Skripsi</span>
                                                <p className="font-medium text-emerald-600">{formatDateIndonesian(skripsi.tanggal_ujian)}</p>
                                            </div>
                                        )}

                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Log Bimbingan Skripsi</CardTitle>
                                <CardDescription>Catat konsultasi berkas skripsi dengan Dosen Pembimbing.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {skripsi && skripsi.status === 'bimbingan' && (
                                    <form onSubmit={handleAddBimbingan} className="space-y-3 rounded-lg border p-4 bg-muted/30">
                                        <h4 className="text-sm font-semibold">Tambah Log Konsultasi Skripsi</h4>
                                        <div>
                                            <Label htmlFor="tanggal">Tanggal Konsultasi *</Label>
                                            <Input
                                                type="date"
                                                id="tanggal"
                                                value={bimbinganForm.data.tanggal}
                                                onChange={(e) => bimbinganForm.setData('tanggal', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="catatan">Catatan / Progress Skripsi *</Label>
                                            <Textarea
                                                id="catatan"
                                                value={bimbinganForm.data.catatan}
                                                onChange={(e) => bimbinganForm.setData('catatan', e.target.value)}
                                                placeholder="Contoh: Analisis Data BAB IV dan Pembahasan disetujui..."
                                                rows={2}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" size="sm" disabled={bimbinganForm.processing}>
                                            Simpan Log Bimbingan
                                        </Button>
                                    </form>
                                )}

                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold">Riwayat Bimbingan Skripsi ({skripsi?.bimbingan_skripsis?.length || 0}x)</h4>
                                    {(!skripsi?.bimbingan_skripsis || skripsi.bimbingan_skripsis.length === 0) ? (
                                        <p className="text-xs text-muted-foreground italic">Belum ada catatan log bimbingan skripsi.</p>
                                    ) : (
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                            {skripsi.bimbingan_skripsis.map((b) => (
                                                <div key={b.id} className="flex items-start justify-between rounded-md border p-3 text-xs">
                                                    <div>
                                                        <span className="font-semibold text-foreground">{formatDateIndonesian(b.tanggal)}</span>
                                                        <p className="text-muted-foreground mt-1">{b.catatan}</p>
                                                    </div>

                                                    {b.divalidasi ? (
                                                        <Badge className="bg-emerald-600">Tervalidasi</Badge>
                                                    ) : (
                                                        <Badge variant="outline">Menunggu</Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {(role === 'dosen' || role === 'admin') && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Bimbingan & Sidang Skripsi</CardTitle>
                            <CardDescription>Kelola validasi bimbingan skripsi dan penetapan kelulusan ujian sidang.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                                        <tr>
                                            <th className="p-3">Mahasiswa & Judul Skripsi</th>
                                            {role === 'admin' && <th className="p-3">Dosen Pembimbing</th>}
                                            <th className="p-3 text-center">Log Bimbingan</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3 text-right">Aksi & Transisi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {(!skripsis || skripsis.length === 0) ? (
                                            <tr>
                                                <td colSpan={role === 'admin' ? 5 : 4} className="p-4 text-center text-xs text-muted-foreground">Belum ada data skripsi mahasiswa.</td>
                                            </tr>
                                        ) : (
                                            skripsis.map((s) => (
                                                <tr key={s.id} className="hover:bg-muted/20">
                                                    <td className="p-3 py-4">
                                                        <div className="font-semibold text-foreground">{s.mahasiswa?.nama_lengkap}</div>
                                                        <div className="text-xs text-muted-foreground font-mono">{s.mahasiswa?.nim}</div>
                                                        <div className="text-xs text-muted-foreground mt-1 max-w-lg font-normal italic" title={s.judul}>
                                                            "{s.judul}"
                                                        </div>
                                                    </td>
                                                    {role === 'admin' && (
                                                        <td className="p-3">{s.dosen_pembimbing?.nama_lengkap || '-'}</td>
                                                    )}
                                                    <td className="p-3 text-center">
                                                        <span className="font-bold text-foreground">{s.bimbingan_skripsis?.filter(b => b.divalidasi).length || 0}</span> / {s.bimbingan_skripsis?.length || 0}
                                                        <div className="text-[11px] text-muted-foreground">Tervalidasi</div>
                                                    </td>
                                                    <td className="p-3">{getStatusBadge(s.status)}</td>
                                                    <td className="p-3 text-right">
                                                        {s.status === 'bimbingan' && (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button size="sm" variant="outline" onClick={() => handleOpenScheduleModal(s)}>
                                                                    <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                                                    Jadwalkan Sidang
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {s.status === 'siap_ujian' && (
                                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handlePass(s.id)}>
                                                                Luluskan Sidang
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Modal Penjadwalan Sidang */}
            <Dialog open={!!schedulingSkripsi} onOpenChange={(open) => !open && setSchedulingSkripsi(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold">Jadwalkan Sidang Skripsi</DialogTitle>
                        <DialogDescription className="text-xs">
                            Tetapkan tanggal pelaksanaan ujian sidang skripsi untuk mahasiswa berikut:
                        </DialogDescription>
                    </DialogHeader>

                    {schedulingSkripsi && (
                        <form onSubmit={handleScheduleSubmit} className="space-y-4 pt-2">
                            <div className="rounded-md border p-3 bg-muted/40 space-y-1 text-xs">
                                <div><span className="font-semibold text-foreground">Mahasiswa:</span> {schedulingSkripsi.mahasiswa?.nama_lengkap} ({schedulingSkripsi.mahasiswa?.nim})</div>
                                <div><span className="font-semibold text-foreground">Pembimbing:</span> {schedulingSkripsi.dosen_pembimbing?.nama_lengkap || '-'}</div>
                                <div className="text-muted-foreground italic line-clamp-2">"{schedulingSkripsi.judul}"</div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="tanggal_ujian" className="text-xs font-semibold">
                                    Tanggal Pelaksanaan Sidang
                                </Label>
                                <Input
                                    id="tanggal_ujian"
                                    type="date"
                                    value={scheduleForm.data.tanggal_ujian}
                                    onChange={(e) => scheduleForm.setData('tanggal_ujian', e.target.value)}
                                    className="text-xs"
                                    required
                                />
                                {scheduleForm.errors.tanggal_ujian && (
                                    <p className="text-destructive text-xs">{scheduleForm.errors.tanggal_ujian}</p>
                                )}
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setSchedulingSkripsi(null)}>
                                    Batal
                                </Button>
                                <Button type="submit" size="sm" disabled={scheduleForm.processing || !scheduleForm.data.tanggal_ujian} className="bg-brand-primary text-white">
                                    Simpan Jadwal Sidang
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

SkripsiIndexPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tugas Akhir & Kelulusan', href: '#' },
        { title: 'Bimbingan Skripsi', href: '/skripsi/bimbingan' },
    ],
};
