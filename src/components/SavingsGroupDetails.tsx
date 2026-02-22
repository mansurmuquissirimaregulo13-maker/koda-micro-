import { useState, useMemo } from 'react';
import {
    Wallet,
    TrendingUp,
    History,
    ChevronLeft,
    Plus,
    CheckCircle,
    ArrowUpRight,
    Percent,
    AlertCircle
} from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { formatMZN, formatDate } from '../utils/helpers';
import { Modal } from '../components/Modal';

interface SavingsMemberDetailsProps {
    memberId: string;
    onBack: () => void;
}

export function SavingsGroupDetails({ memberId, onBack }: SavingsMemberDetailsProps) {
    const { clients } = useAppState() as any;
    const [activeTab, setActiveTab] = useState<'overview' | 'savings' | 'loans'>('overview');

    // Modal states
    const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

    // Find member from microcredit clients list
    const member = useMemo(() =>
        (clients as any[])?.find((c: any) => c.id === memberId),
        [clients, memberId]);

    // Mock data for now until we build the tables
    const totalSaved = 12500;
    const totalDebt = 8000;
    const interestRate = 10;

    const mockSavingsHistory = [
        { id: '1', date: '2024-03-01', amount: 5000, type: 'Poupança Mensal', status: 'approved' },
        { id: '2', date: '2024-02-01', amount: 5000, type: 'Poupança Mensal', status: 'approved' },
        { id: '3', date: '2024-01-01', amount: 2500, type: 'Poupança Inicial', status: 'approved' },
    ];

    const mockLoansHistory = [
        { id: '1', date: '2024-02-15', amount: 10000, amountToRepay: 11000, repaid: 3000, status: 'active', dueDate: '2024-05-15' }
    ];

    if (!member) return <div className="p-8 text-center text-gray-500">Membro não encontrado.</div>;

    const handleAddSaving = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        console.log("Adding saving:", Object.fromEntries(formData));
        setIsSavingModalOpen(false);
    };

    const handleRequestLoan = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        console.log("Requesting loan:", Object.fromEntries(formData));
        setIsLoanModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Navigation */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {member.name}
                    </h2>
                    <p className="text-sm text-gray-500">{member.phone || 'Sem contacto'} • BI: {member.bi}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => setIsSavingModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1B3A2D] text-white rounded-lg hover:bg-[#2D6A4F] transition-all text-sm font-medium shadow-sm">
                    <Plus className="w-4 h-4" />
                    Nova Poupança
                </button>
                <button
                    onClick={() => setIsLoanModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-sm">
                    <ArrowUpRight className="w-4 h-4" />
                    Novo Empréstimo
                </button>
            </div>

            {/* Koda Financial Profile Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-green-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet className="w-16 h-16 text-green-600" />
                    </div>
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Poupou Tanto</p>
                    <h3 className="text-2xl font-black text-gray-900">{formatMZN(totalSaved)}</h3>
                    <p className="text-xs text-gray-500 mt-2">Total acumulado na conta</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-16 h-16 text-red-600" />
                    </div>
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">A Dever</p>
                    <h3 className="text-2xl font-black text-gray-900">{formatMZN(totalDebt)}</h3>
                    <p className="text-xs text-gray-500 mt-2">Dívida de empréstimos ativos</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Percent className="w-16 h-16 text-blue-600" />
                    </div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Taxa de Juros</p>
                    <h3 className="text-2xl font-black text-gray-900">{interestRate}%</h3>
                    <p className="text-xs text-gray-500 mt-2">Taxa base definida para empréstimos</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Vai Pagar Tanto</p>
                    <h3 className="text-2xl font-black text-gray-900">{formatMZN(totalDebt * (1 + (interestRate / 100)))}</h3>
                    <p className="text-xs text-gray-500 mt-2">Total c/ juros a liquidar</p>
                </div>
            </div>

            {/* Main Content Tabs */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Visão Geral', icon: History },
                        { id: 'savings', label: 'Histórico de Poupança', icon: Wallet },
                        { id: 'loans', label: 'Empréstimos', icon: TrendingUp },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'text-[#1B3A2D] border-b-2 border-[#1B3A2D] bg-green-50/30'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}>
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <h4 className="font-bold text-gray-900 mb-4">Informação de Registo</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Bairro</p>
                                    <p className="font-medium">{member.neighborhood || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Estado</p>
                                    <p className="font-medium text-green-600 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Activo
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'savings' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900">Entradas de Poupança</h3>
                            {mockSavingsHistory.length > 0 ? (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {mockSavingsHistory.map((saving) => (
                                                <tr key={saving.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(saving.date)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{saving.type}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">+{formatMZN(saving.amount)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Efetuado</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500">Nenhuma poupança registada ainda.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'loans' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900">Empréstimos do Membro</h3>
                            </div>

                            {mockLoansHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {mockLoansHistory.map(loan => (
                                        <div key={loan.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-lg text-gray-900">{formatMZN(loan.amount)}</h4>
                                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                                        Vence a {formatDate(loan.dueDate)}
                                                    </p>
                                                </div>
                                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Em Curso
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                                                <div>
                                                    <span className="text-gray-500 block text-xs uppercase mb-1">Total a Pagar (c/ Juros)</span>
                                                    <span className="font-bold text-red-600">{formatMZN(loan.amountToRepay)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block text-xs uppercase mb-1">Já Pago</span>
                                                    <span className="font-bold text-green-600">{formatMZN(loan.repaid)}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                                                <button className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md">
                                                    Registar Pagamento
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-500">Nenhum empréstimo registado.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Saving Modal */}
            <Modal
                isOpen={isSavingModalOpen}
                onClose={() => setIsSavingModalOpen(false)}
                title="Nova Poupança (Depósito)">
                <form onSubmit={handleAddSaving} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Depósito (MZN)</label>
                        <input
                            type="number"
                            name="amount"
                            required
                            min="1"
                            placeholder="Ex: 5000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Descrição</label>
                        <textarea
                            name="notes"
                            rows={3}
                            placeholder="Opcional..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] outline-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsSavingModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#2D6A4F]">
                            Confirmar Depósito
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Request Loan Modal */}
            <Modal
                isOpen={isLoanModalOpen}
                onClose={() => setIsLoanModalOpen(false)}
                title="Novo Empréstimo Pessoal">
                <form onSubmit={handleRequestLoan} className="space-y-4">
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
                        <p><strong>Aviso:</strong> A taxa de juro configurada para este membro é de {interestRate}%.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Solicitado (MZN)</label>
                        <input
                            type="number"
                            name="amount"
                            required
                            min="100"
                            placeholder="Ex: 15000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prazo (Meses)</label>
                        <input
                            type="number"
                            name="termMonths"
                            required
                            min="1"
                            max="24"
                            defaultValue="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                            Aprovar Empréstimo
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
