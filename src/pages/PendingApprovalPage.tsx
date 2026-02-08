import { useAuth } from '../hooks/useAuth';
import { LogOut, Clock, ShieldAlert } from 'lucide-react';

export default function PendingApprovalPage() {
    const { signOut, profile } = useAuth();

    return (
        <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    {profile?.status === 'rejected' ? (
                        <ShieldAlert className="w-10 h-10 text-red-600" />
                    ) : (
                        <Clock className="w-10 h-10 text-amber-600 animate-pulse" />
                    )}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {profile?.status === 'rejected' ? 'Conta Rejeitada' : 'Aguardando Aprovação'}
                </h1>

                <p className="text-gray-600 mb-8 leading-relaxed text-sm sm:text-base">
                    {profile?.status === 'rejected'
                        ? 'Lamentamos, mas seu cadastro não foi aprovado pela administração neste momento.'
                        : `Olá ${profile?.full_name || 'Usuário'}, seu cadastro foi recebido e está sob análise. Você receberá um e-mail assim que sua conta for ativada.`}
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-[#1B3A2D] text-white py-3.5 rounded-xl font-bold hover:bg-[#2D6A4F] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
                    >
                        Verificar Status Novamente
                    </button>

                    <button
                        onClick={() => signOut()}
                        className="w-full bg-transparent text-gray-500 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 border border-dashed border-gray-300"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair da Conta
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 italic text-xs text-gray-400">
                    Koda Microcrédito &copy; {new Date().getFullYear()}
                </div>
            </div>
        </div>
    );
}
