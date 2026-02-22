import { useState, useMemo } from 'react';
import {
    Users,
    Plus,
    Trash2,
    AlertCircle,
    DollarSign,
    TrendingUp,
    ArrowDownRight,
    Calculator
} from 'lucide-react';
import { formatMZN } from '../utils/helpers';
import { toast } from 'sonner';

import { useAppState } from '../hooks/useAppState';

export function XitiquePage() {
    const {
        xitiqueRows,
        addXitiqueRow,
        updateXitiqueRow,
        deleteXitiqueRow
    } = useAppState();

    const [interestRate, setInterestRate] = useState(5); // % Juros acumulados
    const [loanInterestRate, setLoanInterestRate] = useState(10); // % Juros empréstimo

    // Member Name for New Member
    const [newMemberName, setNewMemberName] = useState('');

    const handleAddMember = () => {
        if (!newMemberName.trim()) {
            toast.error('O nome do membro é obrigatório');
            return;
        }
        addXitiqueRow({
            memberName: newMemberName,
            monthlyContribution: 0,
            interestAccumulated: 0,
            reimbursement: 0,
            loanThisMonth: 0,
            previousLoanBalance: 0
        });
        setNewMemberName('');
    };

    const handleRemoveMember = (id: string) => {
        deleteXitiqueRow(id);
    };

    const handleUpdateMember = (id: string, field: string, value: any) => {
        updateXitiqueRow(id, { [field]: value });
    };

    // Calculations per member
    const processedMembers = useMemo(() => {
        return xitiqueRows.map(m => {
            const accumulatedUntilMonth = m.monthlyContribution; // Simplified for now
            const totalAccumulatedDate = m.monthlyContribution + m.interestAccumulated;

            // Loan calculations
            const loanInterestNextMonth = m.loanThisMonth * (loanInterestRate / 100);
            const accumulatedLoanBalance = m.previousLoanBalance + m.loanThisMonth - m.reimbursement;

            // Reimbursement split
            const capitalReturned = Math.min(m.reimbursement, m.previousLoanBalance + m.loanThisMonth);
            const interestReturned = Math.max(0, m.reimbursement - (m.previousLoanBalance + m.loanThisMonth));

            return {
                ...m,
                name: m.memberName,
                accumulatedUntilMonth,
                totalAccumulatedDate,
                capitalReturned,
                interestReturned,
                accumulatedLoanBalance,
                loanInterestNextMonth
            };
        });
    }, [xitiqueRows, interestRate, loanInterestRate]);

    // Global Totals
    const totals = useMemo(() => {
        return processedMembers.reduce((acc, m) => ({
            contributions: acc.contributions + m.monthlyContribution,
            interest: acc.interest + m.interestAccumulated,
            accumulated: acc.accumulated + m.totalAccumulatedDate,
            reimbursements: acc.reimbursements + m.reimbursement,
            loans: acc.loans + m.loanThisMonth,
            previousBalance: acc.previousBalance + m.previousLoanBalance
        }), {
            contributions: 0,
            interest: 0,
            accumulated: 0,
            reimbursements: 0,
            loans: 0,
            previousBalance: 0
        });
    }, [processedMembers]);

    const cashBalance = totals.contributions + totals.reimbursements - totals.loans;

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 uppercase font-bold">Novo Membro</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                placeholder="Nome..."
                                className="w-full text-sm border-b border-gray-200 focus:border-blue-500 outline-none py-1"
                            />
                            <button onClick={handleAddMember} className="p-1 hover:bg-blue-50 text-blue-600 rounded">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-lg">
                        <Calculator className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 uppercase font-bold">Taxas de Juros (%)</label>
                        <div className="flex gap-4">
                            <div>
                                <span className="text-[10px] text-gray-400 block">Poupança</span>
                                <input
                                    type="number"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                    className="w-12 text-sm border-b border-gray-200 outline-none"
                                />
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 block">Empréstimo</span>
                                <input
                                    type="number"
                                    value={loanInterestRate}
                                    onChange={(e) => setLoanInterestRate(Number(e.target.value))}
                                    className="w-12 text-sm border-b border-gray-200 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-xl border shadow-sm flex  items-center gap-4 ${cashBalance < 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                    <div className={`p-3 rounded-lg ${cashBalance < 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                        <DollarSign className={`w-5 h-5 ${cashBalance < 0 ? 'text-red-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold">Saldo em Caixa</label>
                        <h4 className={`text-xl font-black ${cashBalance < 0 ? 'text-red-700' : 'text-green-700'}`}>
                            {formatMZN(cashBalance)}
                        </h4>
                        {cashBalance < 1000 && <p className="text-[10px] text-red-500 font-bold animate-pulse">CAIXA BAIXO!</p>}
                    </div>
                </div>
            </div>

            {/* Main Spreadsheet Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-100">Membro</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-blue-600 uppercase tracking-wider border-r border-gray-100">Contribuição (Mês)</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-100">Juros Acumulados</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-100">Val. Acumulado Mês</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-100 bg-green-50/50">Total Acumulado</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-orange-600 uppercase tracking-wider border-r border-gray-100">Reembolso</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-100">Juros Devolvidos</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-100">Sald. Emp. Ant.</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-red-600 uppercase tracking-wider border-r border-gray-100">Emp. do Mês</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-900 uppercase tracking-wider border-r border-gray-100 bg-red-50/50">Saldo Emp. Acum.</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Juros Prox. Mês</th>
                                <th className="px-4 py-3 border-l border-gray-100"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {processedMembers.map((m) => (
                                <tr key={m.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-4 py-3 font-medium text-gray-900 border-r border-gray-50">
                                        <input
                                            type="text"
                                            value={m.memberName}
                                            onChange={(e) => handleUpdateMember(m.id, 'memberName', e.target.value)}
                                            className="w-full bg-transparent outline-none focus:text-blue-600"
                                        />
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-50">
                                        <input
                                            type="number"
                                            value={m.monthlyContribution || ''}
                                            placeholder="0"
                                            onChange={(e) => handleUpdateMember(m.id, 'monthlyContribution', Math.max(0, Number(e.target.value)))}
                                            className="w-full bg-transparent outline-none font-bold text-blue-600"
                                        />
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-50">
                                        <input
                                            type="number"
                                            value={m.interestAccumulated || ''}
                                            placeholder="0"
                                            onChange={(e) => handleUpdateMember(m.id, 'interestAccumulated', Math.max(0, Number(e.target.value)))}
                                            className="w-full bg-transparent outline-none text-gray-600"
                                        />
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-50 text-gray-500 font-medium">
                                        {formatMZN(m.accumulatedUntilMonth)}
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-50 bg-green-50/20 font-black text-green-700">
                                        {formatMZN(m.totalAccumulatedDate)}
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-50">
                                        <input
                                            type="number"
                                            value={m.reimbursement || ''}
                                            placeholder="0"
                                            onChange={(e) => handleUpdateMember(m.id, 'reimbursement', Math.max(0, Number(e.target.value)))}
                                            className="w-full bg-transparent outline-none font-bold text-orange-600"
                                        />
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-50 text-gray-500 italic text-sm">
                                        {formatMZN(m.interestReturned)}
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-50">
                                        <input
                                            type="number"
                                            value={m.previousLoanBalance || ''}
                                            placeholder="0"
                                            onChange={(e) => handleUpdateMember(m.id, 'previousLoanBalance', Math.max(0, Number(e.target.value)))}
                                            className="w-full bg-transparent outline-none text-gray-600"
                                        />
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-50">
                                        <input
                                            type="number"
                                            value={m.loanThisMonth || ''}
                                            placeholder="0"
                                            onChange={(e) => handleUpdateMember(m.id, 'loanThisMonth', Math.max(0, Number(e.target.value)))}
                                            className="w-full bg-transparent outline-none font-bold text-red-600"
                                        />
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-50 bg-red-50/20 font-black text-red-700">
                                        {formatMZN(m.accumulatedLoanBalance)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 font-medium">
                                        {formatMZN(m.loanInterestNextMonth)}
                                    </td>
                                    <td className="px-2 py-3">
                                        <button
                                            onClick={() => handleRemoveMember(m.id)}
                                            className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {processedMembers.length === 0 && (
                                <tr>
                                    <td colSpan={12} className="px-4 py-10 text-center text-gray-400 italic">
                                        Nenhum membro adicionado à folha...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {/* Totals Footer */}
                        <tfoot className="bg-gray-100 font-black text-gray-900 border-t-2 border-gray-200 sticky bottom-0">
                            <tr>
                                <td className="px-4 py-4 text-xs uppercase border-r border-gray-200">Totais Globais</td>
                                <td className="px-4 py-4 text-blue-700 border-r border-gray-200">{formatMZN(totals.contributions)}</td>
                                <td className="px-4 py-4 text-gray-600 border-r border-gray-200">{formatMZN(totals.interest)}</td>
                                <td className="px-4 py-4 text-gray-600 border-r border-gray-200">{formatMZN(totals.contributions)}</td>
                                <td className="px-4 py-4 text-green-800 border-r border-gray-200">{formatMZN(totals.accumulated)}</td>
                                <td className="px-4 py-4 text-orange-700 border-r border-gray-200">{formatMZN(totals.reimbursements)}</td>
                                <td className="px-4 py-4 text-gray-600 border-r border-gray-200">-</td>
                                <td className="px-4 py-4 text-gray-600 border-r border-gray-200">{formatMZN(totals.previousBalance)}</td>
                                <td className="px-4 py-4 text-red-700 border-r border-gray-200">{formatMZN(totals.loans)}</td>
                                <td className="px-4 py-4 text-red-900 border-r border-gray-200">
                                    {formatMZN(totals.previousBalance + totals.loans - totals.reimbursements)}
                                </td>
                                <td className="px-4 py-4 bg-gray-200"></td>
                                <td className="px-4 py-4"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg"><TrendingUp className="w-4 h-4 text-blue-600" /></div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">CONTRIB.</span>
                    </div>
                    <p className="text-gray-500 text-xs mb-1">Total Poupado</p>
                    <h5 className="text-lg font-bold text-gray-900">{formatMZN(totals.accumulated)}</h5>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-red-50 rounded-lg"><ArrowDownRight className="w-4 h-4 text-red-600" /></div>
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">EMPRÉST.</span>
                    </div>
                    <p className="text-gray-500 text-xs mb-1">Dívida Total em Aberto</p>
                    <h5 className="text-lg font-bold text-gray-900">{formatMZN(totals.previousBalance + totals.loans - totals.reimbursements)}</h5>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-emerald-50 rounded-lg"><Plus className="w-4 h-4 text-emerald-600" /></div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ENTRADAS</span>
                    </div>
                    <p className="text-gray-500 text-xs mb-1">Total Entradas (Contr+Reemb)</p>
                    <h5 className="text-lg font-bold text-gray-900">{formatMZN(totals.contributions + totals.reimbursements)}</h5>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-purple-50 rounded-lg"><AlertCircle className="w-4 h-4 text-purple-600" /></div>
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">ALERTA</span>
                    </div>
                    <p className="text-gray-500 text-xs mb-1">Fundo Disponível (Net)</p>
                    <h5 className="text-lg font-bold text-gray-900">{formatMZN(cashBalance)}</h5>
                </div>
            </div>

            {/* Legend / Tips */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-xs">
                <p className="flex items-center gap-2 font-bold mb-1">
                    <AlertCircle className="w-4 h-4" />
                    Dica de Uso:
                </p>
                <p>Esta folha funciona como uma planilha inteligente. Podes editar os valores diretamente nas células azuis e cor-de-laranja. Os totais e saldos são recalculados instantaneamente.</p>
            </div>
        </div>
    );
}
