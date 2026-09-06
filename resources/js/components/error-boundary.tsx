import { AlertTriangle, RefreshCw } from 'lucide-react';
import React, { Component   } from 'react';
import type {ErrorInfo, ReactNode} from 'react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center space-y-4">
                        <div className="size-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                            <AlertTriangle className="size-7" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Kendala Sinkronisasi Tampilan</h2>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Halaman mengalami gangguan saat memperbarui tampilan (umumnya dipicu oleh fitur terjemahan otomatis peramban atau ekstensi pihak ketiga). Silakan muat ulang halaman.
                            </p>
                        </div>
                        <Button
                            onClick={this.handleReload}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-2.5 rounded-lg text-xs font-semibold shadow-xs transition"
                        >
                            <RefreshCw className="size-4 mr-2" />
                            Muat Ulang Halaman
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
