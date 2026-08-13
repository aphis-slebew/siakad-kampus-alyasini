import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Calendar, CheckCircle2, Clock, MapPin, Save, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

type KelasKuliah = {
    id: number;
    nama_kelas: string;
    tahun_ajaran_id: number;
    kurikulum_matakuliah?: KurikulumMatakuliah;
    jadwal_perkuliahans?: JadwalPerkuliahan[];
};

type Mahasiswa = {
    id: number;
    nama_lengkap: string;
    nim: string;
};

type PresensiItem = {
    mahasiswa_id: number;
    status: string;
};

type Jurnal = {
    id: number;
    tanggal: string;
    materi: string;
    presensis?: PresensiItem[];
};

type TahunAjaran = {
    id: number;
    nama: string;
};

export default function PresensiIndex({
    kelases = [],
    selectedKelas,
    students = [],
    jurnals = [],
    tahunAjaran,
}: {
    kelases: KelasKuliah[];
    selectedKelas?: KelasKuliah | null;
    students: Mahasiswa[];
    jurnals: Jurnal[];
    tahunAjaran: TahunAjaran;
}) {
    const { errors, flash } = usePage<SharedData & { flash?: { success?: string }; errors?: Record<string, string> }>().props;

    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [materi, setMateri] = useState('');

    const initialAttendance: Record<number, string> = {};
    students.forEach((s) => {
        initialAttendance[s.id] = 'hadir';
    });

    const [attendanceState, setAttendanceState] = useState<Record<number, string>>(initialAttendance);

    const handleStatusChange = (mhsId: number, status: string) => {
        setAttendanceState((prev) => ({
            ...prev,
            [mhsId]: status,
        }));
    };

    const form = useForm({
        kelas_kuliah_id: selectedKelas?.id || '',
        tanggal: tanggal,
        materi: materi,
        presensis: [] as { mahasiswa_id: number; status: string }[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedKelas) return;

        const presensisPayload = students.map((s) => ({
            mahasiswa_id: s.id,
            status: attendanceState[s.id] || 'hadir',
        }));

        form.setData({
            kelas_kuliah_id: selectedKelas.id,
            tanggal: tanggal,
            materi: materi,
            presensis: presensisPayload,
        });

        form.post('/akademik/presensi', {
            preserveScroll: true,
        });
    };

    const errorMessage = errors?.presensi || errors?.tanggal || form.errors.tanggal || form.errors.materi;

    return (
        <>
            <Head title="Jurnal & Presensi Perkuliahan" />

            <div className="p-6 space-y-6 font-sans">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Jurnal Perkuliahan & Presensi Mahasiswa</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Pengisian materi jurnal dan kehadiran mahasiswa per pertemuan semester {tahunAjaran?.nama}.
                        </p>
                    </div>
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
                                window.location.href = `/akademik/presensi?kelas_kuliah_id=${val}`;
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

                {selectedKelas && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Session Journal Form */}
                        <div className="bg-surface-card p-4 rounded-lg border border-border-default space-y-4">
                            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                                1. Form Jurnal Pertemuan
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-text-primary">Tanggal Perkuliahan *</Label>
                                    <Input
                                        type="date"
                                        max={new Date().toISOString().split('T')[0]}
                                        value={tanggal}
                                        onChange={(e) => setTanggal(e.target.value)}
                                        className="text-xs border-border-default font-mono"
                                    />
                                    <span className="text-[11px] text-text-secondary block">
                                        Maksimal H-7 hari ke belakang. Tanggal masa depan dilarang.
                                    </span>
                                </div>

                                <div className="md:col-span-2 space-y-1">
                                    <Label className="text-xs font-semibold text-text-primary">Materi Perkuliahan *</Label>
                                    <Input
                                        placeholder="Misal: Pengantar Fiqih dan Pembagian Hukum Islam..."
                                        value={materi}
                                        onChange={(e) => setMateri(e.target.value)}
                                        className="text-xs border-border-default"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Student Attendance Sheet Table */}
                        <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                            <div className="p-3 bg-surface-base border-b border-border-default flex items-center justify-between">
                                <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                                    2. Daftar Presensi Mahasiswa (KRS Disetujui Wali)
                                </h2>
                                <span className="text-[11px] font-semibold text-brand-primary">
                                    Total: {students.length} Mahasiswa Terdaftar
                                </span>
                            </div>

                            {students.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Users className="mx-auto size-10 text-text-secondary/50 mb-3" />
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
                                                <th className="py-3 px-4 text-center w-64">Status Kehadiran</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-default text-text-primary">
                                            {students.map((item, index) => (
                                                <tr key={item.id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                                    <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                                    <td className="py-3 px-4 font-mono font-bold text-brand-primary">
                                                        {item.nim}
                                                    </td>
                                                    <td className="py-3 px-4 font-semibold text-text-primary">
                                                        {item.nama_lengkap}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <div className="inline-flex items-center gap-3 bg-surface-base px-3 py-1.5 rounded-md border border-border-default">
                                                            {['hadir', 'izin', 'sakit', 'alpa'].map((st) => (
                                                                <label key={st} className="inline-flex items-center gap-1 cursor-pointer text-xs uppercase font-semibold">
                                                                    <input
                                                                        type="radio"
                                                                        name={`status-${item.id}`}
                                                                        value={st}
                                                                        checked={(attendanceState[item.id] || 'hadir') === st}
                                                                        onChange={() => handleStatusChange(item.id, st)}
                                                                        className="text-brand-primary focus:ring-brand-primary"
                                                                    />
                                                                    <span className={
                                                                        st === 'hadir' ? 'text-status-success' :
                                                                        st === 'izin' ? 'text-brand-primary' :
                                                                        st === 'sakit' ? 'text-status-warning' : 'text-status-danger'
                                                                    }>
                                                                        {st}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {students.length > 0 && (
                                <div className="p-4 bg-surface-base border-t border-border-default flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={form.processing || !materi}
                                        className="bg-brand-primary text-white hover:bg-brand-primary-dark text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5"
                                    >
                                        <Save className="size-4" />
                                        Simpan Jurnal & Presensi
                                    </Button>
                                </div>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}

PresensiIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Akademik', href: '#' },
        { title: 'Jurnal & Presensi', href: '/akademik/presensi' },
    ],
};
