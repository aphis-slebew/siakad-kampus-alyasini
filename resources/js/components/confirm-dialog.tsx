import type {
    LucideIcon} from 'lucide-react';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Info,
    Trash2,
    ShieldCheck
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export type ConfirmVariant = 'destructive' | 'primary' | 'warning' | 'info';

export interface ConfirmDialogOptions {
    title: string;
    description: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmVariant;
    icon?: LucideIcon;
    isAlert?: boolean;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    variant = 'primary',
    icon,
    isAlert = false,
    onConfirm,
    onCancel,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmVariant;
    icon?: LucideIcon;
    isAlert?: boolean;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
}) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        if (!onConfirm) {
            onOpenChange(false);

            return;
        }

        try {
            setIsLoading(true);
            await onConfirm();
            onOpenChange(false);
        } catch {
            // Error handling can be managed by caller
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        onCancel?.();
        onOpenChange(false);
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'destructive':
                return {
                    iconBg: 'bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
                    defaultIcon: Trash2,
                    confirmVariant: 'destructive' as const,
                };
            case 'warning':
                return {
                    iconBg: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
                    defaultIcon: AlertTriangle,
                    confirmVariant: 'default' as const,
                };
            case 'info':
                return {
                    iconBg: 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900',
                    defaultIcon: Info,
                    confirmVariant: 'default' as const,
                };
            case 'primary':
            default:
                return {
                    iconBg: 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
                    defaultIcon: CheckCircle2,
                    confirmVariant: 'default' as const,
                };
        }
    };

    const { iconBg, defaultIcon: DefaultIcon, confirmVariant } = getVariantStyles();
    const IconComponent = icon || DefaultIcon;

    return (
        <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
            <DialogContent className="max-w-md p-6 sm:max-w-[440px] rounded-2xl">
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left gap-4">
                    <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg} shadow-xs`}>
                        <IconComponent className="size-6" />
                    </div>
                    <DialogHeader className="gap-1.5 p-0">
                        <DialogTitle className="text-lg font-bold text-text-primary">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-text-secondary leading-relaxed">
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-2">
                    {!isAlert && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isLoading}
                            onClick={handleCancel}
                            className="text-xs font-medium h-9 w-full sm:w-auto"
                        >
                            {cancelText}
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant={confirmVariant}
                        size="sm"
                        disabled={isLoading}
                        onClick={handleConfirm}
                        className={`text-xs font-semibold h-9 w-full sm:w-auto ${variant === 'primary' ? 'bg-brand-primary hover:bg-brand-primary/90 text-white' : ''}`}
                    >
                        {isLoading ? 'Memproses...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function useConfirmDialog() {
    const [dialogState, setDialogState] = useState<ConfirmDialogOptions & { open: boolean }>({
        open: false,
        title: '',
        description: '',
    });

    const confirm = useCallback((options: ConfirmDialogOptions) => {
        setDialogState({
            open: true,
            confirmText: 'Ya, Lanjutkan',
            cancelText: 'Batal',
            variant: 'primary',
            isAlert: false,
            ...options,
        });
    }, []);

    const showAlert = useCallback((options: Omit<ConfirmDialogOptions, 'cancelText'>) => {
        setDialogState({
            open: true,
            confirmText: 'Mengerti',
            variant: 'info',
            isAlert: true,
            ...options,
        });
    }, []);

    const handleOpenChange = useCallback((open: boolean) => {
        setDialogState((prev) => ({ ...prev, open }));
    }, []);

    const confirmDialog = (
        <ConfirmDialog
            open={dialogState.open}
            onOpenChange={handleOpenChange}
            title={dialogState.title}
            description={dialogState.description}
            confirmText={dialogState.confirmText}
            cancelText={dialogState.cancelText}
            variant={dialogState.variant}
            icon={dialogState.icon}
            isAlert={dialogState.isAlert}
            onConfirm={dialogState.onConfirm}
            onCancel={dialogState.onCancel}
        />
    );

    return {
        confirm,
        showAlert,
        confirmDialog,
    };
}
