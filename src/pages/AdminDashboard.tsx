import { useEffect, useState } from 'react';
import { Building2, Search, CheckCircle, XCircle, Clock, ExternalLink, ShieldCheck, Users, TrendingUp, CreditCard, LayoutDashboard, UserX, UserCheck, Trash2 } from 'lucide-react';
import { getAllCompanies, getPendingCompanies, approveCompany, rejectCompany, Company, getPendingUsers, getAllUsers, approveUser, rejectUser, UserProfile, deleteUser } from '../lib/supabase-admin';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function AdminDashboard() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [stats, setStats] = useState({
        companies: 0,
        pendingCompanies: 0,
        users: 0,
        pendingUsers: 0,
        credits: 0,
        totalVolume: 0
    });
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [activeTab, setActiveTab] = useState<'companies' | 'users'>('companies');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [filter, activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load Dynamic Stats
            const { count: companiesCount } = await supabase.from('companies').select('*', { count: 'exact', head: true });
            const { count: usersCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
            const { count: creditsCount } = await supabase.from('credits').select('*', { count: 'exact', head: true });
            const { count: pendingCompCount } = await supabase.from('companies').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            const { count: pendingUsersCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            const { data: totalVol } = await supabase.from('credits').select('amount');

            const volume = totalVol?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

            setStats({
                companies: companiesCount || 0,
                pendingCompanies: pendingCompCount || 0,
                users: usersCount || 0,
                pendingUsers: pendingUsersCount || 0,
                credits: creditsCount || 0,
                totalVolume: volume
            });

            if (activeTab === 'companies') {
                try {
                    const data = filter === 'pending' ? await getPendingCompanies() : await getAllCompanies();
                    // Filter by status if not 'all'
                    setCompanies(filter === 'all' ? (data || []) : (data || []).filter((c: any) => c.status === filter));
                } catch (e) {
                    console.error('Error fetching companies:', e);
                    setCompanies([]);
                    throw e;
                }
            } else {
                try {
                    const data = filter === 'pending' ? await getPendingUsers() : await getAllUsers();
                    // Filter by status if not 'all'
                    setUsers(filter === 'all' ? (data || []) : (data || []).filter((u: any) => u.status === filter));
                } catch (e) {
                    console.error('Error fetching users:', e);
                    setUsers([]);
                    throw e;
                }
            }
        } catch (error: any) {
            console.error('Detailed Error loading data:', error);
            toast.error(`Erro: ${error.message || 'Falha ao carregar dados do sistema'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveCompany = async (companyId: string) => {
        try {
            await approveCompany(companyId);
            toast.success('Empresa aprovada com sucesso!');
            loadData();
        } catch (error) {
            console.error('Error approving company:', error);
            toast.error('Erro ao aprovar empresa');
        }
    };

    const handleRejectCompany = async (companyId: string) => {
        try {
            await rejectCompany(companyId);
            toast.success('Empresa rejeitada');
            loadData();
        } catch (error) {
            console.error('Error rejecting company:', error);
            toast.error('Erro ao rejeitar empresa');
        }
    };

    const handleApproveUser = async (userId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await approveUser(userId, user?.id || '');
            toast.success('Usuário aprovado com sucesso!');
            loadData();
        } catch (error) {
            console.error('Error approving user:', error);
            toast.error('Erro ao aprovar usuário');
        }
    };

    const handleRejectUser = async (userId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await rejectUser(userId, user?.id || '');
            toast.success('Usuário rejeitado');
            loadData();
        } catch (error) {
            console.error('Error rejecting user:', error);
            toast.error('Erro ao rejeitar usuário');
        }
    };

    const handleRemoveUser = async (userId: string) => {
        if (!confirm('Tem certeza que deseja remover este usuário permanentemente? Ele perderá o acesso ao sistema.')) return;
        try {
            await deleteUser(userId);
            toast.success('Usuário removido com sucesso!');
            loadData();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Erro ao remover usuário');
        }
    };

    const filteredCompanies = companies.filter((c: Company) => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const filteredUsers = users.filter((u: UserProfile) => {
        const matchesSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#1B3A2D] to-[#2D6A4F] rounded-xl flex items-center justify-center shadow-lg">
                        <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1B1B1B]">Painel de Gestão Koda</h1>
                        <p className="text-sm text-gray-500">Comando Central Koda Microcrédito</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'MZN' }).format(stats.totalVolume)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">VOLUME TOTAL</span>
                    </div>
                </div>
            </div>

            {/* Global Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Empresas</p>
                            <p className="text-xl font-bold text-gray-900">{stats.companies}</p>
                        </div>
                    </div>
                    {stats.pendingCompanies > 0 && (
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
                            <Clock className="w-3 h-3" />
                            {stats.pendingCompanies} PENDENTES
                        </div>
                    )}
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Usuários</p>
                            <p className="text-xl font-bold text-gray-900">{stats.users}</p>
                        </div>
                    </div>
                    {stats.pendingUsers > 0 && (
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full w-fit">
                            <Clock className="w-3 h-3" />
                            {stats.pendingUsers} PENDENTES
                        </div>
                    )}
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Créditos</p>
                            <p className="text-xl font-bold text-gray-900">{stats.credits}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Status Sistema</p>
                            <p className="text-xl font-bold text-green-600">ONLINE</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Control Tabs */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex bg-gray-100 p-1 rounded-xl w-full lg:w-fit">
                    <button
                        onClick={() => setActiveTab('companies')}
                        className={`flex-1 lg:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'companies' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Empresas
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex-1 lg:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Usuários
                    </button>
                </div>

                <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold text-xs transition-colors border ${filter === f
                                ? 'bg-[#1B3A2D] text-white border-[#1B3A2D]'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {f === 'all' && 'TODOS'}
                            {f === 'pending' && 'PENDENTES'}
                            {f === 'approved' && 'APROVADOS'}
                            {f === 'rejected' && 'REJEITADOS'}
                        </button>
                    ))}
                </div>

                <div className="relative w-full lg:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={activeTab === 'companies' ? "Buscar empresa..." : "Buscar usuário..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40916C] text-sm font-medium"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {activeTab === 'companies' ? 'Empresa' : 'Usuário'}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Cadastro</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic font-medium"> Carregando dados do cockpit...</td>
                                </tr>
                            ) : (activeTab === 'companies' ? filteredCompanies : filteredUsers).length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">
                                        Nenhum registro encontrado nesta visualização
                                    </td>
                                </tr>
                            ) : (
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (activeTab === 'companies' ? filteredCompanies : filteredUsers).map((item: any) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === 'companies' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                                                    {activeTab === 'companies' ? <Building2 className="w-5 h-5 text-blue-500" /> : <Users className="w-5 h-5 text-purple-500" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{activeTab === 'companies' ? item.name : item.full_name}</p>
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        {activeTab === 'companies' ?
                                                            (item.owner?.email || 'Sem email responsável') :
                                                            `${item.email}${item.company?.name ? ` • ${item.company.name}` : ''}`
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm blur-[0.3px] ${item.status === 'approved' ? 'bg-green-100/80 text-green-700' :
                                                item.status === 'pending' ? 'bg-amber-100/80 text-amber-700' :
                                                    'bg-red-100/80 text-red-700'
                                                }`}>
                                                {item.status === 'approved' ? 'Ativa' :
                                                    item.status === 'pending' ? 'Pendente' :
                                                        'Rejeitada'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[12px] font-bold text-gray-400">
                                            {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {item.status === 'pending' && (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => activeTab === 'companies' ? handleApproveCompany(item.id) : handleApproveUser(item.id)}
                                                        className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all shadow-sm active:scale-95"
                                                        title="Aprovar"
                                                    >
                                                        {activeTab === 'companies' ? <CheckCircle className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => activeTab === 'companies' ? handleRejectCompany(item.id) : handleRejectUser(item.id)}
                                                        className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all shadow-sm active:scale-95"
                                                        title="Rejeitar"
                                                    >
                                                        {activeTab === 'companies' ? <XCircle className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            )}
                                            {item.status === 'approved' && activeTab === 'users' && (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleRemoveUser(item.id)}
                                                        className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all shadow-sm active:scale-95"
                                                        title="Remover Usuário"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                            {item.status === 'approved' && activeTab === 'companies' && (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-colors"
                                                        title="Configurações Avançadas"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
