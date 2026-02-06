import React, { useEffect, useState } from 'react';
import { Client, Credit } from '../utils/mockData';
import {
  calculateInterest,
  formatMZN,
  calculateInstallmentValue } from
'../utils/helpers';
import { Calculator, Calendar, Percent, DollarSign } from 'lucide-react';
interface CreditFormProps {
  clients: Client[];
  onSubmit: (data: Omit<Credit, 'id' | 'remainingAmount' | 'status'>) => void;
  onCancel: () => void;
}
export function CreditForm({ clients, onSubmit, onCancel }: CreditFormProps) {
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    interestRate: '15',
    termMonths: '1',
    numberOfInstallments: '1',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [calculations, setCalculations] = useState({
    endDate: '',
    totalToPay: 0,
    interestAmount: 0,
    installmentValue: 0
  });
  useEffect(() => {
    const amount = parseFloat(formData.amount) || 0;
    const rate = parseFloat(formData.interestRate) || 0;
    const months = parseInt(formData.termMonths) || 1;
    const installments = parseInt(formData.numberOfInstallments) || 1;
    const start = new Date(formData.startDate);
    // Calculate end date
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    const endDateStr = end.toISOString().split('T')[0];
    // Calculate totals
    const total = calculateInterest(amount, rate, months);
    const interestAmount = total - amount;
    const installmentValue = calculateInstallmentValue(total, installments);
    setCalculations({
      endDate: endDateStr,
      totalToPay: total,
      interestAmount,
      installmentValue
    });
  }, [
  formData.amount,
  formData.interestRate,
  formData.termMonths,
  formData.numberOfInstallments,
  formData.startDate]
  );
  // Auto-update installments when term changes if they were same
  const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = e.target.value;
    setFormData((prev) => ({
      ...prev,
      termMonths: newTerm,
      // If installments was same as term, update it too, otherwise keep custom
      numberOfInstallments:
      prev.termMonths === prev.numberOfInstallments ?
      newTerm :
      prev.numberOfInstallments
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      clientId: formData.clientId,
      amount: parseFloat(formData.amount),
      interestRate: parseFloat(formData.interestRate),
      termMonths: parseInt(formData.termMonths),
      numberOfInstallments: parseInt(formData.numberOfInstallments),
      startDate: formData.startDate,
      endDate: calculations.endDate,
      totalToPay: calculations.totalToPay,
      notes: formData.notes
    });
  };
  const interestPercentage =
  calculations.totalToPay > 0 ?
  calculations.interestAmount / calculations.totalToPay * 100 :
  0;
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-gray-700">Cliente</label>
          <select
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none bg-white"
            value={formData.clientId}
            onChange={(e) =>
            setFormData({
              ...formData,
              clientId: e.target.value
            })
            }>

            <option value="">Selecione um cliente...</option>
            {clients.map((client) =>
            <option key={client.id} value={client.id}>
                {client.name} - {client.bi}
              </option>
            )}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" /> Valor do Crédito
            (MZN)
          </label>
          <input
            required
            type="number"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none font-bold text-gray-900"
            value={formData.amount}
            onChange={(e) =>
            setFormData({
              ...formData,
              amount: e.target.value
            })
            }
            placeholder="0.00" />

        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Percent className="w-4 h-4 text-gray-400" /> Taxa de Juros (%)
          </label>
          <input
            required
            type="number"
            min="0"
            step="0.1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none"
            value={formData.interestRate}
            onChange={(e) =>
            setFormData({
              ...formData,
              interestRate: e.target.value
            })
            } />

        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" /> Prazo (Meses)
          </label>
          <input
            required
            type="number"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none"
            value={formData.termMonths}
            onChange={handleTermChange} />

        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-gray-400" /> Nº de Parcelas
          </label>
          <input
            required
            type="number"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none"
            value={formData.numberOfInstallments}
            onChange={(e) =>
            setFormData({
              ...formData,
              numberOfInstallments: e.target.value
            })
            } />

        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Data de Início
          </label>
          <input
            required
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none"
            value={formData.startDate}
            onChange={(e) =>
            setFormData({
              ...formData,
              startDate: e.target.value
            })
            } />

        </div>

        <div className="col-span-1 md:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#1B3A2D]" />
            Resumo da Simulação
          </h4>

          {/* Visual Proportion Bar */}
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-6 flex">
            <div
              className="h-full bg-[#40916C]"
              style={{
                width: `${100 - interestPercentage}%`
              }}
              title="Capital">
            </div>
            <div
              className="h-full bg-amber-400"
              style={{
                width: `${interestPercentage}%`
              }}
              title="Juros">
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">
                Capital
              </span>
              <span className="font-semibold text-gray-900 text-lg">
                {formatMZN(parseFloat(formData.amount) || 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">
                Juros ({formData.interestRate}%)
              </span>
              <span className="font-semibold text-amber-600 text-lg">
                +{formatMZN(calculations.interestAmount)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">
                Total a Pagar
              </span>
              <span className="font-bold text-[#1B3A2D] text-xl">
                {formatMZN(calculations.totalToPay)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">
                Por Parcela ({formData.numberOfInstallments}x)
              </span>
              <span className="font-medium text-gray-900 text-lg">
                {formatMZN(calculations.installmentValue)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
            <span>Vencimento Final: {calculations.endDate}</span>
            <span>
              Lucro Estimado: {formatMZN(calculations.interestAmount)}
            </span>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Observações
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none"
            rows={2}
            value={formData.notes}
            onChange={(e) =>
            setFormData({
              ...formData,
              notes: e.target.value
            })
            }
            placeholder="Detalhes adicionais..." />

        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">

          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#2D6A4F]">

          Criar Crédito
        </button>
      </div>
    </form>);

}