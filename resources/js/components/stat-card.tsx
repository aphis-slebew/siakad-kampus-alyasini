import type { LucideIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export type StatCardVariant = 'default' | 'primary' | 'success' | 'warning' | 'info';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    value: React.ReactNode;
    subtext?: React.ReactNode;
    icon?: LucideIcon | React.ComponentType<{ className?: string }>;
    variant?: StatCardVariant;
    className?: string;
}

const variantStyles: Record<StatCardVariant, { card: string; iconBg: string; iconColor: string }> = {
    default: {
        card: 'border-border-default bg-surface-card text-text-primary',
        iconBg: 'bg-muted text-text-secondary',
        iconColor: 'text-text-secondary',
    },
    primary: {
        card: 'border-brand-primary/20 bg-surface-card text-text-primary',
        iconBg: 'bg-brand-primary/10 text-brand-primary',
        iconColor: 'text-brand-primary',
    },
    success: {
        card: 'border-emerald-200 bg-surface-card text-text-primary dark:border-emerald-800',
        iconBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
        iconColor: 'text-emerald-700 dark:text-emerald-300',
    },
    warning: {
        card: 'border-amber-200 bg-surface-card text-text-primary dark:border-amber-800',
        iconBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
        iconColor: 'text-amber-700 dark:text-amber-300',
    },
    info: {
        card: 'border-blue-200 bg-surface-card text-text-primary dark:border-blue-800',
        iconBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
        iconColor: 'text-blue-700 dark:text-blue-300',
    },
};

export function StatCard({
    title,
    value,
    subtext,
    icon: Icon,
    variant = 'default',
    className,
    ...props
}: StatCardProps) {
    const config = variantStyles[variant];

    return (
        <div
            className={cn(
                'rounded-xl border p-4 sm:p-5 shadow-xs transition-shadow duration-150 flex flex-col justify-between',
                config.card,
                className
            )}
            {...props}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block truncate">
                        {title}
                    </span>
                    <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-text-primary">
                        {value}
                    </div>
                </div>

                {Icon && (
                    <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', config.iconBg)}>
                        <Icon className={cn('size-5', config.iconColor)} />
                    </div>
                )}
            </div>

            {subtext && (
                <div className="mt-3 text-xs text-text-secondary border-t border-border-default/60 pt-2 flex items-center gap-1.5">
                    {subtext}
                </div>
            )}
        </div>
    );
}

export default StatCard;
