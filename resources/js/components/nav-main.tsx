import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavGroup, NavItem } from '@/types';

export function NavMain({ groups = [] }: { groups?: NavGroup[]; items?: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    if (!groups.length) {
        return null;
    }

    return (
        <div className="space-y-4 font-sans">
            {groups.map((group) => (
                <SidebarGroup key={group.title} className="px-2 py-0.5">
                    <SidebarGroupLabel className="text-[11px] font-bold text-slate-700 uppercase tracking-wider px-2.5 mb-1.5 flex items-center gap-2 select-none">
                        <span className="size-1.5 rounded-full bg-brand-primary shrink-0" />
                        <span className="truncate">{group.title}</span>
                    </SidebarGroupLabel>
                    <SidebarMenu className="space-y-1">
                        {group.items.map((item) => {
                            const hasSubItems = Boolean(item.items && item.items.length > 0);
                            const active = item.href ? isCurrentUrl(item.href) : false;
                            const isChildActive = hasSubItems
                                ? item.items?.some((sub) => sub.href && isCurrentUrl(sub.href)) ?? false
                                : false;

                            if (hasSubItems) {
                                return (
                                    <Collapsible
                                        key={item.title}
                                        asChild
                                        defaultOpen={active || isChildActive}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    tooltip={{ children: item.title }}
                                                    className={`w-full text-xs sm:text-sm font-medium rounded-lg px-2.5 py-2 transition-all duration-150 flex items-center justify-between gap-2.5 cursor-pointer ${
                                                        active || isChildActive
                                                            ? 'bg-emerald-50 text-brand-primary-dark font-semibold ring-1 ring-emerald-200/80'
                                                            : 'text-slate-800 hover:bg-emerald-50 hover:text-brand-primary-dark active:bg-emerald-100'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5 truncate">
                                                        {item.icon && (
                                                            <item.icon
                                                                className={`size-4 shrink-0 transition-colors ${
                                                                    active || isChildActive
                                                                        ? 'text-brand-primary'
                                                                        : 'text-slate-700 group-hover:text-brand-primary-dark'
                                                                }`}
                                                            />
                                                        )}
                                                        <span className="truncate">{item.title}</span>
                                                    </div>
                                                    <ChevronRight className="size-4 shrink-0 text-slate-500 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub className="border-l-2 border-slate-200 ml-4.5 pl-3 py-1 space-y-1 my-1">
                                                    {item.items?.map((subItem) => {
                                                        const isSubActive = subItem.href ? isCurrentUrl(subItem.href) : false;

                                                        return (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton
                                                                    asChild
                                                                    isActive={isSubActive}
                                                                    className={`w-full text-xs sm:text-sm py-1.5 px-2.5 rounded-md transition-colors ${
                                                                        isSubActive
                                                                            ? 'bg-emerald-100 text-brand-primary-dark font-semibold border-l-2 border-brand-primary -ml-[14px] pl-[12px] shadow-xs'
                                                                            : 'text-slate-700 hover:text-brand-primary-dark hover:bg-emerald-50 active:bg-emerald-100 font-medium'
                                                                    }`}
                                                                >
                                                                    <Link href={subItem.href || '#'} prefetch="hover">
                                                                        {subItem.icon && (
                                                                            <subItem.icon
                                                                                className={`size-3.5 shrink-0 transition-colors ${
                                                                                    isSubActive
                                                                                        ? 'text-brand-primary'
                                                                                        : 'text-slate-600 group-hover:text-brand-primary-dark'
                                                                                }`}
                                                                            />
                                                                        )}
                                                                        <span className="truncate">{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        );
                                                    })}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                );
                            }

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={active}
                                        tooltip={{ children: item.title }}
                                        className={`w-full text-xs sm:text-sm font-medium rounded-lg px-2.5 py-2 transition-all duration-150 flex items-center gap-2.5 relative overflow-hidden ${
                                            active
                                                ? 'bg-brand-primary text-white shadow-sm font-semibold hover:bg-brand-primary-dark hover:text-white ring-1 ring-brand-primary-dark/20 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1.5 before:rounded-r-full before:bg-brand-accent'
                                                : 'text-slate-800 hover:bg-emerald-50 hover:text-brand-primary-dark active:bg-emerald-100 hover:translate-x-0.5'
                                        }`}
                                    >
                                        <Link href={item.href || '#'} prefetch="hover">
                                            {item.icon && (
                                                <item.icon
                                                    className={`size-4 shrink-0 transition-colors ${
                                                        active
                                                            ? 'text-white'
                                                            : 'text-slate-700 group-hover:text-brand-primary-dark'
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
