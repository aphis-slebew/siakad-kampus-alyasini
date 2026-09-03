import { createInertiaApp } from '@inertiajs/react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

// Protect React DOM reconciliation against browser extensions & Google Translate
if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
        if (child && child.parentNode !== this) {
            if (console) {
                console.warn('Cannot remove child: not a child of this node.', this, child);
            }
            return child;
        }
        return originalRemoveChild.apply(this, [child]) as T;
    };

    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
        if (referenceNode && referenceNode.parentNode !== this) {
            if (console) {
                console.warn('Cannot insert before: reference node not a child of this node.', this, referenceNode);
            }
            return newNode;
        }
        return originalInsertBefore.apply(this, [newNode, referenceNode]) as T;
    };
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome' || name.startsWith('dokumen/') || name === 'yudisium/sertifikat' || name.startsWith('pmb/public/'):
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/') && name !== 'settings/system-configs':
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <ErrorBoundary>
                <TooltipProvider delayDuration={0}>
                    {app}
                    <Toaster />
                </TooltipProvider>
            </ErrorBoundary>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
