import { Head, Link, router, useForm } from '@inertiajs/react';
import { 
    Settings, 
    Calendar, 
    Copy, 
    ExternalLink, 
    Search, 
    CheckCircle2, 
    Building2, 
    GraduationCap, 
    ChevronRight, 
    Clock,
    X
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface SettingItem {
    id: number;
    tahun_ajaran_id: number;
    program_studi_id: number | null;
    buka_krs: boolean;
    buka_khs: boolean;
    buka_pengisian_nilai: boolean;
    buka_cetak_uts: boolean;
    buka_cetak_uas: boolean;
    tahun_ajaran?: { id: number; nama: string };
    program_studi?: { id: number; kode: string; nama: string; jenjang: string; fakultas?: { nama: string } };
}

interface Props {
    settings: SettingItem[];
    tahunAjarans: Array<{ id: number; nama: string; is_active: boolean }>;
    selectedTahun?: { id: number; nama: string };
    filters: {
        tahun_ajaran_id: number | null;
    };
}

export default function SettingProdiIndex({ settings, tahunAjarans, selectedTahun, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Akademik', href: '/akademik/kelas-kuliah' },
        { title: 'Setting Prodi', href: '/akademik/setting-prodi' },
    ];

    const copyForm = useForm({
        from_tahun_ajaran_id: '',
        to_tahun_ajaran_id: filters.tahun_ajaran_id || (tahunAjarans[0]?.id ? String(tahunAjarans[0].id) : ''),
    });

    const handleTahunChange = (taId: string) => {
        router.get('/akademik/setting-prodi', { tahun_ajaran_id: taId }, { preserveState: true });
    };

    const handleCopySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        copyForm.post('/akademik/setting-prodi/copy', {
            onSuccess: () => setIsCopyModalOpen(false),
        });
    };

    const filteredSettings = settings.filter(s => {
        if (!searchTerm) {
return true;
}

        const term = searchTerm.toLowerCase();
        const prodiName = s.program_studi?.nama?.toLowerCase() || 'global';
        const prodiKode = s.program_studi?.kode?.toLowerCase() || '';

        return prodiName.includes(term) || prodiKode.includes(term);
    });

    return (
        <>
            <Head title="Setting Program Studi & Periode Perkuliahan" />

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <Settings className="w-6 h-6 text-emerald-600" />
                            Setting Program Studi & Perkuliahan
                        </h1>
                        <p className="text-sm text-slate-600 mt-1">
                            Kelola jendela pembukaan KRS, KHS, Ujian UTS/UAS, dan hak akses nilai per semester.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCopyModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition"
                        >
                            <Copy className="w-4 h-4" /> Salin dari Semester Lalu
                        </button>
                    </div>
                </div>

                {/* Filter Toolbar Card (Senior-friendly, clear inputs) */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                        <label className="text-sm font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-emerald-600" /> Periode Semester:
                        </label>
                        <select
                            value={filters.tahun_ajaran_id || ''}
                            onChange={e => handleTahunChange(e.target.value)}
                            className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 bg-slate-50 focus:bg-white min-w-[240px]"
                        >
                            {tahunAjarans.map(ta => (
                                <option key={ta.id} value={ta.id}>
                                    {ta.nama} {ta.is_active ? '(Semester Aktif)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari program studi..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                        />
                    </div>
                </div>

                {/* Settings Grid / Table (Senior-friendly) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredSettings.map(item => {
                        const isGlobal = !item.program_studi_id;

                        return (
                            <div
                                key={item.id}
                                className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden ${
                                    isGlobal ? 'border-emerald-300 ring-2 ring-emerald-500/20' : 'border-slate-200'
                                }`}
                            >
                                <div className="p-5 space-y-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            {isGlobal ? (
                                                <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                                                    <Building2 className="w-5 h-5" />
                                                </span>
                                            ) : (
                                                <span className="p-2 rounded-lg bg-sky-100 text-sky-800">
                                                    <GraduationCap className="w-5 h-5" />
                                                </span>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-base leading-tight">
                                                    {isGlobal ? 'Setting Global Institusi' : `${item.program_studi?.jenjang} - ${item.program_studi?.nama}`}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {isGlobal ? 'Default seluruh kampus' : `Fakultas: ${item.program_studi?.fakultas?.nama || '-'}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badges */}
                                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                                        <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                                            <span className="text-slate-600 font-medium">Buka KRS:</span>
                                            <span className={`font-bold ${item.buka_krs ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {item.buka_krs ? '✓ Ya' : '✗ Tidak'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                                            <span className="text-slate-600 font-medium">Buka KHS:</span>
                                            <span className={`font-bold ${item.buka_khs ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {item.buka_khs ? '✓ Ya' : '✗ Tidak'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                                            <span className="text-slate-600 font-medium">Input Nilai:</span>
                                            <span className={`font-bold ${item.buka_pengisian_nilai ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {item.buka_pengisian_nilai ? '✓ Ya' : '✗ Tidak'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                                            <span className="text-slate-600 font-medium">Cetak UTS:</span>
                                            <span className={`font-bold ${item.buka_cetak_uts ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {item.buka_cetak_uts ? '✓ Ya' : '✗ Tidak'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                                    <span className="text-xs text-slate-500 font-medium">
                                        Periode: <strong className="text-slate-700">{item.tahun_ajaran?.nama}</strong>
                                    </span>
                                    <Link
                                        href={`/akademik/setting-prodi/${item.id}`}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition"
                                    >
                                        Buka Setting <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredSettings.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <Settings className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-slate-800">Tidak ada data pengaturan</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Pilih periode semester yang lain atau gunakan tombol salin pengaturan.
                        </p>
                    </div>
                )}
            </div>

            {/* Copy Rollover Modal */}
            {isCopyModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Copy className="w-5 h-5 text-emerald-400" /> Salin Pengaturan Semester
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsCopyModalOpen(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCopySubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Dari Semester Sumber (Asal):
                                </label>
                                <select
                                    value={copyForm.data.from_tahun_ajaran_id}
                                    onChange={e => copyForm.setData('from_tahun_ajaran_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                                    required
                                >
                                    <option value="">-- Pilih Semester Sumber --</option>
                                    {tahunAjarans.map(ta => (
                                        <option key={ta.id} value={ta.id}>{ta.nama}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Ke Semester Tujuan:
                                </label>
                                <select
                                    value={copyForm.data.to_tahun_ajaran_id}
                                    onChange={e => copyForm.setData('to_tahun_ajaran_id', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                                    required
                                >
                                    <option value="">-- Pilih Semester Tujuan --</option>
                                    {tahunAjarans.map(ta => (
                                        <option key={ta.id} value={ta.id}>{ta.nama}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setIsCopyModalOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-slate-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={copyForm.processing}
                                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition disabled:opacity-50"
                                >
                                    Mulai Salin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

SettingProdiIndex.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Akademik Kampus', href: '/akademik/setting-prodi' },
        { title: 'Setting Prodi & Perkuliahan', href: '/akademik/setting-prodi' },
    ],
};

