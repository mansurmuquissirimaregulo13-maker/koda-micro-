import { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';

export function WhatsAppSettings() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [status, setStatus] = useState<'disconnected' | 'connected' | 'ready'>('disconnected');

    useEffect(() => {
        const newSocket = io(API_URL);

        newSocket.on('connect', () => {
            console.log('Connected to WhatsApp server');
        });

        newSocket.on('qr', (qr: string) => {
            setQrCode(qr);
            setStatus('disconnected');
        });

        newSocket.on('ready', () => {
            setStatus('connected');
            setQrCode(null);
        });

        newSocket.on('authenticated', () => {
            setStatus('connected');
            setQrCode(null);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-[#1B1B1B] mb-4">Conexão WhatsApp</h2>

            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                {status === 'connected' ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="font-medium text-green-800">WhatsApp Conectado!</p>
                        <p className="text-sm text-gray-500 mt-1">O sistema está pronto para enviar notificações.</p>
                    </div>
                ) : (
                    <div className="text-center">
                        {qrCode ? (
                            <div className="bg-white p-4 rounded shadow-sm inline-block border-2 border-gray-100">
                                <QRCodeSVG value={qrCode} size={256} className="mx-auto" />
                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    Abra o WhatsApp &gt; Aparelhos Conectados &gt; Conectar Aparelho
                                </p>
                            </div>
                        ) : (
                            <div className="animate-pulse text-gray-400">
                                <p>Aguardando QR Code do servidor...</p>
                                <p className="text-xs mt-2">Certifique-se que "node server/index.js" está rodando.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
