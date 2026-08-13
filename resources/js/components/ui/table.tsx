import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Centralized Responsive Data Table Component for SIAKAD Al-Yasini.
 * Enforces stacked cell layouts for primary/secondary identity info,
 * 100% viewport width alignment, and clean scroll containers on small screens.
 */

export function ResponsiveTable({
    children,
    className,
    containerClassName,
}: {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
}) {
    return (
        <div className={cn("w-full overflow-x-auto rounded-md border bg-card text-card-foreground shadow-sm", containerClassName)}>
            <table className={cn("w-full text-left text-sm", className)}>
                {children}
            </table>
        </div>
    );
}

export function TableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <thead className={cn("border-b bg-muted/60 text-xs font-semibold uppercase text-muted-foreground tracking-wider", className)}>
            {children}
        </thead>
    );
}

export function TableBody({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <tbody className={cn("divide-y divide-border", className)}>
            {children}
        </tbody>
    );
}

export function TableRow({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
    return (
        <tr className={cn("hover:bg-muted/30 transition-colors duration-150", className)} {...props}>
            {children}
        </tr>
    );
}


export function TableHead({
    children,
    className,
    align = 'left',
}: {
    children: React.ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right';
}) {
    return (
        <th className={cn(
            "p-3.5 font-semibold",
            align === 'center' && "text-center",
            align === 'right' && "text-right",
            className
        )}>
            {children}
        </th>
    );
}

export function TableCell({
    children,
    className,
    align = 'left',
    colSpan,
}: {
    children: React.ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right';
    colSpan?: number;
}) {
    return (
        <td
            colSpan={colSpan}
            className={cn(
                "p-3.5 align-middle",
                align === 'center' && "text-center",
                align === 'right' && "text-right",
                className
            )}
        >
            {children}
        </td>
    );
}


/**
 * Stacked Identity Cell helper for combining Primary (Name/Title) and Secondary (NIM/Code/Details) info
 */
export function StackedCell({
    primary,
    secondary,
    tertiary,
    className,
}: {
    primary: React.ReactNode;
    secondary?: React.ReactNode;
    tertiary?: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("space-y-0.5", className)}>
            <div className="font-semibold text-foreground">{primary}</div>
            {secondary && <div className="text-xs text-muted-foreground font-mono">{secondary}</div>}
            {tertiary && <div className="text-xs text-muted-foreground/80 italic">{tertiary}</div>}
        </div>
    );
}
