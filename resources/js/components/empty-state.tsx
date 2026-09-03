import type { LucideIcon} from 'lucide-react';
import { Inbox } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export type EmptyStateProps = {
    icon?: LucideIcon | React.ComponentType<{ className?: string }>;
    title: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
};

export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action,
    children,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center p-8 sm:p-12 text-center select-none', className)}>
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground mb-3 ring-1 ring-border/50">
                <Icon className="size-6 text-muted-foreground/80" />
            </div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
            {description && (
                <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">
                    {description}
                </p>
            )}
            {action && <div className="mt-4 flex items-center justify-center gap-2">{action}</div>}
            {children && <div className="mt-4">{children}</div>}
        </div>
    );
}
