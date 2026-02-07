import { useState, useEffect, useMemo } from 'react';
import {
    Users,
    Building2,
    CheckCircle2,
    XCircle,
    Shield,
    Check,
    X,
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
    UserProfile,
    Company
} from '../lib/supabase-admin';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export default function SuperAdminDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'users' | 'companies'>('companies');
    const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
    const [pendingCompanies, setPendingCompanies] = useState<Company[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [allCompanies, setAllCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const filteredUsers = useMemo(() => {
        return allUsers.filter(u =>
            u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allUsers, searchTerm]);

    const filteredCompanies = useMemo(() => {
        return allCompanies.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allCompanies, searchTerm]);

    const fetchData = async () => {
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
            await approveUser(id, user!.id);
            toast.success('Usuário aprovado com sucesso!');
            fetchData();
        } catch (error: any) {
            toast.error('Erro ao aprovar usuário: ' + error.message);
        }
    };

    const handleRejectUser = async (id: string) => {
        if (!confirm('Tem certeza que deseja rejeitar este usuário?')) return;
        try {
            await rejectUser(id, user!.id);
            toast.success('Usuário rejeitado.');
            fetchData();
        } catch (error: any) {
            toast.error('Erro ao rejeitar usuário: ' + error.message);
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
                        Usuários {pendingUsers.length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {pendingUsers.length}
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
                            <table className="w-full text-left">
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
                                                    <div className="font-medium text-gray-900">{company.name}</div>
                                                    <div className="text-xs text-gray-400 font-mono">{company.id}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{company.owner?.full_name || 'Desconhecido'}</div>
                                                    <div className="text-sm text-gray-500">{company.owner?.email}</div>
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
                                                    {new Date(company.created_at).toLocaleDateString('pt-BR')}
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
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left">
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
                                                            {userProfile.full_name?.charAt(0) || userProfile.email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{userProfile.full_name || 'Usuário'}</div>
                                                            <div className="text-sm text-gray-500">{userProfile.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{userProfile.company?.name || 'Sem Empresa'}</div>
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
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1B3A2D] p-6 rounded-xl text-white shadow-sm flex items-center justify-between">
                    <div>
                        <p className="opacity-80 text-sm">Empresas Pendentes</p>
                        <h3 className="text-3xl font-bold mt-1">{pendingCompanies.length}</h3>
                    </div>
                    <Building2 className="w-10 h-10 opacity-20" />
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Total de Usuários</p>
                        <h3 className="text-3xl font-bold mt-1">{allUsers.length}</h3>
                    </div>
                    <Users className="w-10 h-10 text-gray-100" />
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Empresas Ativas</p>
                        <h3 className="text-3xl font-bold mt-1">
                            {allCompanies.filter(c => c.status === 'approved').length}
                        </h3>
                    </div>
                    <CheckCircle2 className="w-10 h-10 text-gray-100" />
                </div>
            </div>
        </div>
    );
}
