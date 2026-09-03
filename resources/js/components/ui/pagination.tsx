import * as React from 'react';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginationProps = {
    links?: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total?: number;
    itemName?: string;
    preserveState?: boolean;
    preserveScroll?: boolean;
    onPageChange?: (url: string) => void;
    className?: string;
};

/**
 * Format label safely without dangerouslySetInnerHTML to prevent XSS.
 */
function renderPaginationLabel(label: string) {
    const clean = label.replace(/&laquo;/g, '').replace(/&raquo;/g, '').trim();

    if (label.includes('&laquo;') || clean.toLowerCase() === 'previous') {
        return (
            <span className="inline-flex items-center gap-1">
                <ChevronLeft className="size-3.5" />
                <span className="hidden sm:inline">Sebelumnya</span>
            </span>
        );
    }

    if (label.includes('&raquo;') || clean.toLowerCase() === 'next') {
        return (
            <span className="inline-flex items-center gap-1">
                <span className="hidden sm:inline">Selanjutnya</span>
                <ChevronRight className="size-3.5" />
            </span>
        );
    }

    if (label === '...' || label.includes('&hellip;')) {
        return <MoreHorizontal className="size-3.5 text-muted-foreground" />;
    }

    return clean;
}

export function Pagination({
    links,
    from,
    to,
    total,
    itemName = 'data',
    preserveState = true,
    preserveScroll = true,
    onPageChange,
    className,
}: PaginationProps) {
    if (!links || links.length <= 1) {
        return null;
    }

    const handleClick = (url: string | null) => {
        if (!url) return;
        if (onPageChange) {
            onPageChange(url);
        } else {
            router.get(url, {}, { preserveState, preserveScroll });
        }
    };

    return (
        <nav
            role="navigation"
            aria-label="Paginasi Navigasi"
            className={cn('flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs', className)}
        >
            {total !== undefined && (
                <div className="text-text-secondary text-xs">
                    Menampilkan <span className="font-medium text-text-primary">{from || 0}</span> -{' '}
                    <span className="font-medium text-text-primary">{to || 0}</span> dari{' '}
                    <span className="font-medium text-text-primary">{total}</span> {itemName}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-1">
                {links.map((link, idx) => {
                    const isDisabled = !link.url || link.active;
                    const isEllipsis = link.label === '...' || link.label.includes('&hellip;');

                    if (isEllipsis) {
                        return (
                            <span
                                key={`ellipsis-${idx}`}
                                className="flex h-8 min-w-8 items-center justify-center px-2 text-xs text-muted-foreground"
                            >
                                <MoreHorizontal className="size-3.5" />
                            </span>
                        );
                    }

                    return (
                        <button
                            key={`page-link-${idx}`}
                            type="button"
                            disabled={isDisabled}
                            aria-current={link.active ? 'page' : undefined}
                            onClick={() => handleClick(link.url)}
                            className={cn(
                                'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                                link.active
                                    ? 'bg-brand-primary text-white border-brand-primary font-semibold shadow-xs'
                                    : link.url
                                    ? 'border-border-default bg-surface-card text-text-primary hover:bg-surface-hover hover:text-brand-primary active:bg-surface-base'
                                    : 'border-border-default/50 text-text-secondary/50 cursor-not-allowed opacity-60'
                            )}
                        >
                            {renderPaginationLabel(link.label)}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
