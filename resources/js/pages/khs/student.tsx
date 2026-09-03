import { Head, Link } from '@inertiajs/react';
import { Award, BookOpen, CheckCircle2, FileText, GraduationCap, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';


type Mahasiswa = {
    id: number;
    nama_lengkap: string;
    nim: string;
    program_studi?: { nama: string };
};

type TahunAjaran = {
    id: number;
    nama: string;
};

type KhsItem = {
    krs_detail_id: number;
    kode_mk: string;
    nama_mk: string;
    sks: number;
    nama_kelas: string;
    nilai_angka: number;
    nilai_huruf: string;
    bobot: number;
    is_final: boolean;
};

type KhsData = {
    mahasiswa?: Mahasiswa;
    tahunAjaran?: TahunAjaran;
    items?: KhsItem[];
    total_sks?: number;
    ips?: number;
};

export default function StudentKhsPage({
    khsData,
    tahunAjaran,
}: {
    khsData: KhsData;
    tahunAjaran: TahunAjaran;
}) {
    const items = khsData?.items || [];
    const totalSks = khsData?.total_sks || 0;
    const ips = khsData?.ips || 0.00;
    const mhs = khsData?.mahasiswa;

    return (
        <>
            <Head title="Kartu Hasil Studi (KHS)" />

            <div className="p-4 sm:p-6 space-y-6 font-sans">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                    <div>
                        <h1 className="text-xl font-semibold text-text-primary">Kartu Hasil Studi (KHS) Portal</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Laporan nilai hasil perkuliahan dan Indeks Prestasi Semester (IPS) {tahunAjaran?.nama}.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link href="/dokumen/khs">
                            <Button
                                variant="outline"
                                className="border-border-default text-text-primary text-xs font-semibold px-3 py-2 h-9 rounded-md flex items-center gap-1.5 hover:bg-surface-base"
                            >
                                <Printer className="size-4" />
                                Cetak KHS Resmi
                            </Button>
                        </Link>

                        <Link href="/dokumen/transkrip">
                            <Button
                                variant="outline"
                                className="border-border-default text-text-primary text-xs font-semibold px-3 py-2 h-9 rounded-md flex items-center gap-1.5 hover:bg-surface-base"
                            >
                                <FileText className="size-4" />
                                Transkrip Nilai
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Identity Card */}
                <div className="bg-surface-card p-5 rounded-lg border border-border-default space-y-3">
                    <div className="flex items-center justify-between border-b border-border-default pb-3">
                        <div>
                            <h2 className="text-sm font-bold text-brand-primary">{mhs?.nama_lengkap}</h2>
                            <p className="text-xs text-text-secondary font-mono mt-0.5">NIM: {mhs?.nim} • {mhs?.program_studi?.nama}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-text-secondary block">Semester Perkuliahan:</span>
                            <span className="text-xs font-bold text-text-primary">{tahunAjaran?.nama}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                        <div className="bg-surface-base p-3 rounded-md border border-border-default text-center">
                            <span className="text-[11px] text-text-secondary block uppercase font-semibold">Total SKS Diambil</span>
                            <span className="text-lg font-bold font-mono text-brand-primary">{totalSks} SKS</span>
                        </div>

                        <div className="bg-surface-base p-3 rounded-md border border-border-default text-center">
                            <span className="text-[11px] text-text-secondary block uppercase font-semibold">Indeks Prestasi (IPS)</span>
                            <span className="text-lg font-bold font-mono text-status-success">{ips.toFixed(2)}</span>
                        </div>

                        <div className="bg-surface-base p-3 rounded-md border border-border-default text-center col-span-2 sm:col-span-1">
                            <span className="text-[11px] text-text-secondary block uppercase font-semibold">Predikat Kelulusan</span>
                            <span className="text-sm font-bold text-text-primary">
                                {ips >= 3.5 ? 'Dengan Pujian (Cum Laude)' : ips >= 3.0 ? 'Sangat Memuaskan' : ips >= 2.5 ? 'Memuaskan' : 'Cukup'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* KHS Data Table */}
                <div className="rounded-lg border border-border-default bg-surface-card shadow-xs overflow-hidden">
                    <div className="p-3 bg-surface-base border-b border-border-default flex items-center justify-between">
                        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                            Rincian Perolehan Nilai Matakuliah
                        </h3>
                        <span className="text-[11px] text-text-secondary font-mono">
                            Dihitung On-The-Fly dari Nilai Final
                        </span>
                    </div>

                    {items.length === 0 ? (
                        <div className="p-12 text-center">
                            <BookOpen className="mx-auto size-10 text-text-secondary/50 mb-3" />
                            <h3 className="text-sm font-semibold text-text-primary">Belum ada KHS diterbitkan</h3>
                            <p className="text-xs text-text-secondary mt-1">
                                Nilai perkuliahan belum diinput atau disetujui untuk semester ini.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-surface-base border-b border-border-default text-text-secondary font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12">No</th>
                                        <th className="py-3 px-4 font-mono w-28">Kode MK</th>
                                        <th className="py-3 px-4">Nama Matakuliah</th>
                                        <th className="py-3 px-4 font-mono text-center w-20">SKS</th>
                                        <th className="py-3 px-4 font-mono text-center w-24">Nilai Angka</th>
                                        <th className="py-3 px-4 font-mono text-center w-24">Nilai Huruf</th>
                                        <th className="py-3 px-4 font-mono text-center w-24">Bobot</th>
                                        <th className="py-3 px-4 font-mono text-center w-28">SKS × Bobot</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-default text-text-primary">
                                    {items.map((item, index) => (
                                        <tr key={item.krs_detail_id} className="even:bg-surface-base/50 hover:bg-surface-base transition-colors duration-150">
                                            <td className="py-3 px-4 text-text-secondary">{index + 1}</td>
                                            <td className="py-3 px-4 font-mono font-bold text-brand-primary">{item.kode_mk}</td>
                                            <td className="py-3 px-4 font-semibold text-text-primary">
                                                {item.nama_mk}
                                                <span className="text-[11px] text-text-secondary font-normal block">Kelas {item.nama_kelas}</span>
                                            </td>
                                            <td className="py-3 px-4 font-mono text-center font-bold">{item.sks}</td>
                                            <td className="py-3 px-4 font-mono text-center font-bold">{item.nilai_angka}</td>
                                            <td className="py-3 px-4 text-center font-mono font-bold">
                                                <span className={`px-2 py-0.5 rounded text-[11px] ${
                                                    item.nilai_huruf === 'A' ? 'bg-status-success/10 text-status-success' :
                                                    item.nilai_huruf === 'B' ? 'bg-brand-primary/10 text-brand-primary' :
                                                    item.nilai_huruf === 'C' ? 'bg-status-warning/10 text-status-warning' : 'bg-status-danger/10 text-status-danger'
                                                }`}>
                                                    {item.nilai_huruf}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-mono text-center font-bold">{item.bobot}</td>
                                            <td className="py-3 px-4 font-mono text-center font-bold text-brand-primary">
                                                {(item.sks * item.bobot).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

StudentKhsPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Akademik', href: '#' },
        { title: 'Kartu Hasil Studi (KHS)', href: '/khs/saya' },
    ],
};
