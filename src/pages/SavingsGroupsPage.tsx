import { useState } from 'react';
import {
    Users,
    Plus,
    TrendingUp,
    Target,
    Search,
    ArrowRight,
    Shield,
    Calendar,
    Wallet
} from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { formatMZN, formatDate } from '../utils/helpers';
import { Modal } from '../components/Modal';
import { SavingsGroupDetails } from '../components/SavingsGroupDetails';
import { toast } from 'sonner';

export function SavingsGroupsPage() {
    const { savingsGroups, groupMembers, profile, joinGroup, addSavingsGroup } = useAppState();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [view, setView] = useState<'list' | 'details'>('list');
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Filter groups
    const filteredGroups = savingsGroups.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check if current user is member of a group
    const isMember = (groupId: string) => {
        return groupMembers.some(m => m.groupId === groupId && m.userId === profile?.id);
    };

    const getMemberStatus = (groupId: string) => {
        const membership = groupMembers.find(m => m.groupId === groupId && m.userId === profile?.id);
        return membership?.status;
    };

    const handleJoinRequest = async (groupId: string) => {
        await joinGroup(groupId);
        setIsJoinModalOpen(false);
        toast.success('Solicitação enviada com sucesso!');
    };

    const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        console.log('Tentando criar grupo:', Object.fromEntries(formData));

        try {
            const result = await addSavingsGroup({
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                contributionAmount: Number(formData.get('amount')),
                periodicity: formData.get('periodicity') as 'weekly' | 'monthly',
                startDate: formData.get('startDate') as string,
                lateFee: Number(formData.get('lateFee')),
                interestRate: Number(formData.get('interestRate') || 0),
                maxLoanPerMember: Number(formData.get('maxLoanPerMember')),
                memberLimit: formData.get('memberLimit') ? Number(formData.get('memberLimit')) : undefined,
            } as any);
            console.log('Resultado da criação:', result);
            setIsCreateModalOpen(false);
            toast.success('Grupo criado com sucesso!');
        } catch (error: any) {
            console.error('Erro detalhado ao criar grupo:', error);
            toast.error(`Erro ao criar o grupo: ${error.message || 'Erro desconhecido'}`);
        }
    };

    if (view === 'details' && selectedGroup) {
        return (
            <SavingsGroupDetails
                groupId={selectedGroup.id}
                onBack={() => {
                    setView('list');
                    setSelectedGroup(null);
                }}
            />
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#1B1B1B] font-montserrat tracking-tight">
                        Membros
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Gerencie os membros e suas participações com transparência.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1B3A2D] text-white rounded-xl hover:bg-[#2D6A4F] transition-all shadow-lg shadow-green-900/20 font-bold text-sm">
                    <Plus className="w-4 h-4" />
                    Novo Grupo
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Meus Grupos</p>
                        <p className="text-2xl font-black text-gray-900">
                            {groupMembers.filter(m => m.userId === profile?.id).length}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Poupado</p>
                        <p className="text-2xl font-black text-gray-900">{formatMZN(0)}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Próxima Contribuição</p>
                        <p className="text-sm font-bold text-gray-900">Nenhuma pendente</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#40916C] transition-colors" />
                <input
                    type="text"
                    placeholder="Procurar grupos pelo nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#40916C] shadow-sm transition-all"
                />
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => {
                    const status = getMemberStatus(group.id);
                    const isUserIn = isMember(group.id);

                    return (
                        <div
                            key={group.id}
                            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-700 font-bold">
                                        {group.name.substring(0, 1)}
                                    </div>
                                    {isUserIn && (
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {status === 'approved' ? 'Membro' : 'Pendente'}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight group-hover:text-[#40916C] transition-colors">
                                    {group.name}
                                </h3>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                                    {group.description || 'Sem descrição.'}
                                </p>

                                <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Wallet className="w-4 h-4 opacity-50" />
                                        <span className="text-xs font-medium">{formatMZN(group.contributionAmount)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="w-4 h-4 opacity-50" />
                                        <span className="text-xs font-medium capitalize">
                                            {group.periodicity === 'weekly' ? 'Semanal' : 'Mensal'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Users className="w-4 h-4 opacity-50" />
                                        <span className="text-xs font-medium">{group.memberLimit ? `${group.memberLimit} máx.` : 'Ilimitado'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Shield className="w-4 h-4 opacity-50" />
                                        <span className="text-xs font-medium">{group.interestRate}% juros</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Início</p>
                                    <p className="text-xs font-bold text-gray-700">{formatDate(group.startDate)}</p>
                                </div>
                                {isUserIn ? (
                                    <button
                                        onClick={() => {
                                            setSelectedGroup(group);
                                            setView('details');
                                        }}
                                        className="flex items-center gap-2 text-xs font-bold text-[#1B3A2D] hover:underline">
                                        Ver Detalhes
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setSelectedGroup(group);
                                            setIsJoinModalOpen(true);
                                        }}
                                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-[#1B3A2D] hover:text-white transition-all">
                                        Aderir
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {filteredGroups.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum grupo encontrado</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">
                            Não existem grupos de poupança que correspondam à sua pesquisa.
                        </p>
                    </div>
                )}
            </div>

            {/* Join Group Modal */}
            <Modal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                title="Aderir ao Grupo">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Deseja enviar uma solicitação para participar do grupo <span className="font-bold text-gray-900">{selectedGroup?.name}</span>?
                    </p>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                        <button
                            onClick={() => setIsJoinModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">
                            Cancelar
                        </button>
                        <button
                            onClick={() => selectedGroup && handleJoinRequest(selectedGroup.id)}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg">
                            Confirmar Solicitação
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Create Group Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Criar Novo Grupo de Poupança">
                <form onSubmit={handleCreateGroup} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome do Grupo</label>
                            <input name="name" required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#40916C]" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Descrição</label>
                            <textarea name="description" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#40916C]" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Quota (MZN)</label>
                            <input name="amount" type="number" required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#40916C]" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Periodicidade</label>
                            <select name="periodicity" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#40916C]">
                                <option value="weekly">Semanal</option>
                                <option value="monthly">Mensal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Data de Início</label>
                            <input name="startDate" type="date" required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#40916C]" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Limite de Membros</label>
                            <input name="memberLimit" type="number" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#40916C]" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg">Criar Grupo</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
