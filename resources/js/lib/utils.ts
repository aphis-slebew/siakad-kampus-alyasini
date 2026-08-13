import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Format ISO or YYYY-MM-DD date strings into Indonesian Human-Readable dates.
 * Example: '2026-08-10T00:00:00.000000Z' -> '10 Agustus 2026'
 * Example: with includeTime = true -> '10 Agustus 2026 14:30'
 */
export function formatDateIndonesian(dateString: string | null | undefined, includeTime: boolean = false): string {
    if (!dateString) return '-';

    try {
        const rawStr = String(dateString).trim();
        const dateOnlyStr = rawStr.includes('T') ? rawStr.split('T')[0] : rawStr;
        const parts = dateOnlyStr.split('-').map(Number);

        if (parts.length === 3 && !parts.some(isNaN)) {
            const [year, month, day] = parts;
            const date = new Date(year, month - 1, day);
            const options: Intl.DateTimeFormatOptions = {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
            };

            return new Intl.DateTimeFormat('id-ID', options).format(date);
        }

        const fallbackDate = new Date(rawStr);
        if (isNaN(fallbackDate.getTime())) return dateString;

        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(fallbackDate);
    } catch {
        return dateString;
    }
}
