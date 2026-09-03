import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Award, Edit, Lock, RefreshCw, Save, ShieldCheck } from 'lucide-react';
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
};

type KelasKuliah = {
    id: number;
    nama_kelas: string;
    kurikulum_matakuliah?: KurikulumMatakuliah;
};

type KomposisiNilai = {
    id: number;
    komponen: string;
    bobot_persen: number;
};

type Mahasiswa = {
    id: number;
    nama_lengkap: string;
    nim: string;
};

type ScoreItem = {
    id?: number;
    nilai_angka: number;
    nilai_huruf: string;
    is_final: boolean;
};

type StudentGradeRow = {
    krs_detail_id: number;
    mahasiswa: Mahasiswa;
    scores: Record<string, ScoreItem>;
    is_final: boolean;
};

type TahunAjaran = {
    id: number;
    nama: string;
};

export default function PenilaianIndex({
    kelases = [],
    selectedKelas,
    komposisis = [],
    studentsGradeSheet = [],
    tahunAjaran,
}: {
    kelases: KelasKuliah[];
    selectedKelas?: KelasKuliah | null;
    komposisis: KomposisiNilai[];
    studentsGradeSheet: StudentGradeRow[];
    tahunAjaran: TahunAjaran;
}) {
    const { auth, errors, flash } = usePage<SharedData & { flash?: { success?: string }; errors?: Record<string, string> }>().props;

    const [isCompositionOpen, setIsCompositionOpen] = useState(false);
    const [whitewashTarget, setWhitewashTarget] = useState<{ nilaiId: number; mhsNama: string; currentScore: number } | null>(null);
    const [newScore, setNewScore] = useState(85);
    const [alasanPemutihan, setAlasanPemutihan] = useState('');

    const [compTugas, setCompTugas] = useState(komposisis.find(k => k.komponen === 'tugas')?.bobot_persen || 20);
    const [compUts, setCompUts] = useState(komposisis.find(k => k.komponen === 'uts')?.bobot_persen || 30);
    const [compUas, setCompUas] = useState(komposisis.find(k => k.komponen === 'uas')?.bobot_persen || 40);
    const [compPresensi, setCompPresensi] = useState(komposisis.find(k => k.komponen === 'presensi')?.bobot_persen || 10);

    const totalBobot = compTugas + compUts + compUas + compPresensi;

    const handleSaveComposition = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedKelas) {
return;
}

        router.post('/akademik/penilaian/komposisi', {
            kelas_kuliah_id: selectedKelas.id,
            komposisis: [
                { komponen: 'tugas', bobot_persen: compTugas },
                { komponen: 'uts', bobot_persen: compUts },
                { komponen: 'uas', bobot_persen: compUas },
                { komponen: 'presensi', bobot_persen: compPresensi },
            ],
        }, {
            onSuccess: () => setIsCompositionOpen(false),
        });
    };

    const handleInputScore = (krsDetailId: number, scores: Record<string, number>) => {
        if (!selectedKelas) {
return;
}

        router.post('/akademik/penilaian/input', {
            kelas_kuliah_id: selectedKelas.id,
            krs_detail_id: krsDetailId,
            scores: scores,
        });
    };

    const { confirm, confirmDialog } = useConfirmDialog();

    const handleFinalize = () => {
        if (!selectedKelas) {
return;
}

        confirm({
            title: 'Finalisasi Nilai Perkuliahan',
            description: `Apakah Anda yakin ingin memfinalisasi nilai untuk kelas ${selectedKelas.nama_kelas} (${selectedKelas.kurikulum_matakuliah?.matakuliah?.nama || 'Mata Kuliah'})? Nilai yang sudah final akan terkunci dan tidak dapat diubah tanpa prosedur pemutihan resmi.`,
            variant: 'warning',
            confirmText: 'Ya, Finalisasi Nilai',
            onConfirm: () => {
                router.post('/akademik/penilaian/finalize', {
                    kelas_kuliah_id: selectedKelas.id,
                });
            },
        });
    };

    const handleWhitewashSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!whitewashTarget) {
return;
}

        router.post('/akademik/penilaian/whitewash', {
            nilai_id: whitewashTarget.nilaiId,
            nilai_angka_baru: newScore,
            alasan_pemutihan: alasanPemutihan,
        }, {
            onSuccess: () => {
                setWhitewashTarget(null);
                setAlasanPemutihan('');
            },
        });
    };

    const errorMessage = errors?.penilaian || flash?.error;

    return (
        <>
            {confirmDialog}
            <Head title="Pengelolaan & Input Nilai Perkuliahan" />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Pengelolaan Nilai Perkuliahan & Pemutihan</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Atur komposisi bobot nilai, input nilai komponen, finalisasi nilai, dan alur pemutihan nilai.
                        </p>
                    </div>

                    {selectedKelas && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <Button
                                onClick={() => setIsCompositionOpen(true)}
                                variant="outline"
                                className="border-border-default text-text-primary text-xs font-semibold px-3 py-2 rounded-md flex items-center justify-center gap-1.5"
                            >
                                <Award className="size-3.5" />
                                Atur Komposisi Bobot ({totalBobot}%)
                            </Button>

                            <Button
                                onClick={handleFinalize}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md flex items-center justify-center gap-1.5"
                            >
                                <Lock className="size-3.5" />
                                Finalisasi Nilai Kelas
                            </Button>
                        </div>
                    )}
                </div>

                {/* Error Banner Alert */}
                {errorMessage && (
                    <div className="bg-status-danger/10 border border-status-danger/40 rounded-lg p-3.5 text-status-danger text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Flash Success Notification */}
                {flash?.success && (
                    <div className="bg-status-success/10 border border-status-success/30 rounded-lg p-3 text-status-success text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="size-4 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Select Class Dropdown */}
                <div className="bg-surface-card p-4 rounded-lg border border-border-default space-y-3">
                    <Label className="text-xs font-semibold text-text-primary">Pilih Kelas Perkuliahan Anda *</Label>
                    <select
                        value={selectedKelas?.id || ''}
                        onChange={(e) => {
                            const val = e.target.value;

                            if (val) {
                                router.get('/akademik/penilaian', { kelas_kuliah_id: val }, { preserveState: true });
                            }
                        }}
                        className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary font-medium"
                    >
                        <option value="">-- Pilih Kelas --</option>
                        {kelases.map((k) => (
                            <option key={k.id} value={k.id}>
                                {k.kurikulum_matakuliah?.matakuliah?.kode} - {k.kurikulum_matakuliah?.matakuliah?.nama} (Kelas {k.nama_kelas})
                            </option>
                        ))}
                    </select>
                </div>

                {kelases.length === 0 ? (
                    <div className="bg-surface-card p-10 rounded-xl border border-border-default text-center space-y-3">
                        <Award className="mx-auto size-12 text-slate-400" />
                        <h3 className="text-base font-bold text-text-primary">Belum Ada Kelas yang Diampu</h3>
                        <p className="text-xs text-text-secondary max-w-md mx-auto">
                            Anda belum terdaftar mengampu kelas perkuliahan aktif pada semester ini. Silakan berkoordinasi dengan Bagian Administrasi Akademik (BAA) atau Kaprodi.
                        </p>
                    </div>
                ) : !selectedKelas ? (
                    <div className="bg-surface-card p-10 rounded-xl border border-border-default text-center space-y-3">
                        <Award className="mx-auto size-12 text-emerald-600" />
                        <h3 className="text-base font-bold text-text-primary">Pilih Kelas Perkuliahan</h3>
                        <p className="text-xs text-text-secondary max-w-md mx-auto">
                            Silakan pilih salah satu kelas perkuliahan di atas untuk mulai mengatur komposisi bobot dan menginput nilai mahasiswa.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Grade Sheet Table */}
                        <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                            <div className="p-3 bg-surface-base border-b border-border-default flex items-center justify-between">
                                <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                                    Lembar Penilaian Mahasiswa (Bobot: Tugas {compTugas}%, UTS {compUts}%, UAS {compUas}%, Presensi {compPresensi}%)
                                </h2>
                                <span className="text-[11px] font-semibold text-brand-primary">
                                    Total: {studentsGradeSheet.length} Mahasiswa
                                </span>
                            </div>

                            {studentsGradeSheet.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Award className="mx-auto size-10 text-text-secondary/50 mb-3" />
                                    <h3 className="text-sm font-semibold text-text-primary">Belum ada mahasiswa terdaftar</h3>
                                    <p className="text-xs text-text-secondary mt-1">
                                        Belum ada mahasiswa yang KRS-nya disetujui Dosen Wali untuk kelas ini.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="sticky top-0 bg-surface-base border-b border-border-default text-text-secondary font-semibold uppercase tracking-wider">
                                            <tr>
                                                <th className="py-3 px-4 w-12">No</th>
                                                <th className="py-3 px-4 font-mono w-32">NIM</th>
                                                <th className="py-3 px-4">Nama Mahasiswa</th>
                                                <th className="py-3 px-4 text-center font-mono w-24">Tugas</th>
                                                <th className="py-3 px-4 text-center font-mono w-24">UTS</th>
                                                <th className="py-3 px-4 text-center font-mono w-24">UAS</th>
                                                <th className="py-3 px-4 text-center font-mono w-24">Presensi</th>
                                                <th className="py-3 px-4 text-center w-28">Status Final</th>
                                                <th className="py-3 px-4 text-right w-28">Pemutihan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-default text-text-primary">
                                            {studentsGradeSheet.map((row, index) => {
                                                const isFinal = row.is_final;

                                                return (
                                                    <tr key={row.krs_detail_id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                                        <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                                        <td className="py-3 px-4 font-mono font-bold text-brand-primary">
                                                            {row.mahasiswa?.nim}
                                                        </td>
                                                        <td className="py-3 px-4 font-semibold text-text-primary">
                                                            {row.mahasiswa?.nama_lengkap}
                                                        </td>
                                                        {['tugas', 'uts', 'uas', 'presensi'].map((comp) => {
                                                            const sc = row.scores[comp];

                                                            return (
                                                                <td key={comp} className="py-3 px-4 text-center font-mono">
                                                                    <Input
                                                                        type="number"
                                                                        min={0}
                                                                        max={100}
                                                                        disabled={isFinal}
                                                                        defaultValue={sc?.nilai_angka || ''}
                                                                        onBlur={(e) => {
                                                                            const val = Number(e.target.value);

                                                                            if (!isFinal && val >= 0) {
                                                                                const currentScores: Record<string, number> = {
                                                                                    tugas: row.scores['tugas']?.nilai_angka || 0,
                                                                                    uts: row.scores['uts']?.nilai_angka || 0,
                                                                                    uas: row.scores['uas']?.nilai_angka || 0,
                                                                                    presensi: row.scores['presensi']?.nilai_angka || 0,
                                                                                };
                                                                                currentScores[comp] = val;
                                                                                handleInputScore(row.krs_detail_id, currentScores);
                                                                            }
                                                                        }}
                                                                        className="w-16 h-8 text-center text-xs font-mono border-border-default mx-auto disabled:bg-surface-base disabled:cursor-not-allowed"
                                                                    />
                                                                </td>
                                                            );
                                                        })}
                                                        <td className="py-3 px-4 text-center">
                                                            {isFinal ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-status-success/10 text-status-success border border-status-success/20">
                                                                    <Lock className="size-3" />
                                                                    Final
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-status-warning/10 text-status-warning border border-status-warning/20">
                                                                    Draft Dosen
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            {isFinal && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const targetNilai = row.scores['uas'] || row.scores['uts'] || row.scores['tugas'];

                                                                        if (targetNilai?.id) {
                                                                            setWhitewashTarget({
                                                                                nilaiId: targetNilai.id,
                                                                                mhsNama: row.mahasiswa?.nama_lengkap,
                                                                                currentScore: targetNilai.nilai_angka,
                                                                            });
                                                                            setNewScore(targetNilai.nilai_angka);
                                                                        }
                                                                    }}
                                                                    className="p-1.5 rounded-md text-text-secondary hover:text-brand-primary hover:bg-surface-base transition-colors"
                                                                    title="Ajukan Pemutihan Nilai (Admin Only)"
                                                                >
                                                                    <ShieldCheck className="size-4" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Komposisi Bobot Nilai */}
            <Dialog open={isCompositionOpen} onOpenChange={setIsCompositionOpen}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Atur Komposisi Bobot Nilai Perkuliahan</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Total persentase bobot keseluruhan komponen HARUS tepat 100%.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveComposition} className="space-y-4 py-2 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-text-primary">Bobot Tugas (%)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={compTugas}
                                    onChange={(e) => setCompTugas(Number(e.target.value))}
                                    className="text-xs font-mono border-border-default"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-text-primary">Bobot UTS (%)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={compUts}
                                    onChange={(e) => setCompUts(Number(e.target.value))}
                                    className="text-xs font-mono border-border-default"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-text-primary">Bobot UAS (%)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={compUas}
                                    onChange={(e) => setCompUas(Number(e.target.value))}
                                    className="text-xs font-mono border-border-default"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-text-primary">Bobot Presensi (%)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={compPresensi}
                                    onChange={(e) => setCompPresensi(Number(e.target.value))}
                                    className="text-xs font-mono border-border-default"
                                />
                            </div>
                        </div>

                        <div className={`p-2.5 rounded-md text-xs font-bold text-center border ${
                            totalBobot === 100
                                ? 'bg-status-success/10 text-status-success border-status-success/20'
                                : 'bg-status-danger/10 text-status-danger border-status-danger/20'
                        }`}>
                            Total Bobot: {totalBobot}% {totalBobot === 100 ? '(VALID 100%)' : '(TIDAK VALID - Harus 100%)'}
                        </div>

                        <DialogFooter className="pt-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCompositionOpen(false)}
                                className="border-border-default text-text-primary text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={totalBobot !== 100}
                                className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
                            >
                                Simpan Komposisi
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Pemutihan Nilai Final (Admin Only) */}
            <Dialog open={!!whitewashTarget} onOpenChange={(open) => !open && setWhitewashTarget(null)}>
                <DialogContent className="sm:max-w-md bg-surface-card border-border-default">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-text-primary">Service Pemutihan Nilai Final (Admin Only)</DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary">
                            Perubahan nilai yang sudah berstatus FINAL wajib dicatat di Activity Log beserta alasan resmi.
                        </DialogDescription>
                    </DialogHeader>

                    {whitewashTarget && (
                        <form onSubmit={handleWhitewashSubmit} className="space-y-4 py-2 text-xs">
                            <div className="bg-surface-base p-3 rounded-md border border-border-default">
                                <span className="text-text-secondary text-[11px] block">Mahasiswa Target:</span>
                                <span className="font-bold text-text-primary text-xs block">{whitewashTarget.mhsNama}</span>
                                <span className="text-text-secondary text-[11px] block mt-1">Nilai Saat Ini: <span className="font-mono font-bold text-status-warning">{whitewashTarget.currentScore}</span></span>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-text-primary">Nilai Angka Baru *</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={newScore}
                                    onChange={(e) => setNewScore(Number(e.target.value))}
                                    className="text-xs font-mono border-border-default"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-text-primary">Alasan Resmi Pemutihan Nilai *</Label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Misal: Perbaikan nilai ujian susulan SK Dekan No. 102/2026..."
                                    value={alasanPemutihan}
                                    onChange={(e) => setAlasanPemutihan(e.target.value)}
                                    className="w-full text-xs rounded-md border border-border-default bg-surface-card p-2 text-text-primary"
                                />
                            </div>

                            <DialogFooter className="pt-2 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setWhitewashTarget(null)}
                                    className="border-border-default text-text-primary text-xs"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold"
                                >
                                    Proses Pemutihan Nilai
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

PenilaianIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Akademik', href: '#' },
        { title: 'Penilaian Perkuliahan', href: '/akademik/penilaian' },
    ],
};
