import { Head } from '@inertiajs/react';
import { ArrowLeft, Printer, QrCode } from 'lucide-react';
import { KopSuratResmi } from '@/components/kop-surat-resmi';
import { Button } from '@/components/ui/button';

type KelasData = {
    id: number;
    nama_kelas: string;
    kurikulum_matakuliah?: {
        matakuliah?: {
            kode: string;
            nama: string;
            sks: number;
        };
        kurikulum_prodi?: {
            program_studi?: {
                jenjang: string;
                nama: string;
                fakultas?: {
                    nama: string;
                };
            };
        };
    };
    tahun_ajaran?: {
        nama: string;
    };
    dosen_pengajars?: Array<{
        dosen?: {
            nama_lengkap: string;
            gelar_depan?: string;
            gelar_belakang?: string;
            nidn?: string;
        };
    }>;
};

type PresensiItem = {
    id: number;
    pertemuan_ke: number;
    tanggal: string;
    materi_pembahasan?: string | null;
    status_verifikasi?: boolean;
};

type MahasiswaPeserta = {
    id: number;
    nim: string;
    nama_lengkap: string;
};

export default function CetakBeritaAcara({
    kelas,
    presensis = [],
    mahasiswas = [],
    nomorDokumen,
}: {
    kelas: KelasData;
    presensis: PresensiItem[];
    mahasiswas: MahasiswaPeserta[];
    nomorDokumen: string;
}) {
    const handlePrint = () => {
        window.print();
    };

    const mk = kelas.kurikulum_matakuliah?.matakuliah;
    const prodi = kelas.kurikulum_matakuliah?.kurikulum_prodi?.program_studi;
    const dosenUtama = kelas.dosen_pengajars?.[0]?.dosen;

    const formatDosenName = (d?: { nama_lengkap: string; gelar_depan?: string; gelar_belakang?: string } | null) => {
        if (!d) {
return '-';
}

        const depan = d.gelar_depan ? `${d.gelar_depan} ` : '';
        const belakang = d.gelar_belakang ? `, ${d.gelar_belakang}` : '';

        return `${depan}${d.nama_lengkap}${belakang}`;
    };

    // Generate 16 meeting rows
    const meetingRows = Array.from({ length: 16 }, (_, i) => {
        const pertemuanKe = i + 1;
        const logged = presensis.find((p) => p.pertemuan_ke === pertemuanKe);

        return {
            pertemuanKe,
            tanggal: logged?.tanggal ? new Date(logged.tanggal).toLocaleDateString('id-ID') : '',
            materi: logged?.materi_pembahasan || (pertemuanKe === 8 ? 'Ujian Tengah Semester (UTS)' : pertemuanKe === 16 ? 'Ujian Akhir Semester (UAS)' : ''),
            isLogged: Boolean(logged),
        };
    });

    return (
        <>
            <Head title={`BAP - ${mk?.nama || 'Kelas Kuliah'} - ${kelas.nama_kelas}`} />

            <div className="min-h-screen bg-surface-base py-6 font-sans text-text-primary print:bg-white print:py-0 print:m-0">
                {/* Action Bar */}
                <div className="max-w-5xl mx-auto px-4 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 print:hidden">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.history.back()}
                        className="text-xs flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <ArrowLeft className="size-3.5" />
                        <span>Kembali</span>
                    </Button>

                    <Button
                        size="sm"
                        onClick={handlePrint}
                        className="bg-brand-primary hover:bg-brand-primary-dark text-white text-xs flex items-center gap-1.5 self-start sm:self-auto"
                    >
                        <Printer className="size-3.5" />
                        <span>Cetak Berita Acara & Presensi (PDF / Printer)</span>
                    </Button>
                </div>

                {/* Printable Document A4 Container */}
                <div className="max-w-5xl mx-auto bg-white p-4 sm:p-8 md:p-12 shadow-sm rounded-lg border border-border-default print:shadow-none print:border-none print:p-4 print:max-w-none">
                    <KopSuratResmi
                        title="BERITA ACARA PERKULIAHAN & REKAP KEHADIRAN"
                        subtitle={`Semester / Tahun Akademik: ${kelas.tahun_ajaran?.nama || '2026/2027 Ganjil'}`}
                        nomorDokumen={nomorDokumen}
                    />

                    {/* Metadata Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs my-4 pb-2 border-b border-border-default">
                        <div className="space-y-1">
                            <div className="flex">
                                <span className="w-32 text-text-secondary">Mata Kuliah</span>
                                <span className="font-semibold text-text-primary">: {mk?.nama} ({mk?.kode})</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 text-text-secondary">Bobot SKS</span>
                                <span className="font-semibold text-text-primary">: {mk?.sks || 0} SKS</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 text-text-secondary">Kelas / Ruang</span>
                                <span>: {kelas.nama_kelas}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex">
                                <span className="w-36 text-text-secondary">Program Studi</span>
                                <span>: {prodi?.jenjang} {prodi?.nama}</span>
                            </div>
                            <div className="flex">
                                <span className="w-36 text-text-secondary">Dosen Pengajar</span>
                                <span className="font-semibold text-text-primary">: {formatDosenName(dosenUtama)}</span>
                            </div>
                            <div className="flex">
                                <span className="w-36 text-text-secondary">Jumlah Mahasiswa</span>
                                <span>: {mahasiswas.length} Orang</span>
                            </div>
                        </div>
                    </div>

                    {/* 16 Meetings Log Table */}
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
                        I. Jurnal Realisasi Tatap Muka Perkuliahan (16 Pertemuan)
                    </h3>
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-[11px] border-collapse border border-slate-900 min-w-[600px] sm:min-w-0">
                            <thead>
                                <tr className="bg-slate-100 text-slate-900 font-semibold border-b border-slate-900 text-center">
                                    <th className="border border-slate-900 p-1 w-10">Ptm</th>
                                    <th className="border border-slate-900 p-1 w-24">Hari / Tgl</th>
                                    <th className="border border-slate-900 p-1 text-left">Pokok Bahasan / Materi Pembelajaran</th>
                                    <th className="border border-slate-900 p-1 w-16">Status</th>
                                    <th className="border border-slate-900 p-1 w-24">Paraf Dosen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {meetingRows.map((row) => (
                                    <tr key={row.pertemuanKe} className="border-b border-slate-900">
                                        <td className="border border-slate-900 p-1 text-center font-bold">{row.pertemuanKe}</td>
                                        <td className="border border-slate-900 p-1 text-center font-mono">{row.tanggal || '-'}</td>
                                        <td className="border border-slate-900 p-1 font-medium">{row.materi || '-'}</td>
                                        <td className="border border-slate-900 p-1 text-center">
                                            {row.isLogged ? (
                                                <span className="font-semibold text-status-success">Terlaksana</span>
                                            ) : (
                                                <span className="text-text-secondary italic">Rencana</span>
                                            )}
                                        </td>
                                        <td className="border border-slate-900 p-1 text-center text-[9px] text-text-secondary">
                                            <div className="h-5 flex items-center justify-center">
                                                ( . . . . . . . . )
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Signatures */}
                    <div className="mt-8 grid grid-cols-2 gap-8 text-xs text-center">
                        <div className="space-y-16">
                            <div>
                                <p className="text-text-secondary">Mengetahui,</p>
                                <p className="text-text-secondary font-semibold">Ketua Program Studi {prodi?.nama || 'PAI'},</p>
                            </div>
                            <div>
                                <p className="font-semibold underline uppercase text-text-primary">
                                    Dr. H. Ahmad Fauzi, M.Pd.I
                                </p>
                                <p className="font-mono text-[11px] text-text-secondary">NIDN: 2108098201</p>
                            </div>
                        </div>

                        <div className="space-y-16">
                            <div>
                                <p className="text-text-secondary">Pasuruan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="text-text-secondary font-semibold">Dosen Pengampu Mata Kuliah,</p>
                            </div>
                            <div>
                                <p className="font-semibold underline uppercase text-text-primary">
                                    {formatDosenName(dosenUtama)}
                                </p>
                                <p className="font-mono text-[11px] text-text-secondary">NIDN: {dosenUtama?.nidn || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Security Footnote */}
                    <div className="mt-8 pt-3 border-t border-border-default flex items-center justify-between text-[10px] text-text-secondary">
                        <div className="flex items-center gap-1.5">
                            <QrCode className="size-4 text-brand-primary" />
                            <span>Arsip Berita Acara Perkuliahan SIAKAD STAI Al-Yasini Pasuruan.</span>
                        </div>
                        <span className="font-mono">Verifikasi: {nomorDokumen}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
