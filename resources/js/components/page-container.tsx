import * as React from 'react';
import { cn } from '@/lib/utils';

export type PageContainerVariant = 'default' | 'wide' | 'full';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: PageContainerVariant;
    className?: string;
}

const variantStyles: Record<PageContainerVariant, string> = {
    default: 'max-w-7xl mx-auto p-4 sm:p-6 space-y-5 w-full',
    wide: 'max-w-[1536px] mx-auto p-4 sm:p-6 space-y-5 w-full',
    full: 'w-full p-4 sm:p-6 space-y-5',
};

export function PageContainer({
    children,
    variant = 'default',
    className,
    ...props
}: PageContainerProps) {
    return (
        <div
            className={cn('font-sans', variantStyles[variant], className)}
            {...props}
        >
            {children}
        </div>
    );
}

export default PageContainer;
