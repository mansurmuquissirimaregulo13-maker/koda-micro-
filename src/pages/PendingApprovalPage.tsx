import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function PendingApprovalPage() {
    const { signOut, profile } = useAuth();

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-[#2D6A4F]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-[#40916C]/5 rounded-full blur-3xl" />

            <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl shadow-green-900/5 border border-gray-100 overflow-hidden relative z-10">
                <div className="bg-gradient-to-br from-[#1B3A2D] via-[#2D6A4F] to-[#40916C] p-10 text-center relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 0 L100 100 M100 0 L0 100" stroke="currentColor" strokeWidth="0.1" fill="none" />
                        </svg>
                    </div>
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-white/20 animate-pulse">
                        <Clock className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white font-montserrat tracking-tight">
                        Análise de Cadastro
                    </h1>
                    <p className="text-green-100/80 text-sm mt-3 font-medium uppercase tracking-widest">
                        Protocolo em processamento
                    </p>
                </div>

                <div className="p-10 text-center space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Olá, <span className="text-[#2D6A4F]">{profile?.full_name || 'Usuário'}</span>
                        </h2>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            Recebemos seus dados com sucesso. Sua conta está agora sob revisão oficial da nossa equipe administrativa.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50/50 border border-green-100 rounded-2xl p-5 text-left">
                            <h3 className="text-xs font-black text-[#2D6A4F] uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#2D6A4F] rounded-full" />
                                Próxima Etapa
                            </h3>
                            <p className="text-sm text-gray-700 font-medium">
                                Revisão de conformidade e liberação de credenciais operacionais.
                            </p>
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 text-left">
                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                Notificação
                            </h3>
                            <p className="text-sm text-gray-700 font-medium">
                                Você será notificado por e-mail assim que sua aprovação for concluída.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 pt-4">
                        <div className="flex items-center gap-3 bg-gray-50 px-6 py-2.5 rounded-full border border-gray-100">
                            <Mail className="w-4 h-4 text-[#2D6A4F]" />
                            <span className="text-sm font-bold text-gray-700">{profile?.email}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">
                            Este é o e-mail onde você receberá o status da aprovação.
                        </p>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex flex-col gap-4">
                        <button
                            onClick={handleLogout}
                            className="w-full px-8 py-4 bg-[#1B3A2D] text-white rounded-2xl font-bold hover:bg-[#2D6A4F] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-900/10"
                        >
                            Finalizar Sessão de Espera
                        </button>

                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar para o Início
                        </Link>
                    </div>

                    <div className="mt-8 text-center bg-gray-50/50 rounded-xl p-4 border border-dashed border-gray-200">
                        <p className="text-sm text-gray-500 font-medium">
                            Suporte prioritário: {' '}
                            <a
                                href="mailto:mansurmuquissirimaregulo13@gmail.com"
                                className="text-[#40916C] hover:underline font-bold"
                            >
                                mansurmuquissirimaregulo13@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                Koda Admin • © 2024
            </div>
        </div>
    );
}
