import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
    Users,
    Building2,
    CheckCircle2,
    XCircle,
    Shield,
    Check,
    X,
    TrendingUp,
    DollarSign,
    Trash2,
    AlertTriangle,
} from 'lucide-react';
import {
    getPendingUsers,
    getAllUsers,
    getPendingCompanies,
    getAllCompanies,
    approveUser,
    rejectUser,
    approveCompany,
    rejectCompany,
    deleteCompany,
    deleteUser,
    UserProfile,
    Company
} from '../lib/supabase-admin';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { useAppState } from '../hooks/useAppState';
import { formatMZN } from '../utils/helpers';

export default function SuperAdminDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'users' | 'companies'>('companies');
    const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
    const [pendingCompanies, setPendingCompanies] = useState<Company[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [allCompanies, setAllCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { stats: globalStats } = useAppState();

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const filteredUsers = useMemo(() => {
        return (allUsers || []).filter(u =>
            (u?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allUsers, searchTerm]);

    const filteredCompanies = useMemo(() => {
        return (allCompanies || []).filter(c =>
            (c?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allCompanies, searchTerm]);

    const fetchData = async (forceSearch = false) => {
        // Prevent loading show if we already have data (simple cache)
        if (!forceSearch && ((activeTab === 'companies' && allCompanies.length > 0) || (activeTab === 'users' && allUsers.length > 0))) {
            // Optional: Fetch in background without setting loading=true
            refreshDataInBackground();
            return;
        }

        setLoading(true);
        try {
            if (activeTab === 'companies') {
                const [pending, all] = await Promise.all([
                    getPendingCompanies(),
                    getAllCompanies()
                ]);
                setPendingCompanies(pending);
                setAllCompanies(all);
            } else {
                const [pending, all] = await Promise.all([
                    getPendingUsers(),
                    getAllUsers()
                ]);
                setPendingUsers(pending);
                setAllUsers(all);
            }
        } catch (error: any) {
            toast.error('Erro ao buscar dados: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshDataInBackground = async () => {
        try {
            if (activeTab === 'companies') {
                const [pending, all] = await Promise.all([
                    getPendingCompanies(),
                    getAllCompanies()
                ]);
                setPendingCompanies(pending);
                setAllCompanies(all);
            } else {
                const [pending, all] = await Promise.all([
                    getPendingUsers(),
                    getAllUsers()
                ]);
                setPendingUsers(pending);
                setAllUsers(all);
            }
        } catch (e) {
            console.error('Background refresh failed', e);
        }
    };

    const handleApproveCompany = async (id: string) => {
        try {
            await approveCompany(id);
            toast.success('Empresa aprovada com sucesso!');
            fetchData();
        } catch (error: any) {
            toast.error('Erro ao aprovar empresa: ' + error.message);
        }
    };

    const handleRejectCompany = async (id: string) => {
        if (!confirm('Tem certeza que deseja rejeitar esta empresa?')) return;
        try {
            await rejectCompany(id);
            toast.success('Empresa rejeitada.');
            fetchData();
        } catch (error: any) {
            toast.error('Erro ao rejeitar empresa: ' + error.message);
        }
    };

    const handleApproveUser = async (id: string) => {
        try {
            if (!user?.id) throw new Error('Administrador não autenticado.');
            await approveUser(id, user.id);
            toast.success('Usuário aprovado com sucesso!');
            fetchData();
        } catch (error: any) {
            toast.error('Erro ao aprovar usuário: ' + error.message);
        }
    };

    const handleRejectUser = async (id: string) => {
        if (!confirm('Tem certeza que deseja rejeitar este usuário?')) return;
        try {
            if (!user?.id) throw new Error('Administrador não autenticado.');
            await rejectUser(id, user.id);
            toast.success('Usuário rejeitado.');
            fetchData();
        } catch (error: any) {
            toast.error('Erro ao rejeitar usuário: ' + error.message);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('TEM CERTEZA? Isso excluirá permanentemente o usuário e seus dados.')) return;
        try {
            await deleteUser(id);
            toast.success('Usuário excluído com sucesso.');
            fetchData();
        } catch (error: any) {
            toast.error('Erro ao excluir usuário: ' + error.message);
        }
    };

    const handleDeleteCompany = async (id: string) => {
        if (!confirm('ATENÇÃO: Excluir a empresa removerá todos os dados vinculados a ela. Continuar?')) return;
        try {
            await deleteCompany(id);
            toast.success('Empresa excluída com sucesso.');
            fetchData();
        } catch (error: any) {
            toast.error('Erro ao excluir empresa: ' + error.message);
        }
    };

    const handleSystemReset = async () => {
        if (!confirm('PERIGO: Esta ação apagará TODOS os dados do sistema (exceto sua conta de Super Admin).')) return;
        if (!confirm('TEM CERTEZA ABSOLUTA? Esta ação não pode ser desfeita.')) return;

        const adminValidation = prompt('Digite "CONFIRMAR" para prosseguir:');
        if (adminValidation !== 'CONFIRMAR') {
            toast.error('Confirmação incorreta. Operação cancelada.');
            return;
        }

        setLoading(true);
        try {
            // 1. Delete all credits
            const { error: creditsError } = await supabase.from('credits').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
            if (creditsError) throw creditsError;

            // 2. Delete all clients
            const { error: clientsError } = await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
            if (clientsError) throw clientsError;

            // 3. Delete other companies (exclude admin's company if any)
            if (user?.id) {
                const { error: companiesError } = await supabase
                    .from('companies')
                    .delete()
                    .neq('owner_id', user.id);
                if (companiesError) throw companiesError;

                // 4. Delete other user profiles
                const { error: profilesError } = await supabase
                    .from('user_profiles')
                    .delete()
                    .neq('id', user.id);
                if (profilesError) throw profilesError;
            }

            toast.success('Sistema resetado com sucesso! Apenas sua conta admin foi mantida.');
            fetchData();
        } catch (error: any) {
            console.error('System reset error:', error);
            toast.error('Erro ao resetar sistema: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-[#1B3A2D]" />
                        Painel Super Admin
                    </h1>
                    <p className="text-gray-500 mt-1">Gerencie empresas e aprovações do sistema Koda.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 border border-gray-200 rounded-xl shadow-sm">
                    <input
                        type="search"
                        placeholder="Pesquisar..."
                        className="px-4 py-2 text-sm outline-none w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete="off"
                    />
                </div>
            </header>

            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('companies')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'companies'
                        ? 'border-[#1B3A2D] text-[#1B3A2D]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Empresas {pendingCompanies.length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {pendingCompanies.length}
                            </span>
                        )}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'users'
                        ? 'border-[#1B3A2D] text-[#1B3A2D]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Usuários</span> {(pendingUsers || []).length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {(pendingUsers || []).length}
                            </span>
                        )}
                    </div>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="animate-spin w-8 h-8 border-4 border-[#1B3A2D] border-t-transparent rounded-full mx-auto mb-4"></div>
                        Carregando dados...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {activeTab === 'companies' ? (
                            <>
                                {/* Desktop Table View */}
                                <table className="w-full text-left hidden md:table">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Empresa</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Dono</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Data</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredCompanies.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">Nenhuma empresa encontrada.</td>
                                            </tr>
                                        ) : (
                                            filteredCompanies.map((company) => (
                                                <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900"><span>{company?.name || '---'}</span></div>
                                                        <div className="text-xs text-gray-400 font-mono"><span>{company?.id}</span></div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900"><span>{company?.owner?.full_name || 'Desconhecido'}</span></div>
                                                        <div className="text-sm text-gray-500"><span>{company?.owner?.email || '---'}</span></div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${company.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                            company.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {company.status === 'approved' ? 'Aprovada' :
                                                                company.status === 'pending' ? 'Pendente' : 'Rejeitada'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {company.created_at ? new Date(company.created_at).toLocaleDateString('pt-BR') : '---'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {company.status === 'pending' && (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleApproveCompany(company.id)}
                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                    title="Aprovar"
                                                                >
                                                                    <CheckCircle2 className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRejectCompany(company.id)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Rejeitar"
                                                                >
                                                                    <XCircle className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {company.status !== 'pending' && (
                                                            <button
                                                                onClick={() => handleDeleteCompany(company.id)}
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Excluir Permanentemente"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>

                                {/* Mobile Card View */}
                                <div className="grid grid-cols-1 divide-y divide-gray-100 md:hidden">
                                    {filteredCompanies.length === 0 ? (
                                        <div className="p-12 text-center text-gray-500 italic">Nenhuma empresa encontrada.</div>
                                    ) : (
                                        filteredCompanies.map((company) => (
                                            <div key={company.id} className="p-4 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-bold text-gray-900">{company.name}</div>
                                                        <div className="text-xs text-gray-500">{company.created_at ? new Date(company.created_at).toLocaleDateString('pt-BR') : '---'}</div>
                                                    </div>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${company.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        company.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {company.status === 'approved' ? 'Aprovada' :
                                                            company.status === 'pending' ? 'Pendente' : 'Rejeitada'}
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    <div className="text-gray-600 font-medium">Dono: {company.owner?.full_name || 'Desconhecido'}</div>
                                                    <div className="text-gray-400">{company.owner?.email}</div>
                                                </div>
                                                {company.status === 'pending' && (
                                                    <div className="flex gap-2 pt-2">
                                                        <button
                                                            onClick={() => handleApproveCompany(company.id)}
                                                            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                                                        >
                                                            <Check className="w-4 h-4" /> Aprovar
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectCompany(company.id)}
                                                            className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-medium flex items-center justify-center gap-2 border border-red-100"
                                                        >
                                                            <X className="w-4 h-4" /> Rejeitar
                                                        </button>
                                                    </div>
                                                )}
                                                {company.status !== 'pending' && (
                                                    <button
                                                        onClick={() => handleDeleteCompany(company.id)}
                                                        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Excluir Empresa
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <table className="w-full text-left hidden md:table">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Usuário</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Empresa</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-900 uppercase tracking-wider text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">Nenhum usuário encontrado.</td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((userProfile) => (
                                                <tr key={userProfile.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                                                <span>{userProfile?.full_name?.charAt(0) || userProfile?.email?.charAt(0)?.toUpperCase()}</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900"><span>{userProfile?.full_name || 'Usuário'}</span></div>
                                                                <div className="text-sm text-gray-500"><span>{userProfile?.email || '---'}</span></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900"><span>{userProfile?.company?.name || 'Sem Empresa'}</span></div>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${userProfile.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                            userProfile.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {userProfile.status === 'approved' ? 'Aprovado' :
                                                                userProfile.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            {userProfile.role === 'super_admin' ? (
                                                                <Shield className="w-4 h-4 text-indigo-600" />
                                                            ) : userProfile.role === 'admin' ? (
                                                                <Shield className="w-4 h-4 text-[#1B3A2D]" />
                                                            ) : (
                                                                <Users className="w-4 h-4" />
                                                            )}
                                                            <span className="capitalize">{userProfile.role}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {userProfile.status === 'pending' && userProfile.role !== 'super_admin' && (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleApproveUser(userProfile.id)}
                                                                    className="bg-green-50 text-green-700 px-3 py-1 rounded-md hover:bg-green-100 transition-colors text-xs font-semibold flex items-center gap-1"
                                                                >
                                                                    <Check className="w-3 h-3" /> Aprovar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRejectUser(userProfile.id)}
                                                                    className="bg-red-50 text-red-700 px-3 py-1 rounded-md hover:bg-red-100 transition-colors text-xs font-semibold flex items-center gap-1"
                                                                >
                                                                    <X className="w-3 h-3" /> Rejeitar
                                                                </button>
                                                            </div>
                                                        )}
                                                        {userProfile.status !== 'pending' && userProfile.role !== 'super_admin' && (
                                                            <button
                                                                onClick={() => handleDeleteUser(userProfile.id)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                                title="Excluir Usuário"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>

                                {/* Mobile User Card View */}
                                <div className="grid grid-cols-1 divide-y divide-gray-100 md:hidden">
                                    {filteredUsers.length === 0 ? (
                                        <div className="p-12 text-center text-gray-500 italic">Nenhum usuário encontrado.</div>
                                    ) : (
                                        filteredUsers.map((userProfile) => (
                                            <div key={userProfile.id} className="p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold border border-gray-200">
                                                            {userProfile.full_name?.charAt(0) || userProfile.email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{userProfile.full_name || 'Usuário'}</div>
                                                            <div className="text-xs text-gray-500">{userProfile.email}</div>
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${userProfile.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        userProfile.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {userProfile.status === 'approved' ? 'Aprovado' :
                                                            userProfile.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between py-2 border-y border-gray-50">
                                                    <div className="text-xs text-gray-500">
                                                        Empresa: <span className="text-gray-900 font-medium"><span>{userProfile?.company?.name || 'Sem Empresa'}</span></span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                                                        <Shield className="w-3 h-3" /> <span>{userProfile?.role}</span>
                                                    </div>
                                                </div>
                                                {userProfile.status === 'pending' && userProfile.role !== 'super_admin' && (
                                                    <div className="flex gap-2 pt-1">
                                                        <button
                                                            onClick={() => handleApproveUser(userProfile.id)}
                                                            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-2"
                                                        >
                                                            <Check className="w-4 h-4" /> Aprovar
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectUser(userProfile.id)}
                                                            className="flex-1 bg-white text-red-600 py-2 rounded-lg font-medium text-xs flex items-center justify-center gap-2 border border-red-100 hover:bg-red-50"
                                                        >
                                                            <X className="w-4 h-4" /> Rejeitar
                                                        </button>
                                                    </div>
                                                )}
                                                {userProfile.status !== 'pending' && userProfile.role !== 'super_admin' && (
                                                    <button
                                                        onClick={() => handleDeleteUser(userProfile.id)}
                                                        className="w-full flex items-center justify-center gap-2 py-2 text-xs text-red-600 border border-red-100 rounded-lg hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Excluir Registro
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1B3A2D] p-6 rounded-2xl text-white shadow-lg shadow-green-900/20 flex items-center justify-between border border-white/10">
                    <div>
                        <p className="opacity-80 text-xs font-bold uppercase tracking-wider">Empresas Pendentes</p>
                        <h3 className="text-3xl font-bold mt-1">{pendingCompanies.length}</h3>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 opacity-80" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Usuários Aprovados</p>
                        <h3 className="text-3xl font-bold mt-1 text-green-600">
                            {(allUsers || []).filter(u => u?.status === 'approved').length}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Emprestado</p>
                        <h3 className="text-2xl font-bold mt-1 text-orange-600">
                            {formatMZN(globalStats.totalLent)}
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-1">Soma de todos os contratos</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-orange-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Arrecadado</p>
                        <h3 className="text-2xl font-bold mt-1 text-[#1B3A2D]">
                            {formatMZN(globalStats.totalCollected)}
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                            Saldo em Aberto: {formatMZN(globalStats.totalLent - globalStats.totalCollected)}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Empresas Ativas</p>
                        <h3 className="text-3xl font-bold mt-1">
                            {(allCompanies || []).filter(c => c?.status === 'approved').length}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-12 border border-red-200 rounded-2xl overflow-hidden bg-red-50">
                <div className="p-6 border-b border-red-200 bg-red-100 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h2 className="text-lg font-bold text-red-900">Zona de Perigo</h2>
                </div>
                <div className="p-6">
                    <p className="text-red-800 mb-4">
                        Ações aqui são irreversíveis. Tenha certeza absoluta do que está fazendo.
                    </p>
                    <button
                        onClick={handleSystemReset}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 flex items-center gap-2"
                    >
                        <Trash2 className="w-5 h-5" />
                        Zerar Todo o Sistema
                    </button>
                    <p className="text-xs text-red-600 mt-3">
                        * Isso apagará todas as empresas, clientes e usuários, mantendo apenas sua conta de Super Admin.
                        <br />
                        * Nota: Os logins (E-mail/Senha) devem ser removidos manualmente no painel do Supabase se desejar reutilizar os mesmos e-mails.
                    </p>
                </div>
            </div>
        </div>
    );
}
