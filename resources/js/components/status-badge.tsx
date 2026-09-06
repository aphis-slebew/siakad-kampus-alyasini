import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Clock, Info, MinusCircle, XCircle } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: StatusBadgeVariant;
    label: React.ReactNode;
    icon?: LucideIcon | React.ComponentType<{ className?: string }> | false;
    size?: 'sm' | 'md';
    className?: string;
}

const defaultIcons: Record<StatusBadgeVariant, LucideIcon> = {
    success: CheckCircle2,
    warning: Clock,
    danger: XCircle,
    info: Info,
    neutral: MinusCircle,
};

const variantStyles: Record<StatusBadgeVariant, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800',
};

export function StatusBadge({
    variant = 'neutral',
    label,
    icon,
    size = 'sm',
    className,
    ...props
}: StatusBadgeProps) {
    // Resolve icon: explicit false disables icon; otherwise use custom icon or default semantic icon
    const ResolvedIcon = icon === false ? null : (icon || defaultIcons[variant]);

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-normal transition-colors select-none',
                size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
                variantStyles[variant],
                className
            )}
            {...props}
        >
            {ResolvedIcon && <ResolvedIcon className={cn(size === 'sm' ? 'size-3 shrink-0' : 'size-3.5 shrink-0')} />}
            <span>{label}</span>
        </span>
    );
}

export default StatusBadge;
