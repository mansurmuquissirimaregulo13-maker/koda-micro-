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
    Shield,
    Percent
} from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { formatMZN, formatDate } from '../utils/helpers';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { toast } from 'sonner';

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
        allProfiles,
        addContribution,
        requestLoan,
        approveLoan,
        repaySavingsLoan,
        registerYield,
        manuallyAddMember
    } = useAppState();

    const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'contributions' | 'loans' | 'yields'>('overview');
    const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
    const [isYieldModalOpen, setIsYieldModalOpen] = useState(false);
    const [selectedLoanForRepay, setSelectedLoanForRepay] = useState<any>(null);
    const [memberSearchTerm, setMemberSearchTerm] = useState('');
    const [selectedUserForMember, setSelectedUserForMember] = useState<any>(null);

    const group = useMemo(() =>
        (savingsGroups as any[]).find((g: any) => g.id === groupId),
        [savingsGroups, groupId]);

    const members = useMemo(() =>
        (groupMembers as any[]).filter((m: any) => m.groupId === groupId),
        [groupMembers, groupId]);

    const groupContributions = useMemo(() => {
        const memberIds = members.map((m: any) => m.id);
        return (contributions as any[]).filter((c: any) => memberIds.includes(c.memberId));
    }, [contributions, members]);

    const myMembership = useMemo(() =>
        (members as any[]).find((m: any) => m.userId === profile?.id),
        [members, profile]);

    const groupLoans = useMemo(() => {
        const memberIds = members.map((m: any) => m.id);
        return (savingsLoans as any[]).filter((l: any) => memberIds.includes(l.memberId));
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

    const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedUserForMember) return;
        const formData = new FormData(e.currentTarget);

        try {
            await manuallyAddMember({
                groupId: group.id,
                userId: selectedUserForMember.id,
                name: selectedUserForMember.full_name,
                initialSavings: Number(formData.get('initialSavings')),
                initialDebt: Number(formData.get('initialDebt')),
                customInterestRate: formData.get('customInterestRate') ? Number(formData.get('customInterestRate')) : undefined,
            });
            setIsAddMemberModalOpen(false);
            setSelectedUserForMember(null);
            setMemberSearchTerm('');
            toast.success('Membro adicionado com sucesso!');
        } catch (error) {
            toast.error('Erro ao adicionar membro.');
        }
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
        toast.success('Empréstimo solicitado!');
    };

    const handleRepayLoan = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedLoanForRepay) return;
        const formData = new FormData(e.currentTarget);

        try {
            await repaySavingsLoan({
                loanId: selectedLoanForRepay.id,
                amount: Number(formData.get('amount')),
                notes: formData.get('notes') as string
            });
            setIsRepayModalOpen(false);
            setSelectedLoanForRepay(null);
            toast.success('Pagamento registado!');
        } catch (error) {
            toast.error('Erro ao registar pagamento.');
        }
    };

    const handleRegisterYield = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
            await registerYield({
                groupId: group.id,
                amount: Number(formData.get('amount')),
                sourceType: formData.get('sourceType') as 'loan_interest' | 'extra',
                notes: formData.get('notes') as string
            });
            setIsYieldModalOpen(false);
            toast.success('Ganho registado!');
        } catch (error) {
            toast.error('Erro ao registar ganho.');
        }
    };

    const totalFund = useMemo(() => {
        const contributionsSum = (groupContributions as any[]).reduce((sum: any, c: any) => sum + c.amount, 0);
        const initialSavingsSum = (members as any[]).reduce((sum: any, m: any) => sum + (m.initialSavings || 0), 0);
        return contributionsSum + initialSavingsSum;
    }, [groupContributions, members]);

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
                    { id: 'overview', label: 'Visão Geral', icon: Info as any },
                    { id: 'members', label: 'Membros', icon: Users as any },
                    { id: 'contributions', label: 'Poupança', icon: Wallet as any },
                    { id: 'loans', label: 'Empréstimos', icon: ArrowUpRight as any },
                    { id: 'yields', label: 'Ganhos', icon: TrendingUp as any },
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
                                        ((groupContributions as any[]).filter((c: any) => c.memberId === myMembership?.id).reduce((sum: any, c: any) => sum + c.amount, 0)) +
                                        (myMembership?.initialSavings || 0)
                                    )}</p>
                                    <p className="mt-4 text-xs font-medium text-green-200">
                                        {(groupContributions as any[]).filter((c: any) => c.memberId === myMembership?.id).length} quotas pagas + Saldo inicial
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
                                {groupContributions.slice(0, 5).map((c: any) => {
                                    const member = (members as any[]).find((m: any) => m.id === c.memberId);
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
                <div className="space-y-4">
                    {isAdmin && (
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsAddMemberModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#1B3A2D] text-white rounded-lg text-sm font-bold hover:bg-[#2D6A4F] transition-all">
                                <Plus className="w-4 h-4" />
                                Adicionar Membro
                            </button>
                        </div>
                    )}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <DataTable
                            data={members}
                            columns={[
                                {
                                    header: 'Membro',
                                    accessor: (m: any) => (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                                                {m.name?.substring(0, 1)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{m.name}</p>
                                                <p className="text-[10px] text-gray-400 capitalize">{m.role === 'admin' ? 'Administrador' : 'Membro'}</p>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    header: 'Total Poupado',
                                    accessor: (m: any) => {
                                        const memberContribs = (groupContributions as any[])
                                            .filter((c: any) => c.memberId === m.id)
                                            .reduce((sum, c) => sum + c.amount, 0);
                                        const total = (m.initialSavings || 0) + memberContribs + (m.earnedInterest || 0);
                                        return (
                                            <div className="text-sm">
                                                <p className="font-bold text-green-600">{formatMZN(total)}</p>
                                                <p className="text-[10px] text-gray-400">{formatMZN(m.initialSavings || 0)} inicial</p>
                                            </div>
                                        );
                                    }
                                },
                                {
                                    header: 'Dívida Atual',
                                    accessor: (m: any) => {
                                        const activeLoans = (groupLoans as any[])
                                            .filter((l: any) => l.memberId === m.id && (l.status === 'approved' || l.status === 'overdue'))
                                            .reduce((sum, l) => sum + l.remainingAmount, 0);
                                        const totalDebt = (m.initialDebt || 0) + activeLoans;
                                        return (
                                            <div className="text-sm">
                                                <p className={`font-bold ${totalDebt > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                                    {formatMZN(totalDebt)}
                                                </p>
                                                <p className="text-[10px] text-gray-400">Total em dívida</p>
                                            </div>
                                        );
                                    }
                                },
                                {
                                    header: 'Status',
                                    accessor: (m: any) => (
                                        <div className="flex items-center gap-2">
                                            {m.status === 'approved' ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Clock className="w-4 h-4 text-amber-500" />
                                            )}
                                            <span className="text-xs font-medium capitalize">
                                                {m.status === 'approved' ? 'Aprovado' : m.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                                            </span>
                                        </div>
                                    )
                                },
                                {
                                    header: 'Ganhos',
                                    accessor: (m: any) => (
                                        <div className="text-xs font-bold text-blue-600">
                                            {formatMZN(m.earnedInterest || 0)}
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'contributions' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <DataTable
                        data={groupContributions}
                        columns={[
                            {
                                header: 'Membro',
                                accessor: (c: any) => {
                                    const member = (members as any[]).find((m: any) => m.id === c.memberId);
                                    return (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center font-bold text-xs text-green-700">
                                                {member?.name?.substring(0, 1)}
                                            </div>
                                            <span className="font-medium text-gray-900">{member?.name}</span>
                                        </div>
                                    );
                                }
                            },
                            {
                                header: 'Valor',
                                accessor: (c: any) => (
                                    <span className="font-bold text-green-600">
                                        {formatMZN(c.amount)}
                                    </span>
                                )
                            },
                            {
                                header: 'Data do Pagamento',
                                accessor: (c: any) => formatDate(c.paymentDate)
                            },
                            {
                                header: 'Status',
                                accessor: (c: any) => (
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${c.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {c.status === 'paid' ? 'Pago' : 'Em Atraso'}
                                    </span>
                                )
                            },
                            {
                                header: 'Notas',
                                accessor: (c: any) => (
                                    <span className="text-xs text-gray-500 italic">
                                        {c.notes || '-'}
                                    </span>
                                )
                            }
                        ]}
                        searchPlaceholder="Buscar por membro..."
                    />
                    {groupContributions.length === 0 && (
                        <div className="py-20 text-center">
                            <Wallet className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900">Nenhum histórico encontrado</h3>
                            <p className="text-gray-500 text-sm">Ainda não foram registradas contribuições neste grupo.</p>
                        </div>
                    )}
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
                                    accessor: (l: any) => {
                                        const member = (members as any[]).find((m: any) => m.id === l.memberId);
                                        return member?.name || 'Desconhecido';
                                    }
                                },
                                {
                                    header: 'Valor',
                                    accessor: (l: any) => formatMZN(l.amount)
                                },
                                {
                                    header: 'Status',
                                    accessor: (l) => (
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${l.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            l.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {l.status === 'approved' ? 'Aprovado' :
                                                l.status === 'pending' ? 'Pendente' :
                                                    l.status === 'rejected' ? 'Rejeitado' :
                                                        l.status === 'paid' ? 'Pago' : 'Atrasado'}
                                        </span>
                                    )
                                },
                                {
                                    header: 'Ação',
                                    accessor: (l) => (
                                        <div className="flex items-center gap-2">
                                            {isAdmin && l.status === 'pending' && (
                                                <button
                                                    onClick={() => approveLoan(l.id)}
                                                    className="text-xs font-bold text-green-600 hover:underline">
                                                    Aprovar
                                                </button>
                                            )}
                                            {isAdmin && (l.status === 'approved' || l.status === 'overdue') && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedLoanForRepay(l);
                                                        setIsRepayModalOpen(true);
                                                    }}
                                                    className="text-xs font-bold text-[#1B3A2D] hover:underline">
                                                    Amortizar
                                                </button>
                                            )}
                                        </div>
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

            {activeTab === 'yields' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsYieldModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1B3A2D] text-white rounded-lg text-sm font-bold hover:bg-[#2D6A4F] transition-all">
                            <Plus className="w-4 h-4" />
                            Registar Ganho
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Ganhos em Espera</h3>
                                <p className="text-3xl font-black text-blue-600">{formatMZN(0)}</p>
                                <p className="text-xs text-gray-500 mt-2">Lucros registados mas ainda não distribuídos.</p>
                            </div>
                            <button
                                onClick={() => toast.info('Funcionalidade de distribuição em massa em breve')}
                                className="mt-6 w-full py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-all flex items-center justify-center gap-2">
                                <Percent className="w-4 h-4" />
                                Distribuir Lucros
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Total Distribuído</h3>
                            <p className="text-3xl font-black text-green-600">{formatMZN((members as any[]).reduce((sum: any, m: any) => sum + (m.earnedInterest || 0), 0))}</p>
                            <p className="text-xs text-gray-500 mt-2">Valor total de lucros que já foram para os saldos dos membros.</p>
                        </div>
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
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Método de Pagamento</label>
                        <select
                            name="paymentMethod"
                            required
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#40916C]">
                            <option value="mpesa">M-Pesa</option>
                            <option value="emola">e-Mola</option>
                            <option value="cash">Dinheiro (Mão)</option>
                            <option value="bank">Transferência Bancária</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Observações</label>
                        <textarea
                            name="notes"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#40916C] min-h-[80px]"
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
            <Modal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                title="Adicionar Novo Membro">
                <form onSubmit={handleAddMember} className="space-y-4">
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pesquisar Pessoa</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={memberSearchTerm}
                                onChange={(e) => setMemberSearchTerm(e.target.value)}
                                placeholder="Nome ou email..."
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-[#40916C]"
                            />
                            <Users className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>

                        {memberSearchTerm && !selectedUserForMember && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                {allProfiles
                                    .filter((u: any) =>
                                        (u.full_name?.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
                                            u.email?.toLowerCase().includes(memberSearchTerm.toLowerCase())) &&
                                        !(members as any[]).some((m: any) => m.userId === u.id)
                                    )
                                    .map((user: any) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedUserForMember(user);
                                                setMemberSearchTerm(user.full_name || user.email);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                                            <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>

                    {selectedUserForMember && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Popou tanto (Saldo)</label>
                                <input
                                    name="initialSavings"
                                    type="number"
                                    required
                                    defaultValue="0"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#40916C]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Deveu tanto (Dívida)</label>
                                <input
                                    name="initialDebt"
                                    type="number"
                                    required
                                    defaultValue="0"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#40916C]"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Taxa Personalizada (%)</label>
                                <input
                                    name="customInterestRate"
                                    type="number"
                                    step="0.1"
                                    placeholder={`Padrão do grupo: ${group.interestRate}%`}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#40916C]"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={() => {
                                setIsAddMemberModalOpen(false);
                                setSelectedUserForMember(null);
                                setMemberSearchTerm('');
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedUserForMember}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all ${selectedUserForMember ? 'bg-[#1B3A2D] hover:bg-[#2D6A4F]' : 'bg-gray-300 cursor-not-allowed'}`}>
                            Confirmar Membro
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Repay Loan Modal */}
            <Modal
                isOpen={isRepayModalOpen}
                onClose={() => {
                    setIsRepayModalOpen(false);
                    setSelectedLoanForRepay(null);
                }}
                title="Registar Pagamento de Empréstimo">
                <form onSubmit={handleRepayLoan} className="space-y-4">
                    <div className="p-4 bg-[#F7F7F2] rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase">Dívida Restante</span>
                            <span className="text-lg font-black text-red-600">{formatMZN(selectedLoanForRepay?.remainingAmount || 0)}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Valor do Pagamento</label>
                        <input
                            name="amount"
                            type="number"
                            required
                            max={selectedLoanForRepay?.remainingAmount}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#40916C]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notas</label>
                        <input
                            name="notes"
                            placeholder="Ex: Pagamento parcial via M-Pesa"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#40916C]"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRepayModalOpen(false);
                                setSelectedLoanForRepay(null);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg">
                            Registar Amortização
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Register Yield Modal */}
            <Modal
                isOpen={isYieldModalOpen}
                onClose={() => setIsYieldModalOpen(false)}
                title="Registar Novo Lucro/Ganho">
                <form onSubmit={handleRegisterYield} className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-800 font-medium">
                            Este valor será adicionado ao fundo do grupo e poderá ser distribuído proporcionalmente aos membros posteriormente.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Valor do Lucro (MZN)</label>
                        <input
                            name="amount"
                            type="number"
                            required
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#40916C]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Origem do Ganho</label>
                        <select
                            name="sourceType"
                            required
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#40916C]">
                            <option value="loan_interest">Juros de Empréstimos</option>
                            <option value="extra">Extra / Outros</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notas</label>
                        <textarea
                            name="notes"
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#40916C] min-h-[80px]"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={() => setIsYieldModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                            Registar Ganho
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
