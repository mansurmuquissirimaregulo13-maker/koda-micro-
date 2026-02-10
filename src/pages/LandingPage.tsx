import { Link } from 'react-router-dom';
import { CreditCard, Users, TrendingUp, Shield, CheckCircle, ArrowRight } from 'lucide-react';

export function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1B3A2D] via-[#2D6A4F] to-[#40916C]">

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-32">
                    <div className="text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-sm rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-2xl">
                            <CreditCard className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>

                        <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 font-montserrat tracking-tight">
                            Koda
                        </h1>

                        <p className="text-lg md:text-2xl text-green-100 mb-8 md:mb-12 max-w-2xl mx-auto font-light px-4">
                            A plataforma definitiva para gestão de microcrédito em Moçambique.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center px-4">
                            <Link
                                to="/login"
                                className="w-full sm:w-auto group px-10 py-4 bg-white text-[#1B3A2D] rounded-2xl font-bold text-lg hover:bg-green-50 transition-all shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
                            >
                                Entrar no Sistema
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                to="/signup"
                                className="w-full sm:w-auto px-10 py-4 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all border-2 border-white/30 hover:border-white/50 flex justify-center"
                            >
                                Criar Conta
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-20 left-10 w-48 h-48 md:w-72 md:h-72 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-64 h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* Features Section */}
            <div className="bg-white py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1B3A2D] mb-10 md:mb-16">
                        Recursos Principais
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        <div className="bg-gradient-to-br from-green-50 to-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-green-100 text-center md:text-left flex flex-col items-center md:items-start transition-all">
                            <div className="w-14 h-14 bg-[#40916C] rounded-xl flex items-center justify-center mb-6 shadow-md shadow-green-900/10">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-[#1B3A2D] mb-3 md:mb-4">
                                Gestão de Clientes
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                Cadastre e gerencie seus clientes de forma simples e organizada. Acompanhe histórico completo de cada cliente.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-green-100 text-center md:text-left flex flex-col items-center md:items-start transition-all">
                            <div className="w-14 h-14 bg-[#2D6A4F] rounded-xl flex items-center justify-center mb-6 shadow-md shadow-green-900/10">
                                <CreditCard className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-[#1B3A2D] mb-3 md:mb-4">
                                Controle de Créditos
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                Gerencie empréstimos, parcelas e pagamentos. Acompanhe status em tempo real e envie lembretes automáticos.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-green-100 text-center md:text-left flex flex-col items-center md:items-start transition-all">
                            <div className="w-14 h-14 bg-[#1B3A2D] rounded-xl flex items-center justify-center mb-6 shadow-md shadow-green-900/10">
                                <TrendingUp className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-[#1B3A2D] mb-3 md:mb-4">
                                Relatórios Detalhados
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                Visualize métricas importantes, gere relatórios em PDF e tome decisões baseadas em dados concretos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-[#F7F7F2] py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1B3A2D] mb-10 md:mb-16">
                        Por Que Escolher a Koda?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
                        {[
                            'Interface moderna e intuitiva',
                            'Segurança de dados garantida',
                            'Notificações via WhatsApp',
                            'Relatórios em PDF profissionais',
                            'Acesso de qualquer dispositivo',
                            'Suporte técnico dedicado',
                        ].map((benefit, index) => (
                            <div key={index} className="flex items-center gap-4 bg-white p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-[#40916C] flex-shrink-0" />
                                <span className="text-gray-700 font-medium text-sm md:text-base">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-[#1B3A2D] to-[#2D6A4F] py-12 md:py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <Shield className="w-12 h-12 md:w-16 md:h-16 text-white mx-auto mb-6" />
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-6">
                        Pronto para Começar?
                    </h2>
                    <p className="text-green-100 text-base md:text-lg mb-8 max-w-lg mx-auto">
                        Crie sua conta agora e comece a gerenciar seus microcréditos de forma profissional.
                    </p>
                    <Link
                        to="/signup"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1B3A2D] rounded-xl font-semibold text-lg hover:bg-green-50 transition-all shadow-2xl hover:scale-105"
                    >
                        Criar Conta Grátis
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            <div className="bg-[#1B1B1B] py-8 md:py-12 border-t border-white/5 px-4">
                <div className="max-w-7xl mx-auto text-center text-gray-500">
                    <p className="text-sm font-medium">
                        Koda Moçambique
                    </p>
                    <p className="text-xs mt-2 opacity-50">
                        Tecnologia para Microcrédito Organizado
                    </p>
                </div>
            </div>
        </div>
    );
}
