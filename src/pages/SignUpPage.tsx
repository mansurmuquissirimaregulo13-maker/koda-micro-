import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Mail, Lock, UserPlus, Building2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export function SignUpPage() {
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [accountType, setAccountType] = useState<'microcredit' | 'savings'>('microcredit');
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validations
        if (!fullName.trim()) {
            setError('Por favor, insira seu nome completo.');
            return;
        }

        if (!companyName.trim()) {
            setError('Por favor, insira o nome da sua empresa de microcrédito.');
            return;
        }

        if (!email.trim()) {
            setError('Por favor, insira seu email.');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);

        try {
            const toastId = toast.loading('Criando sua conta...');
            await signUp(email, password, fullName, companyName, accountType);
            toast.success('🎉 Conta criada com sucesso!', { id: toastId });
            navigate('/pending-approval');
        } catch (err: any) {
            console.error('Detailed SignUp catch:', err);
            if (err.message.includes('rate limit') || err.message.includes('taxa') || err.message.toLowerCase().includes('enviar') || err.message.toLowerCase().includes('mail') || err.message.includes('confirmação')) {
                toast.success('🎉 Conta criada com sucesso!');
                toast.info('Aguardando aprovação do administrador.');
                setTimeout(() => navigate('/pending-approval'), 3000);
            } else if (err.message.includes('User already registered') || err.message.includes('already registered')) {
                setError('Este email já está cadastrado. Tente fazer login.');
            } else {
                console.error('SignUp Error:', err);
                setError(err.message || 'Erro ao criar conta. Verifique os dados e tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-[#F7F7F2] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 relative z-10 transition-all">
                <div className="bg-gradient-to-r from-[#1B3A2D] to-[#2D6A4F] p-8 text-center rounded-t-2xl">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white font-montserrat">
                        Criar Conta
                    </h1>
                    <p className="text-green-100 text-sm mt-2">
                        Junte-se à Koda {accountType === 'microcredit' ? 'Microcrédito' : 'Poupança'}
                    </p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Nome Completo
                            </label>
                            <div className="relative">
                                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none appearance-none text-base bg-white"
                                    style={{ fontSize: '16px' }}
                                    placeholder="Seu nome completo"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">
                                Tipo de Sistema (Módulo)
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAccountType('microcredit')}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${accountType === 'microcredit'
                                        ? 'border-[#1B3A2D] bg-[#1B3A2D]/5 ring-1 ring-[#1B3A2D]'
                                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                        }`}>
                                    <CreditCard className={`w-6 h-6 ${accountType === 'microcredit' ? 'text-[#1B3A2D]' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-bold ${accountType === 'microcredit' ? 'text-[#1B3A2D]' : 'text-gray-500'}`}>Microcrédito</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAccountType('savings')}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${accountType === 'savings'
                                        ? 'border-[#40916C] bg-[#40916C]/5 ring-1 ring-[#40916C]'
                                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                        }`}>
                                    <Building2 className={`w-6 h-6 ${accountType === 'savings' ? 'text-[#40916C]' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-bold ${accountType === 'savings' ? 'text-[#40916C]' : 'text-gray-500'}`}>Poupança</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Nome da Empresa / Instituição
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none appearance-none text-base bg-white"
                                    style={{ fontSize: '16px' }}
                                    placeholder={accountType === 'microcredit' ? 'Ex: Koda Microfinanças' : 'Ex: Grupo de Poupança'}
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none appearance-none text-base bg-white"
                                    style={{ fontSize: '16px' }}
                                    placeholder="seu-email@exemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none appearance-none text-base bg-white"
                                    style={{ fontSize: '16px' }}
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Confirmar Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none appearance-none text-base bg-white"
                                    style={{ fontSize: '16px' }}
                                    placeholder="Digite a senha novamente"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-[#1B3A2D] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#2D6A4F] active:bg-[#12261d] transition-all transform active:scale-[0.98] shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed relative z-50 touch-manipulation flex items-center justify-center min-h-[60px] cursor-pointer`}
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Criando conta...</span>
                                </div>
                            ) : (
                                <span>Criar Conta</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Já tem uma conta?{' '}
                            <Link
                                to="/login"
                                className="text-[#40916C] font-medium hover:text-[#2D6A4F] transition-colors"
                            >
                                Entrar
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            to="/"
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            ← Voltar para página inicial
                        </Link>
                    </div>

                    <div className="mt-6 text-center text-xs text-gray-400">
                        <p>&copy; 2026 Koda Microcrédito. Todos os direitos reservados.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
