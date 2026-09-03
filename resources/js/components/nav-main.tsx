import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavGroup, NavItem } from '@/types';

export function NavMain({ groups = [] }: { groups?: NavGroup[]; items?: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    if (!groups.length) {
        return null;
    }

    return (
        <div className="space-y-3 font-sans">
            {groups.map((group) => (
                <SidebarGroup key={group.title} className="px-2 py-0.5">
                    <SidebarGroupLabel className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-2.5 mb-1.5 flex items-center gap-1.5">
                        <span className="size-1 rounded-full bg-brand-primary/60" />
                        <span>{group.title}</span>
                    </SidebarGroupLabel>
                    <SidebarMenu className="space-y-0.5">
                        {group.items.map((item) => {
                            const active = isCurrentUrl(item.href);

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={active}
                                        tooltip={{ children: item.title }}
                                        className={`w-full text-xs sm:text-sm font-medium rounded-lg px-2.5 py-2 transition-all duration-150 flex items-center gap-2.5 ${
                                            active
                                                ? 'bg-brand-primary text-white shadow-xs font-semibold hover:bg-brand-primary hover:text-white'
                                                : 'text-text-primary hover:bg-emerald-50/80 hover:text-brand-primary hover:translate-x-0.5'
                                        }`}
                                    >
                                        <Link href={item.href} prefetch="hover">
                                            {item.icon && (
                                                <item.icon
                                                    className={`size-4 shrink-0 transition-colors ${
                                                        active ? 'text-white' : 'text-text-secondary group-hover:text-brand-primary'
                                                    }`}
                                                />
                                            )}
                                            <span className="truncate">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </div>
    );
}
