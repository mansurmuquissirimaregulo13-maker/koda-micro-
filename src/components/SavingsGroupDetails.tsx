import { useState, useMemo } from 'react';
import {
    Users,
    Wallet,
    TrendingUp,
    History,
    Info,
    ChevronLeft,
    Plus,
    CheckCircle,
    Clock,
    ArrowUpRight,
    Shield
} from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { formatMZN, formatDate } from '../utils/helpers';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';

interface SavingsGroupDetailsProps {
    groupId: string;
    onBack: () => void;
}

export function SavingsGroupDetails({ groupId, onBack }: SavingsGroupDetailsProps) {
    const {
        savingsGroups,
        groupMembers,
        contributions,
        savingsLoans,
        profile,
        addContribution,
        requestLoan,
        approveLoan
    } = useAppState();

    const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'contributions' | 'loans'>('overview');
    const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

    const group = useMemo(() =>
        savingsGroups.find(g => g.id === groupId),
        [savingsGroups, groupId]);

    const members = useMemo(() =>
        groupMembers.filter(m => m.groupId === groupId),
        [groupMembers, groupId]);

    const groupContributions = useMemo(() => {
        const memberIds = members.map(m => m.id);
        return contributions.filter(c => memberIds.includes(c.memberId));
    }, [contributions, members]);

    const myMembership = useMemo(() =>
        members.find(m => m.userId === profile?.id),
        [members, profile]);

    const groupLoans = useMemo(() => {
        const memberIds = members.map(m => m.id);
        return savingsLoans.filter(l => memberIds.includes(l.memberId));
    }, [savingsLoans, members]);

    const isAdmin = myMembership?.role === 'admin';

    if (!group) return <div>Grupo não encontrado.</div>;

    const handleAddContribution = async (data: any) => {
        if (!myMembership) return;
        await addContribution({
            memberId: myMembership.id,
            amount: group.contributionAmount,
            periodIndex: 1, // Simplified for now
            lateFeePaid: 0,
            notes: data.notes
        });
        setIsContributionModalOpen(false);
    };

    const handleRequestLoan = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!myMembership) return;
        const formData = new FormData(e.currentTarget);

        await requestLoan({
            groupId: group.id,
            memberId: myMembership.id,
            amount: Number(formData.get('amount')),
            interestRate: group.interestRate,
            termMonths: Number(formData.get('termMonths'))
        });
        setIsLoanModalOpen(false);
    };

    const totalFund = groupContributions.reduce((sum, c) => sum + c.amount, 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-100">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-[#1B1B1B] font-montserrat tracking-tight">
                            {group.name}
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mt-1">
                            <span className="capitalize">{group.periodicity}</span>
                            <span>•</span>
                            <span>Iniciado em {formatDate(group.startDate)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
                            Configurações
                        </button>
                    )}
                    <button
                        onClick={() => setIsContributionModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1B3A2D] text-white rounded-lg text-sm font-bold hover:bg-[#2D6A4F] transition-all shadow-lg shadow-green-900/10">
                        <Plus className="w-4 h-4" />
                        Pagar Quota
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-gray-100/50 rounded-2xl w-fit">
                {[
                    { id: 'overview', label: 'Visão Geral', icon: Info },
                    { id: 'members', label: 'Membros', icon: Users },
                    { id: 'contributions', label: 'Poupança', icon: Wallet },
                    { id: 'loans', label: 'Empréstimos', icon: ArrowUpRight },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                            ? 'bg-white text-[#1B3A2D] shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}>
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Main Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Fundo Acumulado</p>
                                <p className="text-3xl font-black text-[#1B3A2D]">{formatMZN(totalFund)}</p>
                                <div className="mt-4 flex items-center gap-2 text-green-600 text-xs font-bold">
                                    <TrendingUp className="w-4 h-4" />
                                    +12% este mês
                                </div>
                            </div>
                            <div className="bg-[#1B3A2D] p-6 rounded-3xl shadow-xl shadow-green-950/20 text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-xs font-bold text-green-300 uppercase tracking-widest mb-1">Minha Poupança</p>
                                    <p className="text-3xl font-black">{formatMZN(
                                        groupContributions.filter(c => c.memberId === myMembership?.id).reduce((sum, c) => sum + c.amount, 0)
                                    )}</p>
                                    <p className="mt-4 text-xs font-medium text-green-200">
                                        {groupContributions.filter(c => c.memberId === myMembership?.id).length} contribuições realizadas
                                    </p>
                                </div>
                                <Wallet className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12" />
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <History className="w-5 h-5 text-gray-400" />
                                    Atividade Recente
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {groupContributions.slice(0, 5).map((c) => {
                                    const member = members.find(m => m.id === c.memberId);
                                    return (
                                        <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                                    {member?.name?.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{member?.name}</p>
                                                    <p className="text-xs text-gray-400">{formatDate(c.paymentDate)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-green-600">+{formatMZN(c.amount)}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Quota Paga</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {groupContributions.length === 0 && (
                                    <div className="p-12 text-center text-gray-400">
                                        Nenhuma atividade registada.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Rules & Info */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-widest text-center">Regras do Grupo</h4>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Multa por Atraso</p>
                                        <p className="text-xs text-gray-500">{formatMZN(group.lateFee)} por ocorrência</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Juros de Empréstimo</p>
                                        <p className="text-xs text-gray-500">{group.interestRate}% de taxa interna</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600 shrink-0">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Limite de Empréstimo</p>
                                        <p className="text-xs text-gray-500">Até {formatMZN(group.maxLoanPerMember)} p/ membro</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'members' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <DataTable
                        data={members}
                        columns={[
                            {
                                header: 'Membro',
                                accessor: (m) => (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs">
                                            {m.name?.substring(0, 1)}
                                        </div>
                                        <span className="font-bold">{m.name}</span>
                                    </div>
                                )
                            },
                            {
                                header: 'Função',
                                accessor: (m) => (
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${m.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {m.role === 'admin' ? 'Administrador' : 'Membro'}
                                    </span>
                                )
                            },
                            {
                                header: 'Status',
                                accessor: (m) => (
                                    <div className="flex items-center gap-2">
                                        {m.status === 'approved' ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Clock className="w-4 h-4 text-amber-500" />
                                        )}
                                        <span className="text-xs font-medium capitalize">{m.status}</span>
                                    </div>
                                )
                            },
                            {
                                header: 'Data de Adesão',
                                accessor: (m) => formatDate(m.joinedAt)
                            }
                        ]}
                    />
                </div>
            )}

            {activeTab === 'contributions' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-center py-20">
                    <Wallet className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">Histórico de Poupança</h3>
                    <p className="text-gray-500 text-sm">Visualização detalhada das contribuições em breve.</p>
                </div>
            )}

            {activeTab === 'loans' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsLoanModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1B3A2D] text-white rounded-lg text-sm font-bold hover:bg-[#2D6A4F] transition-all">
                            <Plus className="w-4 h-4" />
                            Solicitar Empréstimo
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <DataTable
                            data={groupLoans}
                            columns={[
                                {
                                    header: 'Membro',
                                    accessor: (l) => {
                                        const member = members.find(m => m.id === l.memberId);
                                        return member?.name || 'Desconhecido';
                                    }
                                },
                                {
                                    header: 'Valor',
                                    accessor: (l) => formatMZN(l.amount)
                                },
                                {
                                    header: 'Status',
                                    accessor: (l) => (
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${l.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                l.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {l.status}
                                        </span>
                                    )
                                },
                                {
                                    header: 'Ação',
                                    accessor: (l) => (
                                        isAdmin && l.status === 'pending' ? (
                                            <button
                                                onClick={() => approveLoan(l.id)}
                                                className="text-xs font-bold text-green-600 hover:underline">
                                                Aprovar
                                            </button>
                                        ) : null
                                    )
                                }
                            ]}
                        />
                        {groupLoans.length === 0 && (
                            <div className="p-20 text-center text-gray-400">
                                Nenhum empréstimo registado.
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Modal
                isOpen={isContributionModalOpen}
                onClose={() => setIsContributionModalOpen(false)}
                title="Registar Pagamento de Quota">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleAddContribution({ notes: formData.get('notes') });
                }} className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Valor da Quota</p>
                        <p className="text-2xl font-black text-[#1B3A2D]">{formatMZN(group.contributionAmount)}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Observações</label>
                        <textarea
                            name="notes"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#40916C] min-h-[100px]"
                            placeholder="Alguma nota sobre o pagamento?"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsContributionModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#2D6A4F]">
                            Confirmar Pagamento
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isLoanModalOpen}
                onClose={() => setIsLoanModalOpen(false)}
                title="Solicitar Empréstimo Interno">
                <form onSubmit={handleRequestLoan} className="space-y-4">
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-xs text-amber-800 font-medium">
                            O valor solicitado está sujeito à aprovação dos administradores do grupo e às regras de juros de {group.interestRate}%.
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Valor Solicitado (MZN)</label>
                        <input
                            name="amount"
                            type="number"
                            required
                            max={group.maxLoanPerMember}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#40916C]"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Limite do grupo: {formatMZN(group.maxLoanPerMember)}</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Prazo (Meses)</label>
                        <input
                            name="termMonths"
                            type="number"
                            required
                            min="1"
                            max="12"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#40916C]"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsLoanModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#2D6A4F]">
                            Confirmar Solicitação
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
