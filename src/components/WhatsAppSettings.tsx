import { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';
import { MessageSquare, RefreshCw, CheckCircle2, AlertCircle, Smartphone, Send } from 'lucide-react';
import { toast } from 'sonner';

export function WhatsAppSettings() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [status, setStatus] = useState<'disconnected' | 'connected' | 'ready'>('disconnected');
    const [loading, setLoading] = useState(true);
    const [testMessageLoading, setTestMessageLoading] = useState(false);
    const [testPhone, setTestPhone] = useState('');

    const handleTestMessage = async () => {
        if (!testPhone) {
            toast.error('Insira um número para o teste.');
            return;
        }
        setTestMessageLoading(true);
        try {
            const response = await fetch(`${API_URL}/send-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: testPhone,
                    message: '🚀 Teste de conexão WhatsApp - Koda Admin funcional!'
                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Mensagem de teste enviada!');
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            toast.error(`Falha no teste: ${err.message}`);
        } finally {
            setTestMessageLoading(false);
        }
    };

    useEffect(() => {
        console.log('Attempting to connect to WhatsApp server at:', API_URL);
        const newSocket = io(API_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            timeout: 10000
        });

        newSocket.on('connect', () => {
            console.log('Connected to WhatsApp server successfully');
            setLoading(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('WhatsApp socket connection error:', err);
            setLoading(false);
        });

        newSocket.on('qr', (qr: string) => {
            console.log('New WhatsApp QR Code received');
            setQrCode(qr);
            setStatus('disconnected');
            setLoading(false);
        });

        newSocket.on('ready', () => {
            console.log('WhatsApp client is READY');
            setStatus('ready');
            setQrCode(null);
            setLoading(false);
        });

        newSocket.on('authenticated', () => {
            console.log('WhatsApp client is AUTHENTICATED');
            setStatus('connected');
            setQrCode(null);
            setLoading(false);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 bg-[#166534]/5 border-b border-[#166534]/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#166534] text-white rounded-lg">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Conexão WhatsApp</h3>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${status === 'ready' || status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                                {status === 'ready' || status === 'connected' ? 'Conectado' : 'Aguardando Login'}
                            </span>
                        </div>
                    </div>
                </div>
                {status !== 'ready' && (
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2 text-gray-400 hover:text-[#166534] transition-colors"
                        title="Recarregar QR Code"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-[#166534]" />
                            Como conectar?
                        </h4>
                        <ol className="space-y-4">
                            {[
                                'Abra o WhatsApp no seu telemóvel',
                                'Toque em Mais Opções (⋮) ou Configurações (⚙️)',
                                'Selecione "Aparelhos Conectados"',
                                'Toque em "Conectar um Aparelho"',
                                'Aponte a camera para o código ao lado'
                            ].map((step, i) => (
                                <li key={i} className="flex gap-3 text-sm text-gray-600">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs">
                                        {i + 1}
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Mantenha o telemóvel conectado à internet para garantir que os relatórios e alertas sejam enviados sem interrupções.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    {loading ? (
                        <div className="w-[280px] h-[280px] bg-gray-50 rounded-2xl flex flex-col items-center justify-center gap-4 border border-dashed border-gray-200">
                            <div className="w-10 h-10 border-4 border-[#166534]/20 border-t-[#166534] rounded-full animate-spin"></div>
                            <p className="text-sm text-gray-400 font-medium">Iniciando servidor...</p>
                        </div>
                    ) : status === 'ready' || status === 'connected' ? (
                        <div className="w-[280px] h-[280px] bg-green-50 rounded-2xl flex flex-col items-center justify-center gap-4 border border-green-100 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-green-800 text-lg">Pronto!</p>
                                <p className="text-xs text-green-600 font-medium px-4">O sistema está pronto para enviar notificações WhatsApp.</p>
                            </div>
                        </div>
                    ) : qrCode ? (
                        <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-500">
                            <div className="p-2 border-4 border-gray-50 rounded-xl">
                                <QRCodeSVG value={qrCode} size={220} />
                            </div>
                            <p className="text-center text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-widest">
                                Expira em breve...
                            </p>
                        </div>
                    ) : (
                        <div className="w-[280px] h-[280px] bg-gray-50 rounded-2xl flex flex-col items-center justify-center gap-4 border border-dashed border-gray-200">
                            <AlertCircle className="w-10 h-10 text-gray-300" />
                            <p className="text-sm text-gray-400 font-medium text-center px-6 italic">
                                Não foi possível obter o QR Code.<br />Certifique-se que o servidor está rodando.
                            </p>
                        </div>
                    )}
                </div>

                {/* Test Message Section */}
                {status === 'ready' || status === 'connected' ? (
                    <div className="mt-8 pt-8 border-t border-gray-100 w-full lg:col-span-2">
                        <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1">
                                <h4 className="font-bold text-green-900 mb-1 flex items-center gap-2">
                                    <Send className="w-4 h-4" />
                                    Testar Conexão
                                </h4>
                                <p className="text-xs text-green-700">
                                    Envie uma mensagem de teste para verificar se o envio está funcionando corretamente.
                                </p>
                            </div>
                            <div className="flex w-full md:w-auto gap-3">
                                <input
                                    type="text"
                                    placeholder="Número (ex: 25884...)"
                                    value={testPhone}
                                    onChange={(e) => setTestPhone(e.target.value)}
                                    className="px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm w-full md:w-48 bg-white"
                                />
                                <button
                                    onClick={handleTestMessage}
                                    disabled={testMessageLoading}
                                    className="bg-[#166534] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#14532d] transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                                >
                                    {testMessageLoading ? 'Enviando...' : 'Enviar Teste'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
