import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    Building2, 
    ArrowLeft, 
    Save, 
    Search, 
    Users, 
    Check, 
    FileText, 
    Phone, 
    MapPin, 
    Calendar,
    GraduationCap
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface DosenOption {
    id: number;
    nama_lengkap: string;
    nidn: string;
    gelar_depan?: string;
    gelar_belakang?: string;
}

interface FakultasData {
    id: number;
    kode: string;
    nama: string;
    nama_en: string | null;
    nama_singkat: string | null;
    alamat: string | null;
    telepon: string | null;
    tahun_berdiri: number | null;
    periode_berdiri: string | null;
    status: string;
    luas_m2: string | null;
    dekan_nama: string | null;
    dekan_nidn: string | null;
    wakil_dekan_1: string | null;
    wakil_dekan_2: string | null;
    wakil_dekan_3: string | null;
    wakil_dekan_4: string | null;
    visi: string | null;
    misi: string | null;
    program_studis?: Array<{ id: number; kode: string; nama: string; jenjang: string }>;
}

interface Props {
    fakultas: FakultasData;
    allFakultas: Array<{ id: number; kode: string; nama: string }>;
    dosens: DosenOption[];
}

export default function FakultasShow({ fakultas, allFakultas = [], dosens = [] }: Props) {
    const [selectedFakultasId, setSelectedFakultasId] = useState<string>(String(fakultas.id));

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Data Pelengkap', href: '/master/fakultas' },
        { title: 'Perguruan Tinggi', href: '/master/perguruan-tinggi' },
        { title: 'Fakultas', href: '/master/fakultas' },
        { title: 'Detail Fakultas', href: `/master/fakultas/${fakultas.id}` },
    ];

    const form = useForm({
        kode: fakultas.kode || '',
        nama: fakultas.nama || '',
        nama_en: fakultas.nama_en || '',
        nama_singkat: fakultas.nama_singkat || '',
        alamat: fakultas.alamat || '',
        telepon: fakultas.telepon || '',
        tahun_berdiri: fakultas.tahun_berdiri || '',
        periode_berdiri: fakultas.periode_berdiri || '',
        status: fakultas.status === 'aktif',
        luas_m2: fakultas.luas_m2 || '',

        dekan_nama: fakultas.dekan_nama || '',
        dekan_nidn: fakultas.dekan_nidn || '',
        wakil_dekan_1: fakultas.wakil_dekan_1 || '',
        wakil_dekan_2: fakultas.wakil_dekan_2 || '',
        wakil_dekan_3: fakultas.wakil_dekan_3 || '',
        wakil_dekan_4: fakultas.wakil_dekan_4 || '',

        visi: fakultas.visi || '',
        misi: fakultas.misi || '',
    });

    const handleSwitchFakultas = (id: string) => {
        if (!id) {
return;
}

        setSelectedFakultasId(id);
        router.get(`/master/fakultas/${id}`);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform(data => ({
            ...data,
            status: data.status ? 'aktif' : 'nonaktif',
        }));
        form.put(`/master/fakultas/${fakultas.id}`);
    };

    return (
        <>
            <Head title={`Detail Fakultas - ${fakultas.nama}`} />

            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Header Title (Matching Reference Image 1) */}
                <div className="pb-2 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Building2 className="w-7 h-7 text-emerald-600" />
                        Fakultas
                        <span className="text-base font-normal text-slate-500">Detail Fakultas</span>
                    </h1>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Top Action & Search Bar (Matching Reference Image 1) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Search / Switch Fakultas Dropdown */}
                        <div className="flex items-center gap-1.5 w-full sm:w-96">
                            <select
                                value={selectedFakultasId}
                                onChange={e => handleSwitchFakultas(e.target.value)}
                                className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-l-lg text-sm font-semibold text-slate-900 shadow-xs focus:ring-2 focus:ring-emerald-500"
                            >
                                {allFakultas.map(f => (
                                    <option key={f.id} value={f.id}>
                                        {f.kode} - {f.nama}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => handleSwitchFakultas(selectedFakultasId)}
                                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-r-lg text-sm font-semibold shadow-xs transition"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Buttons: Kembali ke Daftar & Simpan */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/master/fakultas"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-xs transition"
                            >
                                <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
                            </Link>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" /> Simpan
                            </button>
                        </div>
                    </div>

                    {/* Main Form Card (Matching Reference Image 1 & 2) */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-emerald-600 p-6 sm:p-8 space-y-8">
                        {/* Section 1: Identitas Fakultas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5 text-sm">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <label className="w-44 font-bold text-sky-900">
                                        Kode Fakultas<span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.kode}
                                        onChange={e => form.setData('kode', e.target.value)}
                                        placeholder="Contoh: FTK, FEBI, FASIH"
                                        className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white font-mono focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                </div>
                                {form.errors.kode && <p className="text-xs text-rose-600 ml-44">{form.errors.kode}</p>}

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <label className="w-44 font-bold text-sky-900">
                                        Nama Fakultas<span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.nama}
                                        onChange={e => form.setData('nama', e.target.value)}
                                        placeholder="Contoh: Fakultas Tarbiyah dan Keguruan"
                                        className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                </div>
                                {form.errors.nama && <p className="text-xs text-rose-600 ml-44">{form.errors.nama}</p>}

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <label className="w-44 font-bold text-sky-900">
                                        Nama Fakultas (EN)<span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.nama_en}
                                        onChange={e => form.setData('nama_en', e.target.value)}
                                        placeholder="Contoh: Faculty of Tarbiyah and Teacher Training"
                                        className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <label className="w-44 font-bold text-sky-900">
                                        Nama Singkat<span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.nama_singkat}
                                        onChange={e => form.setData('nama_singkat', e.target.value)}
                                        placeholder="Contoh: FTK"
                                        className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <label className="w-40 font-bold text-sky-900">Alamat</label>
                                    <input
                                        type="text"
                                        value={form.data.alamat}
                                        onChange={e => form.setData('alamat', e.target.value)}
                                        placeholder="Alamat gedung / kampus fakultas"
                                        className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <label className="w-40 font-bold text-sky-900">Telepon</label>
                                    <input
                                        type="text"
                                        value={form.data.telepon}
                                        onChange={e => form.setData('telepon', e.target.value)}
                                        placeholder="Nomor telepon fakultas"
                                        className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <label className="w-40 font-bold text-sky-900">Periode Berdiri</label>
                                    <select
                                        value={form.data.periode_berdiri}
                                        onChange={e => form.setData('periode_berdiri', e.target.value)}
                                        className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">-- Pilih Periode Berdiri --</option>
                                        <option value="20121">2012/2013 Ganjil</option>
                                        <option value="20151">2015/2016 Ganjil</option>
                                        <option value="20201">2020/2021 Ganjil</option>
                                        <option value="20231">2023/2024 Ganjil</option>
                                    </select>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <label className="w-40 font-bold text-sky-900">Status</label>
                                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                                        <input
                                            type="checkbox"
                                            checked={form.data.status}
                                            onChange={e => form.setData('status', e.target.checked)}
                                            className="w-4 h-4 rounded text-emerald-600 border-slate-300"
                                        />
                                        <span>Aktif</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Pejabat Fakultas (Matching Reference Image 1 & 2) */}
                        <div className="space-y-4 pt-4 border-t border-slate-200">
                            <h2 className="text-lg font-bold text-emerald-700 pb-2 border-b-2 border-emerald-600">
                                Pejabat Fakultas
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 text-sm">
                                {/* Left Column: Dekan, Wadek 1, Wadek 2 */}
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <label className="w-44 font-bold text-sky-900">Dekan</label>
                                        <input
                                            type="text"
                                            value={form.data.dekan_nama}
                                            onChange={e => form.setData('dekan_nama', e.target.value)}
                                            placeholder="Cari Dekan / Masukkan Nama Dekan"
                                            className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <label className="w-44 font-bold text-sky-900">Wakil Dekan 1</label>
                                        <input
                                            type="text"
                                            value={form.data.wakil_dekan_1}
                                            onChange={e => form.setData('wakil_dekan_1', e.target.value)}
                                            placeholder="Cari Wakil Dekan 1 (Bid. Akademik)"
                                            className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <label className="w-44 font-bold text-sky-900">Wakil Dekan 2</label>
                                        <input
                                            type="text"
                                            value={form.data.wakil_dekan_2}
                                            onChange={e => form.setData('wakil_dekan_2', e.target.value)}
                                            placeholder="Cari Wakil Dekan 2 (Bid. Keuangan & Umum)"
                                            className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Wadek 3, Wadek 4 */}
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <label className="w-40 font-bold text-sky-900">Wakil Dekan 3</label>
                                        <input
                                            type="text"
                                            value={form.data.wakil_dekan_3}
                                            onChange={e => form.setData('wakil_dekan_3', e.target.value)}
                                            placeholder="Cari Wakil Dekan 3 (Bid. Kemahasiswaan)"
                                            className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <label className="w-40 font-bold text-sky-900">Wakil Dekan 4</label>
                                        <input
                                            type="text"
                                            value={form.data.wakil_dekan_4}
                                            onChange={e => form.setData('wakil_dekan_4', e.target.value)}
                                            placeholder="Cari Wakil Dekan 4 (Bid. Kerjasama/Kelembagaan)"
                                            className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Informasi Fakultas (Visi & Misi - Matching Reference Image 2) */}
                        <div className="space-y-6 pt-4 border-t border-slate-200">
                            <h2 className="text-lg font-bold text-emerald-700 pb-2 border-b-2 border-emerald-600">
                                Informasi Fakultas
                            </h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-sky-900">Visi</label>
                                    <textarea
                                        rows={4}
                                        value={form.data.visi}
                                        onChange={e => form.setData('visi', e.target.value)}
                                        placeholder="Masukkan visi fakultas..."
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm bg-white leading-relaxed focus:ring-2 focus:ring-emerald-500 shadow-xs"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-sky-900">Misi</label>
                                    <textarea
                                        rows={5}
                                        value={form.data.misi}
                                        onChange={e => form.setData('misi', e.target.value)}
                                        placeholder="Masukkan butir-butir misi fakultas..."
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm bg-white leading-relaxed focus:ring-2 focus:ring-emerald-500 shadow-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

FakultasShow.layout = {
    breadcrumbs: [
        { title: 'Beranda', href: '/dashboard' },
        { title: 'Data Pelengkap', href: '/master/fakultas' },
        { title: 'Fakultas', href: '/master/fakultas' },
        { title: 'Detail Fakultas', href: '/master/fakultas' },
    ],
};

