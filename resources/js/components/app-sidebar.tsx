import { usePage } from '@inertiajs/react';
import {
    Activity,
    Award,
    BookOpenCheck,
    Building2,
    Calendar,
    ClipboardList,
    Coins,
    CreditCard,
    DoorOpen,
    FileText,
    GraduationCap,
    LayoutGrid,
    Receipt,
    RefreshCw,
    Settings,
    ShieldAlert,
    UserCheck,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavGroup, SharedData } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const userRoles = user?.roles || [];
    const isSuperAdmin = userRoles.includes('superadmin') || user?.user_type === 'superadmin';
    const isAdminAkademik = isSuperAdmin || userRoles.includes('admin_akademik') || user?.user_type === 'admin_akademik';
    const isPanitiaPmb = isSuperAdmin || userRoles.includes('panitia_pmb') || user?.user_type === 'panitia_pmb';
    const isStafKeuangan = isSuperAdmin || userRoles.includes('staf_keuangan') || user?.user_type === 'staf_keuangan';
    const isStafKepegawaian = isSuperAdmin || userRoles.includes('staf_kepegawaian') || user?.user_type === 'staf_kepegawaian';
    const isOperatorKemahasiswaan = isSuperAdmin || userRoles.includes('operator_kemahasiswaan') || user?.user_type === 'operator_kemahasiswaan';
    const isDosen = userRoles.includes('dosen') || userRoles.includes('kaprodi') || user?.user_type === 'dosen';
    const isKaprodi = userRoles.includes('kaprodi');
    const isMahasiswa = userRoles.includes('mahasiswa') || user?.user_type === 'mahasiswa';

    const navigationGroups: NavGroup[] = [
        {
            title: 'Utama',
            items: [
                {
                    title: 'Dashboard',
                    href: '/dashboard',
                    icon: LayoutGrid,
                },
            ],
        },
    ];

    // ==========================================
    // 1. PORTAL MAHASISWA (Khusus Mahasiswa)
    // ==========================================
    if (isMahasiswa) {
        navigationGroups.push({
            title: 'Portal Mahasiswa',
            items: [
                {
                    title: 'Profil Akademik',
                    href: '/mahasiswa/profil',
                    icon: Users,
                },
                {
                    title: 'Her-Registrasi Saya',
                    href: '/registrasi-ulang/saya',
                    icon: FileText,
                },
                {
                    title: 'Pembayaran UKT',
                    href: '/keuangan/bayar',
                    icon: CreditCard,
                },
                {
                    title: 'Riwayat Pembayaran',
                    href: '/mahasiswa/riwayat-pembayaran',
                    icon: Award,
                },
            ],
        });

        navigationGroups.push({
            title: 'Akademik Mahasiswa',
            items: [
                {
                    title: 'KRS Online',
                    href: '/krs/saya',
                    icon: ClipboardList,
                },
                {
                    title: 'Kartu Hasil Studi (KHS)',
                    href: '/khs/saya',
                    icon: Award,
                },
                {
                    title: 'Jadwal Kuliah',
                    href: '/mahasiswa/jadwal',
                    icon: Calendar,
                },
                {
                    title: 'Presensi Kehadiran',
                    href: '/mahasiswa/presensi',
                    icon: UserCheck,
                },
            ],
        });

        navigationGroups.push({
            title: 'Dokumen & Kelulusan',
            items: [
                {
                    title: 'Cetak Dokumen & Transkrip',
                    href: '/dokumen/transkrip',
                    icon: FileText,
                },
                {
                    title: 'Cetak Kartu Ujian',
                    href: '/dokumen/kartu-ujian',
                    icon: Award,
                },
                {
                    title: 'Proposal Skripsi',
                    href: '/skripsi/proposal',
                    icon: GraduationCap,
                },
                {
                    title: 'Pendaftaran Yudisium',
                    href: '/yudisium',
                    icon: Award,
                },
            ],
        });
    }

    // ==========================================
    // 2. MASTER DATA (Admin Akademik & Superadmin)
    // ==========================================
    if (isAdminAkademik) {
        navigationGroups.push({
            title: 'Master Data',
            items: [
                {
                    title: 'Perguruan Tinggi',
                    href: '/master/perguruan-tinggi',
                    icon: Building2,
                },
                {
                    title: 'Fakultas',
                    href: '/master/fakultas',
                    icon: Building2,
                },
                {
                    title: 'Program Studi',
                    href: '/master/program-studi',
                    icon: Building2,
                },
                {
                    title: 'Tahun & Kalender',
                    href: '/master/tahun-ajaran',
                    icon: Calendar,
                },
                {
                    title: 'Ruang Kuliah',
                    href: '/master/ruang-kuliah',
                    icon: DoorOpen,
                },
                {
                    title: 'Referensi Biodata',
                    href: '/master/referensi-biodata',
                    icon: FileText,
                },
                {
                    title: 'PD-DIKTI Feeder',
                    href: '/pddikti',
                    icon: RefreshCw,
                },
            ],
        });
    }

    // ==========================================
    // 3. PMB (Panitia PMB & Superadmin)
    // ==========================================
    if (isPanitiaPmb) {
        navigationGroups.push({
            title: 'PMB',
            items: [
                {
                    title: 'Gelombang & Jalur',
                    href: '/pmb/gelombang',
                    icon: Calendar,
                },
                {
                    title: 'Calon Mahasiswa',
                    href: '/pmb/calon-mahasiswa',
                    icon: Users,
                },
            ],
        });
    }

    // ==========================================
    // 4. KEUANGAN & REGISTRASI (BAU & Superadmin)
    // ==========================================
    if (isStafKeuangan) {
        navigationGroups.push({
            title: 'Keuangan & Registrasi',
            items: [
                {
                    title: 'Kasir Pembayaran POS',
                    href: '/keuangan/kasir',
                    icon: Receipt,
                },
                {
                    title: 'Tarif Komponen Biaya',
                    href: '/keuangan/komponen-biaya',
                    icon: Coins,
                },
                {
                    title: 'Periode Registrasi',
                    href: '/keuangan/periode-registrasi',
                    icon: Calendar,
                },
                {
                    title: 'Kelompok UKT',
                    href: '/keuangan/kelompok-ukt',
                    icon: CreditCard,
                },
                {
                    title: 'Verifikasi Pembayaran',
                    href: '/keuangan/pembayaran',
                    icon: UserCheck,
                },
                {
                    title: 'Verifikasi Her-Registrasi',
                    href: '/keuangan/registrasi-ulang',
                    icon: FileText,
                },
            ],
        });
    }

    // ==========================================
    // 5. AKADEMIK KAMPUS (Dosen, Kaprodi, Admin)
    // ==========================================
    if (isAdminAkademik) {
        navigationGroups.push({
            title: 'Akademik Kampus',
            items: [
                {
                    title: 'Data Mahasiswa',
                    href: '/mahasiswa',
                    icon: Users,
                },
                {
                    title: 'Kurikulum',
                    href: '/akademik/kurikulum',
                    icon: BookOpenCheck,
                },
                {
                    title: 'Mata Kuliah',
                    href: '/akademik/matakuliah',
                    icon: BookOpenCheck,
                },
                {
                    title: 'Kelas Kuliah',
                    href: '/akademik/kelas-kuliah',
                    icon: Building2,
                },
                {
                    title: 'Setting Prodi / Periode',
                    href: '/akademik/setting-prodi',
                    icon: Settings,
                },
                {
                    title: 'Dosen Wali',
                    href: '/akademik/dosen-wali',
                    icon: Users,
                },
                {
                    title: 'Presensi Perkuliahan',
                    href: '/akademik/presensi',
                    icon: UserCheck,
                },
                {
                    title: 'Penilaian Mahasiswa',
                    href: '/akademik/penilaian',
                    icon: Award,
                },
            ],
        });
    } else if (isKaprodi) {
        navigationGroups.push({
            title: 'Pengelolaan Prodi & Perkuliahan',
            items: [
                {
                    title: 'Kurikulum Prodi',
                    href: '/akademik/kurikulum',
                    icon: BookOpenCheck,
                },
                {
                    title: 'Mata Kuliah',
                    href: '/akademik/matakuliah',
                    icon: BookOpenCheck,
                },
                {
                    title: 'Kelas Kuliah',
                    href: '/akademik/kelas-kuliah',
                    icon: Building2,
                },
                {
                    title: 'Approval KRS Wali',
                    href: '/perwalian/krs',
                    icon: ClipboardList,
                },
                {
                    title: 'Presensi & Jurnal',
                    href: '/akademik/presensi',
                    icon: UserCheck,
                },
                {
                    title: 'Penilaian Mahasiswa',
                    href: '/akademik/penilaian',
                    icon: Award,
                },
            ],
        });
    } else if (isDosen) {
        navigationGroups.push({
            title: 'Perkuliahan & Bimbingan',
            items: [
                {
                    title: 'Kelas Kuliah',
                    href: '/akademik/kelas-kuliah',
                    icon: Building2,
                },
                {
                    title: 'Approval KRS Wali',
                    href: '/perwalian/krs',
                    icon: ClipboardList,
                },
                {
                    title: 'Presensi & Jurnal',
                    href: '/akademik/presensi',
                    icon: UserCheck,
                },
                {
                    title: 'Penilaian Mahasiswa',
                    href: '/akademik/penilaian',
                    icon: Award,
                },
            ],
        });
    }

    // ==========================================
    // 6. TUGAS AKHIR (Dosen, Admin, Superadmin)
    // ==========================================
    if (isAdminAkademik || isDosen) {
        navigationGroups.push({
            title: 'Tugas Akhir & Kelulusan',
            items: [
                {
                    title: 'Proposal Skripsi',
                    href: '/skripsi/proposal',
                    icon: BookOpenCheck,
                },
                {
                    title: 'Bimbingan Skripsi',
                    href: '/skripsi/bimbingan',
                    icon: GraduationCap,
                },
                {
                    title: 'Yudisium & Wisuda',
                    href: '/yudisium',
                    icon: Award,
                },
            ],
        });
    }

    // ==========================================
    // 7. KEPEGAWAIAN (HRD & Superadmin)
    // ==========================================
    if (isStafKepegawaian) {
        navigationGroups.push({
            title: 'Kepegawaian',
            items: [
                {
                    title: 'Data Dosen',
                    href: '/kepegawaian/dosen',
                    icon: GraduationCap,
                },
                {
                    title: 'Data Pegawai / Staf',
                    href: '/kepegawaian/pegawai',
                    icon: Users,
                },
                {
                    title: 'Unit Kerja',
                    href: '/kepegawaian/unit-kerja',
                    icon: Building2,
                },
            ],
        });
    }

    // ==========================================
    // 8. KEMAHASISWAAN
    // ==========================================
    if (isOperatorKemahasiswaan) {
        navigationGroups.push({
            title: 'Kemahasiswaan',
            items: [
                {
                    title: 'Aktivitas & Beasiswa',
                    href: '/kemahasiswaan/aktivitas',
                    icon: Activity,
                },
                {
                    title: 'Pelanggaran & Sanksi',
                    href: '/kemahasiswaan/pelanggaran',
                    icon: ShieldAlert,
                },
            ],
        });
    }

    // ==========================================
    // 9. LAPORAN & MONITORING
    // ==========================================
    const canSeeLaporan = isAdminAkademik || isDosen || isKaprodi || isStafKeuangan;

    if (canSeeLaporan) {
        const laporanItems = [];

        if (isAdminAkademik || isKaprodi) {
            laporanItems.push({
                title: 'Laporan KRS',
                href: '/laporan/krs',
                icon: FileText,
            });
        }

        if (isAdminAkademik || isDosen) {
            laporanItems.push({
                title: 'Rekap Nilai',
                href: '/laporan/rekap-nilai',
                icon: ClipboardList,
            });
        }

        if (isSuperAdmin || isStafKeuangan) {
            laporanItems.push({
                title: 'Piutang UKT',
                href: '/laporan/piutang-ukt',
                icon: CreditCard,
            });
        }

        if (laporanItems.length > 0) {
            navigationGroups.push({
                title: 'Laporan & Monitoring',
                items: laporanItems,
            });
        }
    }

    // ==========================================
    // 10. SISTEM & PENGGUNA (Superadmin)
    // ==========================================
    if (isSuperAdmin) {
        navigationGroups.push({
            title: 'Sistem & Pengguna',
            items: [
                {
                    title: 'Manajemen Pengguna',
                    href: '/users',
                    icon: Users,
                },
                {
                    title: 'Konfigurasi Sistem',
                    href: '/settings/system-configs',
                    icon: ShieldAlert,
                },
                {
                    title: 'Monitoring & Audit Log',
                    href: '/superadmin/monitoring',
                    icon: Activity,
                },
            ],
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-border-default bg-surface-card">
            <SidebarHeader className="border-b border-border-default px-4 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                            <a href="/dashboard">

                                <AppLogo />
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="py-2">
                <NavMain groups={navigationGroups} />
            </SidebarContent>

            <SidebarFooter className="border-t border-border-default p-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
