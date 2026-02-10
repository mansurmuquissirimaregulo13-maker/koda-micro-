import { useState } from "react";
import { 
  MessageSquare, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Info,
  ChevronRight,
  Shield
} from "lucide-react";
import { useAppState } from "../hooks/useAppState";
import { toast } from "sonner";
import { formatMZN, getDaysOverdue } from "../utils/helpers";
import { API_URL } from "../config";
import { Client } from "../types";

type MessageType = "welcome" | "promo" | "overdue" | "general";

export function MessagesPage() {
    const { clients, credits } = useAppState();
    const [selectedType, setSelectedType] = useState<MessageType>("welcome");
    const [selectedClientId, setSelectedClientId] = useState<string>("all");
    const [sending, setSending] = useState(false);

    const templates = {
        welcome: "Ola {{nome}}, seja bem-vindo a Koda Microcredito! Sua conta foi aprovada e ja pode solicitar creditos. Duvidas? Fale conosco.",
        promo: "Ola {{nome}}, temos novas condicoes de credito para voce este mes! Confira no seu painel ou responda aqui para saber mais.",
        overdue: "Atencao {{nome}}, identificamos um atraso de {{dias}} dias no seu credito de {{valor}}. Por favor, regularize sua situacao para evitar multas. Koda Microcredito.",
        general: "Ola {{nome}}, o sistema Koda passara por uma manutencao breve. Agradecemos a compreensao."
    };

    const getPreview = (client: Client) => {
        let msg = templates[selectedType];
        if (selectedType === "overdue") {
            const credit = credits.find(c => c.clientId === client.id && c.status === "overdue");
            const days = credit ? getDaysOverdue(credit.endDate) : 0;
            const amount = credit ? formatMZN(credit.remainingAmount) : "MZN 0,00";
            msg = msg.replace("{{dias}}", days.toString()).replace("{{valor}}", amount);
        }
        return msg.replace("{{nome}}", client.name);
    };

    const handleSendMessage = async () => {
        if (clients.length === 0) return;
        setSending(true);
        const toastId = toast.loading("Enviando mensagens...");
        try {
            const targetClients = selectedClientId === "all" ? clients : clients.filter(c => c.id === selectedClientId);
            let success = 0;
            for (const client of targetClients) {
                const res = await fetch(`${API_URL}/send-message`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone: client.phone, message: getPreview(client) })
                });
                if (res.ok) success++;
            }
            toast.success(`${success} mensagens enviadas com sucesso!`, { id: toastId });
        } catch (error) {
            toast.error("Erro ao enviar mensagens.", { id: toastId });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-montserrat">Centro de Mensagens</h1>
                    <p className="text-gray-500 text-sm">Gerencie notificacoes e comunicacoes via WhatsApp</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Categorias</h3>
                        <div className="space-y-2">
                            {[
                                { id: "welcome", label: "Boas-vindas", icon: CheckCircle, color: "text-blue-500 bg-blue-50" },
                                { id: "promo", label: "Promocional", icon: Info, color: "text-purple-500 bg-purple-50" },
                                { id: "overdue", label: "Cobranca / Atraso", icon: AlertCircle, color: "text-red-500 bg-red-50" },
                                { id: "general", label: "Avisos Gerais", icon: MessageSquare, color: "text-gray-500 bg-gray-50" },
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id as MessageType)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedType === type.id
                                            ? "bg-[#1B3A2D] text-white shadow-md shadow-green-900/20"
                                            : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent"
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${selectedType === type.id ? "bg-white/20" : type.color}`}>
                                        <type.icon className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium text-sm">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Destinatarios</h3>
                        <select
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#40916C] outline-none text-sm"
                        >
                            <option value="all">Todos os Clientes ({clients.length})</option>
                            <optgroup label="Individuais">
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </optgroup>
                        </select>
                        <p className="text-[10px] text-gray-400 mt-2 italic">* Mensagens enviadas individualmente via API.</p>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-[#40916C]" />
                                Pre-visualizacao WhatsApp
                            </h3>
                            <div className="px-3 py-1 bg-green-50 text-[#1B3A2D] text-[10px] font-bold rounded-full border border-green-100 tracking-wider uppercase">
                                Servidor Ativo
                            </div>
                        </div>

                        <div className="bg-[#E5DDD5] p-6 rounded-2xl relative shadow-inner min-h-[180px] flex items-end border border-gray-200">
                            <div className="bg-white p-4 rounded-t-xl rounded-bl-xl shadow-sm max-w-[85%] relative animate-in slide-in-from-bottom-2 duration-300">
                                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                    {clients.length > 0
                                        ? getPreview(selectedClientId === "all" ? clients[0] : (clients.find(c => c.id === selectedClientId) || clients[0]))
                                        : "Selecione um cliente para ver a previa."
                                    }
                                </p>
                                <span className="text-[10px] text-gray-400 block text-right mt-1">Agora</span>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={handleSendMessage}
                                disabled={sending || clients.length === 0}
                                className="w-full bg-[#1B3A2D] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#2D6A4F] transition-all disabled:opacity-50 shadow-lg shadow-green-900/20 active:scale-[0.98]"
                            >
                                {sending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <ChevronRight className="w-5 h-5" />
                                        <span>Enviar para {selectedClientId === "all" ? `${clients.length} Clientes` : "Cliente Selecionado"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}