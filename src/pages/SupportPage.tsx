import {
    HelpCircle,
    MessageCircle,
    Mail,
    Clock,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function SupportPage() {
    const supportChannels = [
        {
            title: 'WhatsApp Suporte',
            description: 'Atendimento rápido via chat para dúvidas operacionais.',
            icon: MessageCircle,
            action: 'Conversar agora',
            color: 'bg-green-50 text-green-600',
            link: 'https://wa.me/258840000000' // Placeholder for real support number
        },
        {
            title: 'E-mail',
            description: 'Para questões financeiras e suporte técnico detalhado.',
            icon: Mail,
            action: 'Enviar e-mail',
            color: 'bg-blue-50 text-blue-600',
            link: 'mailto:suporte@kodamicro.com'
        },
        {
            title: 'Central de Ajuda',
            description: 'Consulte nossa documentação e vídeos tutoriais.',
            icon: HelpCircle,
            action: 'Acessar Central',
            color: 'bg-purple-50 text-purple-600',
            link: '#'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-[#1B1B1B] font-montserrat">
                    Suporte e Ajuda
                </h2>
                <p className="text-gray-500 text-sm">
                    Estamos aqui para ajudar você a gerir seu microcrédito.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {supportChannels.map((channel, index) => (
                    <a
                        key={index}
                        href={channel.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
                    >
                        <div className={`p-3 rounded-xl w-fit mb-4 ${channel.color}`}>
                            <channel.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{channel.title}</h3>
                        <p className="text-gray-500 text-sm mb-6 flex-1">
                            {channel.description}
                        </p>
                        <div className="flex items-center text-sm font-semibold text-gray-900 group-hover:gap-2 transition-all">
                            <span>{channel.action}</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </a>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-500" />
                            Horário de Atendimento
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 text-sm text-gray-600">
                            <span>Segunda - Sexta</span>
                            <span className="font-medium text-gray-900">08:00 - 18:00</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50 text-sm text-gray-600">
                            <span>Sábado</span>
                            <span className="font-medium text-gray-900">09:00 - 13:00</span>
                        </div>
                        <div className="flex justify-between items-center py-2 text-sm text-gray-600">
                            <span>Domingo e Feriados</span>
                            <span className="text-gray-400 italic">Fechado</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#1B3A2D] to-[#2D6A4F] rounded-2xl p-8 text-white shadow-xl shadow-green-900/20 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Configuração WhatsApp</h3>
                        <p className="text-white/80 text-sm mb-6 leading-relaxed">
                            Mantenha seu servidor WhatsApp conectado para enviar relatórios e notificações automáticas para seus clientes.
                        </p>
                    </div>
                    <Link
                        to="/settings"
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                        Configurar Conexão
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
