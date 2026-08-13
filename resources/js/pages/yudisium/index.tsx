import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Award, FileText, CheckCircle, Plus, Calendar } from 'lucide-react';
import { formatDateIndonesian } from '@/lib/utils';


type Mahasiswa = { id: number; nim: string; nama_lengkap: string; program_studi?: { nama: string } };
type PeriodeWisuda = { id: number; nama: string; tanggal_wisuda: string };
type Yudisium = {
    id: number;
    ipk_akhir: string;
    nomor_dokumen: string;
    created_at: string;
    mahasiswa?: Mahasiswa;
    periode_wisuda?: PeriodeWisuda;
};

export default function YudisiumIndexPage({
    yudisium,
    yudisiums,
    periodeWisudas,
    candidates,
    role,
    errors,
}: {
    yudisium?: Yudisium;
    yudisiums?: Yudisium[];
    periodeWisudas?: PeriodeWisuda[];
    candidates?: Mahasiswa[];
    role: string;
    errors?: Record<string, string>;
}) {
    const yudisiumForm = useForm({
        mahasiswa_id: '',
        periode_wisuda_id: '',
    });

    const periodeForm = useForm({
        nama: '',
        tanggal_wisuda: '',
    });

    const handleAssignYudisium: FormEventHandler = (e) => {
        e.preventDefault();
        yudisiumForm.post('/yudisium');
    };

    const handleCreatePeriode: FormEventHandler = (e) => {
        e.preventDefault();
        periodeForm.post('/yudisium/periode-wisuda', {
            onSuccess: () => periodeForm.reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Yudisium & Wisuda', href: '/yudisium' }]}>
            <Head title="Penetapan Yudisium & Wisuda" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground-default">Penetapan Yudisium & Periode Wisuda</h1>
                    <p className="text-sm text-foreground-muted">Proses penetapan kelulusan resmi, penerbitan nomor dokumen kelulusan otomatis, dan penentuan periode wisuda.</p>
                </div>

                {errors?.yudisium && (
                    <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive border border-destructive/20">
                        {errors.yudisium}
                    </div>
                )}

                {role === 'mahasiswa' && (
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Status Kelulusan Yudisium</span>
                                {yudisium ? <Badge className="bg-emerald-600">Lulus Yudisium</Badge> : <Badge variant="secondary">Belum Yudisium</Badge>}
                            </CardTitle>
                            <CardDescription>Rincian penetapan yudisium dan dokumen kelulusan resmi Anda.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!yudisium ? (
                                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                                    Status Yudisium belum ditetapkan. Pastikan Anda telah LULUS Ujian Skripsi dan tidak memiliki tunggakan UKT aktif.
                                </div>
                            ) : (
                                <div className="space-y-4 rounded-lg border p-4 bg-emerald-50/30">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-xs font-semibold uppercase text-muted-foreground">Nomor Dokumen Yudisium</span>
                                            <p className="font-mono text-base font-bold text-emerald-700">{yudisium.nomor_dokumen}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold uppercase text-muted-foreground">IPK Akhir Kumulatif</span>
                                            <p className="text-xl font-bold text-foreground">{yudisium.ipk_akhir}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold uppercase text-muted-foreground">Periode Wisuda</span>
                                            <p className="font-medium text-foreground">{yudisium.periode_wisuda?.nama || '-'}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold uppercase text-muted-foreground">Tanggal Wisuda</span>
                                            <p className="font-medium text-foreground">{formatDateIndonesian(yudisium.periode_wisuda?.tanggal_wisuda)}</p>
                                        </div>

                                    </div>
                                    <div className="pt-2 border-t flex justify-end">
                                        <a href={`/yudisium/sertifikat/${yudisium.id}`} target="_blank" rel="noreferrer">
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                                <FileText className="mr-2 h-4 w-4" /> Cetak Dokumen Yudisium
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {role === 'admin' && (
                    <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-emerald-600" /> Form Penetapan Yudisium
                                    </CardTitle>
                                    <CardDescription>Proses penetapan yudisium untuk mahasiswa yang lulus ujian skripsi.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleAssignYudisium} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="mahasiswa_id">Pilih Mahasiswa Calon Yudisium *</Label>
                                            <select
                                                id="mahasiswa_id"
                                                value={yudisiumForm.data.mahasiswa_id}
                                                onChange={(e) => yudisiumForm.setData('mahasiswa_id', e.target.value)}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                required
                                            >
                                                <option value="">-- Pilih Mahasiswa Calon Yudisium --</option>
                                                {candidates?.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.nama_lengkap} ({c.nim}) - {c.program_studi?.nama}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="periode_wisuda_id">Pilih Periode Wisuda *</Label>
                                            <select
                                                id="periode_wisuda_id"
                                                value={yudisiumForm.data.periode_wisuda_id}
                                                onChange={(e) => yudisiumForm.setData('periode_wisuda_id', e.target.value)}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                required
                                            >
                                                <option value="">-- Pilih Periode Wisuda --</option>
                                                {periodeWisudas?.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.nama} ({p.tanggal_wisuda})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <Button type="submit" disabled={yudisiumForm.processing} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                            Proses & Generate Yudisium
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-emerald-600" /> Tambah Periode Wisuda
                                    </CardTitle>
                                    <CardDescription>Buat periode wisuda baru untuk penempatan kelulusan mahasiswa.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreatePeriode} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nama_periode">Nama Periode Wisuda *</Label>
                                            <Input
                                                id="nama_periode"
                                                value={periodeForm.data.nama}
                                                onChange={(e) => periodeForm.setData('nama', e.target.value)}
                                                placeholder="Wisuda Ke-XV Tahun 2026"
                                                className="w-full text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="tgl_wisuda">Tanggal Wisuda *</Label>
                                            <Input
                                                type="date"
                                                id="tgl_wisuda"
                                                value={periodeForm.data.tanggal_wisuda}
                                                onChange={(e) => periodeForm.setData('tanggal_wisuda', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" variant="outline" disabled={periodeForm.processing} className="w-full">
                                            <Plus className="mr-1 h-4 w-4" /> Tambah Periode Wisuda
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Daftar Mahasiswa Terdaftar Yudisium</CardTitle>
                                <CardDescription>Daftar kelulusan resmi dengan IPK akhir otomatis dan nomor dokumen unik.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="w-full">
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                                            <tr>
                                                <th className="p-3">No Dokumen</th>
                                                <th className="p-3">Mahasiswa</th>
                                                <th className="p-3">Program Studi</th>
                                                <th className="p-3 text-center">IPK Akhir</th>
                                                <th className="p-3">Periode Wisuda</th>
                                                <th className="p-3 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {(!yudisiums || yudisiums.length === 0) ? (
                                                <tr>
                                                    <td colSpan={6} className="p-4 text-center text-xs text-muted-foreground">Belum ada data penetapan yudisium.</td>
                                                </tr>
                                            ) : (
                                                yudisiums.map((y) => (
                                                    <tr key={y.id} className="hover:bg-muted/20">
                                                        <td className="p-3 font-mono text-xs font-bold text-emerald-700">{y.nomor_dokumen}</td>
                                                        <td className="p-3">
                                                            <div className="font-medium text-foreground">{y.mahasiswa?.nama_lengkap}</div>
                                                            <div className="text-xs text-muted-foreground">{y.mahasiswa?.nim}</div>
                                                        </td>
                                                        <td className="p-3">{y.mahasiswa?.program_studi?.nama || '-'}</td>
                                                        <td className="p-3 text-center font-bold">{y.ipk_akhir}</td>
                                                        <td className="p-3">{y.periode_wisuda?.nama || '-'}</td>
                                                        <td className="p-3 text-right">
                                                            <a href={`/yudisium/sertifikat/${y.id}`} target="_blank" rel="noreferrer">
                                                                <Button size="sm" variant="outline" className="gap-1">
                                                                    <FileText className="h-3.5 w-3.5" /> Lihat Sertifikat
                                                                </Button>
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
