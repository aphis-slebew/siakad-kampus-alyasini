import { usePage } from '@inertiajs/react';
import {
    Activity,
    Award,
    BookOpenCheck,
    Building2,
    Calendar,
    ClipboardList,
    CreditCard,
    DoorOpen,
    FileText,
    GraduationCap,
    LayoutGrid,
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
import { dashboard } from '@/routes';
import type { NavGroup, SharedData } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const userRoles = user?.roles || [];
    const isSuperAdmin = userRoles.includes('superadmin') || user?.user_type === 'superadmin';
    const isAdminAkademik = isSuperAdmin || userRoles.includes('admin_akademik');
    const isPanitiaPmb = isSuperAdmin || userRoles.includes('panitia_pmb');
    const isStafKeuangan = isSuperAdmin || userRoles.includes('staf_keuangan');
    const isStafKepegawaian = isSuperAdmin || userRoles.includes('staf_kepegawaian');
    const isOperatorKemahasiswaan = isSuperAdmin || userRoles.includes('operator_kemahasiswaan');
    const isDosen = isSuperAdmin || userRoles.includes('dosen') || userRoles.includes('kaprodi');
    const isMahasiswa = isSuperAdmin || userRoles.includes('mahasiswa');

    const navigationGroups: NavGroup[] = [
        {
            title: 'Utama',
            items: [
                {
                    title: 'Dashboard',
                    href: dashboard(),
                    icon: LayoutGrid,
                },
            ],
        },
    ];

    if (isAdminAkademik) {
        navigationGroups.push({
            title: 'Master Data',
            items: [
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
            ],
        });
    }

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
                {
                    title: 'Verifikasi Berkas',
                    href: '/pmb/verifikasi',
                    icon: UserCheck,
                },
            ],
        });
    }

    if (isStafKeuangan) {
        navigationGroups.push({
            title: 'Keuangan & Registrasi',
            items: [
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

    if (isMahasiswa || user?.user_type === 'calon_mahasiswa') {
        navigationGroups.push({
            title: 'Portal Mahasiswa',
            items: [
                {
                    title: 'Her-Registrasi Saya',
                    href: '/registrasi-ulang/saya',
                    icon: FileText,
                },
                {
                    title: 'Pembayaran UKT Saya',
                    href: '/keuangan/bayar',
                    icon: CreditCard,
                },
            ],
        });
    }


    if (isAdminAkademik || isDosen || isMahasiswa) {
        navigationGroups.push({
            title: 'Akademik',
            items: [
                {
                    title: 'Kurikulum',
                    href: '/akademik/kurikulum',
                    icon: BookOpenCheck,
                },
                {
                    title: 'Kelas Kuliah',
                    href: '/akademik/kelas-kuliah',
                    icon: Building2,
                },
                {
                    title: 'Perwalian & KRS',
                    href: '/akademik/krs',
                    icon: ClipboardList,
                },
                {
                    title: 'Presensi',
                    href: '/akademik/presensi',
                    icon: UserCheck,
                },
                {
                    title: 'Penilaian & KHS',
                    href: '/akademik/nilai',
                    icon: Award,
                },
            ],
        });
    }

    if (isAdminAkademik || isDosen || isMahasiswa) {
        navigationGroups.push({
            title: 'Tugas Akhir',
            items: [
                {
                    title: 'Proposal & Skripsi',
                    href: '/skripsi',
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

    if (isStafKepegawaian) {
        navigationGroups.push({
            title: 'Kepegawaian',
            items: [
                {
                    title: 'Data Dosen & Pegawai',
                    href: '/kepegawaian/pegawai',
                    icon: Users,
                },
            ],
        });
    }

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

    const isKaprodi = userRoles.includes('kaprodi');
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


    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-border-default bg-surface-card">
            <SidebarHeader className="border-b border-border-default px-4 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                            <a href={dashboard.url()}>

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
