import { useEffect, useState } from 'react';
import { UserCheck, UserX, Users, Clock, CheckCircle, XCircle, Search, Shield } from 'lucide-react';
import { getPendingUsers, getAllUsers, approveUser, rejectUser, UserProfile } from '../lib/supabase-admin';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const { user, profile, isSystemAdmin } = useAuth();

    useEffect(() => {
        loadUsers();
    }, [filter, profile?.company_id]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            // Se for Admin do Sistema, não passa companyId para ver todos
            const companyId = isSystemAdmin ? undefined : (profile?.company_id || undefined);
            const data = filter === 'pending' ? await getPendingUsers(companyId) : await getAllUsers(companyId);
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: string) => {
        try {
            await approveUser(userId, user!.id);
            toast.success('Usuário aprovado com sucesso!');
            loadUsers();
        } catch (error) {
            console.error('Error approving user:', error);
            toast.error('Erro ao aprovar usuário');
        }
    };

    const handleReject = async (userId: string) => {
        try {
            await rejectUser(userId, user!.id);
            toast.success('Usuário rejeitado');
            loadUsers();
        } catch (error) {
            console.error('Error rejecting user:', error);
            toast.error('Erro ao rejeitar usuário');
        }
    };

    const filteredUsers = (users || []).filter((u) => {
        const matchesFilter = filter === 'all' || u.status === filter;
        const matchesSearch =
            (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const stats = {
        total: users.length,
        pending: users.filter((u) => u.status === 'pending').length,
        approved: users.filter((u) => u.status === 'approved').length,
        rejected: users.filter((u) => u.status === 'rejected').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[#1B1B1B]"><span>Gerenciar Usuários</span></h1>
                    <p className="text-sm text-gray-500"><span>Aprovar ou rejeitar solicitações de acesso</span></p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="text-2xl font-bold text-[#1B1B1B]">{stats.total}</p>
                            <p className="text-xs text-gray-500">Total</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-amber-500" />
                        <div>
                            <p className="text-2xl font-bold text-[#1B1B1B]">{stats.pending}</p>
                            <p className="text-xs text-gray-500">Pendentes</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <div>
                            <p className="text-2xl font-bold text-[#1B1B1B]">{stats.approved}</p>
                            <p className="text-xs text-gray-500">Aprovados</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-8 h-8 text-red-500" />
                        <div>
                            <p className="text-2xl font-bold text-[#1B1B1B]">{stats.rejected}</p>
                            <p className="text-xs text-gray-500">Rejeitados</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex gap-2 flex-wrap">
                        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${filter === f
                                    ? 'bg-[#1B3A2D] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {f === 'all' && 'Todos'}
                                {f === 'pending' && 'Pendentes'}
                                {f === 'approved' && 'Aprovados'}
                                {f === 'rejected' && 'Rejeitados'}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B3A2D] mx-auto"></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Nenhum usuário encontrado
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuário
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-br from-[#40916C] to-[#2D6A4F] rounded-full flex items-center justify-center text-white font-semibold">
                                                    <span>{user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        <span>{user.full_name || 'Sem nome'}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        <span>{user.role === 'admin' ? 'Administrador' : 'Usuário'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900"><span>{user.email}</span></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'approved'
                                                    ? 'bg-green-100 text-green-800'
                                                    : user.status === 'pending'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                <span>{user.status === 'approved' && 'Aprovado'}</span>
                                                <span>{user.status === 'pending' && 'Pendente'}</span>
                                                <span>{user.status === 'rejected' && 'Rejeitado'}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {user.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(user.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium"
                                                    >
                                                        <UserCheck className="w-4 h-4" />
                                                        Aprovar
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(user.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium"
                                                    >
                                                        <UserX className="w-4 h-4" />
                                                        Rejeitar
                                                    </button>
                                                </div>
                                            )}
                                            {user.status !== 'pending' && (
                                                <span className="text-gray-400 text-xs">
                                                    {user.status === 'approved' ? 'Já aprovado' : 'Já rejeitado'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
