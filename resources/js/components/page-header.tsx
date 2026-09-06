import type { LucideIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
    title: React.ReactNode;
    description?: React.ReactNode;
    icon?: LucideIcon | React.ComponentType<{ className?: string }>;
    actions?: React.ReactNode;
    children?: React.ReactNode;
    bordered?: boolean;
    size?: 'default' | 'sm';
    className?: string;
}

export function PageHeader({
    title,
    description,
    icon: Icon,
    actions,
    children,
    bordered = false,
    size = 'default',
    className,
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-3.5',
                bordered && 'pb-4 sm:pb-5 border-b border-border-default',
                className
            )}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                    {Icon && (
                        <div
                            className={cn(
                                'flex shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20',
                                size === 'sm' ? 'size-9' : 'size-9 sm:size-10'
                            )}
                        >
                            <Icon className={cn(size === 'sm' ? 'size-4.5' : 'size-4.5 sm:size-5')} />
                        </div>
                    )}
                    <div className="min-w-0 space-y-0.5">
                        <h1
                            className={cn(
                                'font-bold tracking-tight text-text-primary break-words',
                                size === 'sm' ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
                            )}
                        >
                            {title}
                        </h1>
                        {description && (
                            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {actions && (
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0 w-full sm:w-auto">
                        {actions}
                    </div>
                )}
            </div>

            {children && <div className="mt-0.5">{children}</div>}
        </div>
    );
}

export default PageHeader;
