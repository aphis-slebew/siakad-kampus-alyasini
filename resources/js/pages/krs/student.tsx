import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, BookOpen, CheckCircle2, Send, ShieldAlert, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableHead, TableCell, StackedCell } from '@/components/ui/table';
import type { SharedData } from '@/types';

type Mahasiswa = {
    id: number;
    nama_lengkap: string;
    nim: string;
};

type TahunAjaran = {
    id: number;
    nama: string;
};

type Eligibility = {
    is_eligible: boolean;
    reasons: string[];
};

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
    ruang_kuliah?: RuangKuliah | null;
};

type Dosen = {
    id: number;
    nama_lengkap: string;
};

type DosenPengajar = {
    id: number;
    peran: string;
    dosen?: Dosen;
};

type KelasKuliah = {
    id: number;
    nama_kelas: string;
    kuota: number;
    enrolled_count?: number;
    kurikulum_matakuliah?: KurikulumMatakuliah;
    jadwal_perkuliahans?: JadwalPerkuliahan[];
    dosen_pengajars?: DosenPengajar[];
};

type KrsDetail = {
    id: number;
    kelas_kuliah_id: number;
    kelas_kuliah?: KelasKuliah;
};

type Krs = {
    id: number;
    status: string;
    diajukan_at: string | null;
    disetujui_at: string | null;
    catatan_penolakan: string | null;
    krs_details?: KrsDetail[];
};

export default function StudentKrsPortal({
    mahasiswa,
    tahunAjaran,
    eligibility,
    krs,
    availableClasses = [],
}: {
    mahasiswa: Mahasiswa;
    tahunAjaran: TahunAjaran;
    eligibility: Eligibility;
    krs: Krs;
    availableClasses: KelasKuliah[];
}) {
    const { errors } = usePage<SharedData & { errors?: Record<string, string> }>().props;

    const initialSelectedIds = krs?.krs_details
        ? krs.krs_details.map((d) => d.kelas_kuliah_id)
        : [];

    const [selectedClassIds, setSelectedClassIds] = useState<number[]>(initialSelectedIds);

    const toggleClassSelection = (item: KelasKuliah) => {
        if (krs?.status === 'diajukan' || krs?.status === 'disetujui_wali') return;

        const isFull = (item.enrolled_count || 0) >= item.kuota;
        if (isFull && !selectedClassIds.includes(item.id)) return; // Cannot select full class

        if (selectedClassIds.includes(item.id)) {
            setSelectedClassIds(selectedClassIds.filter((id) => id !== item.id));
        } else {
            setSelectedClassIds([...selectedClassIds, item.id]);
        }
    };

    const selectedClasses = availableClasses.filter((k) => selectedClassIds.includes(k.id));
    const totalSks = selectedClasses.reduce((sum, k) => sum + (k.kurikulum_matakuliah?.matakuliah?.sks || 0), 0);

    const submitForm = useForm({
        kelas_kuliah_ids: [] as number[],
    });

    const handleSubmitKrs = () => {
        if (!eligibility.is_eligible || selectedClassIds.length === 0 || krs?.status !== 'draft') return;

        if (confirm(`Apakah Anda yakin ingin mengajukan ${selectedClassIds.length} matakuliah (${totalSks} SKS) ke Dosen Wali?`)) {
            router.post('/krs/saya/submit', {
                kelas_kuliah_ids: selectedClassIds,
            });
        }
    };

    const errorMessage = errors?.krs || errors?.kelas_kuliah_ids || submitForm.errors.kelas_kuliah_ids;
    const isSubmitDisabled = !eligibility.is_eligible || selectedClassIds.length === 0 || (krs?.status !== 'draft' && krs?.status !== 'ditolak');

    return (
        <>
            <Head title="Pengisian Kartu Rencana Studi (KRS)" />

            <div className="p-6 space-y-6 font-sans">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Kartu Rencana Studi (KRS) Portal</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Pengajuan matakuliah & jadwal perkuliahan semester {tahunAjaran?.nama}.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-surface-base px-3 py-1.5 rounded-md border border-border-default text-xs font-mono">
                            Total SKS Dipilih: <span className="font-bold text-brand-primary text-sm">{totalSks}</span> / 24 SKS
                        </div>

                        <Button
                            onClick={handleSubmitKrs}
                            disabled={isSubmitDisabled}
                            className={`text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 transition-all ${
                                isSubmitDisabled
                                    ? 'bg-surface-base text-text-secondary/60 border border-border-default cursor-not-allowed opacity-60'
                                    : 'bg-brand-primary text-white hover:bg-brand-primary-dark shadow-xs'
                            }`}
                        >
                            <Send className="size-3.5" />
                            Ajukan KRS ke Dosen Wali
                        </Button>
                    </div>
                </div>

                {/* Eligibility Status Banner */}
                {!eligibility.is_eligible ? (
                    <div className="bg-status-danger/10 border border-status-danger/30 rounded-lg p-4 text-xs font-medium space-y-1.5">
                        <div className="flex items-center gap-2 text-status-danger font-bold text-sm">
                            <ShieldAlert className="size-5 shrink-0" />
                            <span>Pengajuan KRS Dikunci (Persyaratan Belum Terpenuhi)</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-status-danger pl-1">
                            {eligibility.reasons.map((reason, idx) => (
                                <li key={idx}>{reason}</li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="bg-status-success/10 border border-status-success/30 rounded-lg p-3 text-xs font-semibold text-status-success flex items-center gap-2">
                        <CheckCircle2 className="size-4 shrink-0" />
                        <span>Status Mahasiswa Eligible: Persyaratan Cekal, Her-Registrasi, dan Pembayaran UKT Terpenuhi.</span>
                    </div>
                )}

                {/* Error Alert Banner untuk Validasi Kuota Penuh / Bentrok Jadwal / Prasyarat */}
                {errorMessage && (
                    <div className="bg-status-danger/10 border border-status-danger/40 rounded-lg p-4 text-status-danger text-xs font-semibold flex items-start gap-2.5">
                        <AlertCircle className="size-5 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                            <span className="font-bold block text-sm">GAGAL PENGAJUAN KRS:</span>
                            <span className="font-normal text-xs leading-relaxed block">{errorMessage}</span>
                        </div>
                    </div>
                )}

                {/* Status KRS Badge */}
                <div className="bg-surface-card p-4 rounded-lg border border-border-default flex items-center justify-between">
                    <div>
                        <span className="text-text-secondary text-xs block">Status Dokumen KRS:</span>
                        <span className="font-bold text-sm uppercase tracking-wide text-text-primary">
                            {krs?.status.replace('_', ' ')}
                        </span>
                        {krs?.catatan_penolakan && (
                            <p className="text-status-danger text-xs mt-1 font-medium">
                                Catatan Penolakan Dosen Wali: &quot;{krs.catatan_penolakan}&quot;
                            </p>
                        )}
                    </div>

                    <div className="text-right text-xs">
                        <span className="text-text-secondary block">Mahasiswa: {mahasiswa?.nama_lengkap} ({mahasiswa?.nim})</span>
                        <span className="text-text-secondary">Semester: {tahunAjaran?.nama}</span>
                    </div>
                </div>

                {/* Selection Table of Available Ready Classes */}
                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    <div className="p-3 bg-surface-base border-b border-border-default flex items-center justify-between">
                        <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                            Pilihan Kelas & Jadwal Perkuliahan Terbuka
                        </h2>
                        <span className="text-[11px] text-text-secondary">
                            Hanya menampilkan kelas dengan Dosen & Ruangan lengkap. Kelas berkuota penuh ditandai khusus.
                        </span>
                    </div>

                    {availableClasses.length === 0 ? (
                        <div className="p-12 text-center">
                            <BookOpen className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Belum ada kelas perkuliahan terbuka</h3>
                            <p className="text-xs text-text-secondary mt-1">
                                Belum ada kelas kuliah yang dijadwalkan lengkap untuk semester ini.
                            </p>
                        </div>
                    ) : (
                        <ResponsiveTable>
                            <TableHeader>
                                <TableRow>
                                    <TableHead align="center" className="w-12">Pilih</TableHead>
                                    <TableHead>Matakuliah & Kelas</TableHead>
                                    <TableHead>Dosen & Penjadwalan</TableHead>
                                    <TableHead align="center" className="w-36">Kuota & Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {availableClasses.map((item) => {
                                    const isSelected = selectedClassIds.includes(item.id);
                                    const enrolled = item.enrolled_count || 0;
                                    const isFull = enrolled >= item.kuota;
                                    const jadwal = item.jadwal_perkuliahans && item.jadwal_perkuliahans[0];
                                    const ruang = jadwal?.ruang_kuliah;

                                    return (
                                        <TableRow
                                            key={item.id}
                                            onClick={() => !isFull && toggleClassSelection(item)}
                                            className={`cursor-pointer ${
                                                isFull
                                                    ? 'bg-red-50/50 dark:bg-red-950/20 opacity-80 cursor-not-allowed'
                                                    : isSelected
                                                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 font-medium'
                                                    : ''
                                            }`}
                                        >
                                            <TableCell align="center" className="p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    disabled={isFull || krs?.status === 'diajukan' || krs?.status === 'disetujui_wali'}
                                                    onChange={() => toggleClassSelection(item)}
                                                    className="rounded border-input text-emerald-600 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed h-4 w-4"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <StackedCell
                                                    primary={`${item.kurikulum_matakuliah?.matakuliah?.nama} (${item.kurikulum_matakuliah?.matakuliah?.kode}) • ${item.kurikulum_matakuliah?.matakuliah?.sks} SKS`}
                                                    secondary={`Kelas ${item.nama_kelas} • Semester ${item.kurikulum_matakuliah?.semester}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium text-foreground text-xs">
                                                        {item.dosen_pengajars?.map(dp => dp.dosen?.nama_lengkap).join(', ') || 'Dosen Belum Ditugaskan'}
                                                    </div>
                                                    {jadwal ? (
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                            <span>{jadwal.hari}, {jadwal.jam_mulai.substring(0, 5)}-{jadwal.jam_selesai.substring(0, 5)}</span>
                                                            •
                                                            <span>{ruang ? ruang.nama : 'Belum Ada Ruang'}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-muted-foreground italic">Belum dijadwalkan</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell align="center">
                                                {isFull ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                                        Penuh ({enrolled}/{item.kuota})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                        Tersedia ({enrolled}/{item.kuota})
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </ResponsiveTable>
                    )}
                </div>
            </div>
        </>
    );
}

StudentKrsPortal.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Akademik', href: '#' },
        { title: 'KRS Portal', href: '/krs/saya' },
    ],
};
