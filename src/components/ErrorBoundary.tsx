import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#F7F7F2] flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h1>
                        <p className="text-gray-600 mb-8">
                            O sistema encontrou um erro inesperado. Isso pode ser causado por extensões de tradução ou instabilidade momentânea.
                        </p>

                        <button
                            onClick={this.handleReload}
                            className="w-full bg-[#1B3A2D] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#2D6A4F] transition-all active:scale-[0.98]"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Recarregar Sistema
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
