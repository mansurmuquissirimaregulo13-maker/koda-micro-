import React, { ErrorInfo } from 'react';

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null, info: string }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null, info: '' };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error, info: '' };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ info: errorInfo.componentStack || '' });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', background: '#fee', color: '#c00', fontFamily: 'sans-serif' }}>
                    <h2>Algo correu mal inesperadamente na renderização desta página (Erro Localizado)</h2>
                    <p>Tire print a esta tela ou envie este erro para facilitar a correção técnica!</p>
                    <hr />
                    <h3>Erro:</h3>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#fff', padding: '10px', border: '1px solid #ccc' }}>
                        {this.state.error ? this.state.error.toString() : 'Erro Desconhecido'}
                    </pre>
                    <h3>Stack Trace:</h3>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12px', background: '#fff', padding: '10px', border: '1px solid #ccc' }}>
                        {this.state.info}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}
