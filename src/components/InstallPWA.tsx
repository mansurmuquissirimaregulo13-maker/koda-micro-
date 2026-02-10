import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Detect iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (isIOS && !isStandalone) {
            // Show iOS instructions after a short delay
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt after a short delay to ensure visibility
            setTimeout(() => setIsVisible(true), 1500);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt && !/iPad|iPhone|iPod/.test(navigator.userAgent)) return;

        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            setShowIOSInstructions(true);
            return;
        }

        isVisible && setIsVisible(false);
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        } else {
            setIsVisible(true);
        }
    };

    if (!isVisible && !showIOSInstructions) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-[100] p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden ring-1 ring-black/5">
                <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-[#1B3A2D] rounded-xl flex items-center justify-center shadow-lg shadow-green-900/20">
                                    <Download className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Instalar Koda</h3>
                                    <p className="text-xs text-gray-500">Acesse o sistema mais rápido e offline</p>
                                </div>
                            </div>

                            {!showIOSInstructions ? (
                                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                    Adicione o Koda à sua tela de início para uma experiência completa de aplicativo.
                                </p>
                            ) : (
                                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3 border border-gray-100 italic">
                                    <p className="text-sm text-gray-700 flex items-center gap-2">
                                        1. Toque no botão <Share className="w-4 h-4 text-blue-500" /> (Compartilhar)
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        2. Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleInstall}
                                    className="flex-1 bg-[#1B3A2D] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#2D6A4F] transition-all active:scale-95 shadow-lg shadow-green-900/10"
                                >
                                    {showIOSInstructions ? 'Entendido' : 'Instalar Agora'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsVisible(false);
                                        setShowIOSInstructions(false);
                                    }}
                                    className="p-3 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
