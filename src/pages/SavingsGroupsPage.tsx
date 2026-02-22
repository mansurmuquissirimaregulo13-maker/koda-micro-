import { useState } from 'react';
import {
    Users,
    TrendingUp,
    Target,
    Search,
    ArrowRight,
    Wallet
} from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { formatMZN, formatDate } from '../utils/helpers';
import { SavingsGroupDetails } from '../components/SavingsGroupDetails';

export function SavingsGroupsPage() {
    const { clients } = useAppState() as any;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [view, setView] = useState<'list' | 'details'>('list');

    // Mapear os Clientes (do microcrédito) para o conceito de Membros de Poupança
    const membersList = clients || [];

    // Filter members
    const filteredMembers = membersList.filter((m: any) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.bi && m.bi.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Mock calculations that will eventually be pulled from individual real transactions (credits/savings)
    const mockedTotalSavedByAll = membersList.length * 12500;
    const mockedTotalGivenInLoans = membersList.length * 8000;

    if (view === 'details' && selectedMember) {
        return (
            <SavingsGroupDetails
                memberId={selectedMember.id} // Passar o ID do membro em vez de GroupId
                onBack={() => {
                    setView('list');
                    setSelectedMember(null);
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
                        Gerencie as poupanças e empréstimos individuais de cada membro.
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total de Membros</p>
                        <p className="text-2xl font-black text-gray-900">
                            {membersList.length}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Poupado (Global)</p>
                        <p className="text-2xl font-black text-gray-900">{formatMZN(mockedTotalSavedByAll)}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Acumulado em Empréstimos</p>
                        <p className="text-2xl font-black text-gray-900">{formatMZN(mockedTotalGivenInLoans)}</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#40916C] transition-colors" />
                <input
                    type="text"
                    placeholder="Procurar membro pelo nome ou BI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#40916C] shadow-sm transition-all"
                />
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(filteredMembers as any[]).map((member: any) => {
                    // Mock data for the cards, logic will move to the details view later
                    const memberTotalSaved = 0;
                    const memberTotalDebt = 0;

                    return (
                        <div
                            key={member.id}
                            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    {member.photo ? (
                                        <img src={member.photo} alt={member.name} className="w-12 h-12 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-700 font-bold text-xl">
                                            {member.name.substring(0, 1)}
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight group-hover:text-[#40916C] transition-colors">
                                    {member.name}
                                </h3>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                                    {member.phone || 'Sem contacto telefónico'}
                                </p>

                                <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-50">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Poupou Tanto</span>
                                        <p className="text-sm font-bold text-green-600 flex items-center gap-1">
                                            <Wallet className="w-3 h-3" />
                                            {formatMZN(memberTotalSaved)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-400 uppercase">A Dever</span>
                                        <p className="text-sm font-bold text-red-600 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            {formatMZN(memberTotalDebt)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Registado em</p>
                                    <p className="text-xs font-bold text-gray-700">{formatDate(member.registeredAt || new Date().toISOString())}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedMember(member);
                                        setView('details');
                                    }}
                                    className="flex items-center gap-2 text-xs font-bold text-[#1B3A2D] hover:underline">
                                    Ver Ficha
                                    <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {filteredMembers.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum membro encontrado</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">
                            Não existem membros de poupança que correspondam à sua pesquisa.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
