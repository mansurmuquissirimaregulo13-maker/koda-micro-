import React, { useState } from 'react';
import { History } from 'lucide-react';
import { Credit, Client, Payment } from '../types';
import { formatMZN, formatDate } from '../utils/helpers';
import { useAppState } from '../hooks/useAppState';

interface PaymentFormProps {
  credit: Credit;
  client: Client;
  onSubmit: (data: Omit<Payment, 'id'>) => void;
  onCancel: () => void;
}

export function PaymentForm({
  credit,
  client,
  onSubmit,
  onCancel
}: PaymentFormProps) {
  const { getCreditPayments } = useAppState();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'partial' | 'total'>('partial');
  const [description, setDescription] = useState('');

  const existingPayments = getCreditPayments(credit.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      creditId: credit.id,
      amount: parseFloat(amount),
      date,
      type,
      description
    });
  };

  const handleSetAmount = (val: number) => {
    setAmount(Math.min(val, credit.remainingAmount).toString());
    if (val >= credit.remainingAmount) setType('total');
    else setType('partial');
  };

  const handleSetFullAmount = () => {
    setAmount(credit.remainingAmount.toString());
    setType('total');
    setDescription('Quitação total do crédito');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Side: Form */}
      <div className="flex-1 space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Cliente</span>
            <span className="font-medium text-gray-900">{client.name}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Valor Total Devido</span>
            <span className="font-medium text-gray-900">
              {formatMZN(credit.totalToPay)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Restante a Pagar</span>
            <span className="font-bold text-[#1B3A2D] text-lg">
              {formatMZN(credit.remainingAmount)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Valor do Pagamento (MZN)
            </label>
            <div className="flex gap-2">
              <input
                required
                type="number"
                min="1"
                max={credit.remainingAmount}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none font-bold text-gray-900"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
              <button
                type="button"
                onClick={handleSetFullAmount}
                className="whitespace-nowrap px-3 py-2 text-xs font-medium text-[#1B3A2D] bg-[#D8F3DC] rounded-lg hover:bg-[#b7e4c0]"
              >
                Pagar Total
              </button>
            </div>
            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-2 mt-2">
              {[1000, 2000, 5000, 10000, 20000].map(
                (val) =>
                  val <= credit.remainingAmount && (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSetAmount(val)}
                      className="px-2 py-1 text-xs border border-gray-200 rounded-full hover:border-[#40916C] hover:text-[#40916C] transition-colors"
                    >
                      {formatMZN(val)}
                    </button>
                  )
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Descrição / Nota
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Pagou via M-Pesa, Pagamento parcial..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Data do Pagamento
            </label>
            <input
              required
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40916C] focus:border-transparent outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Tipo de Pagamento
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="partial"
                  checked={type === 'partial'}
                  onChange={() => setType('partial')}
                  className="text-[#1B3A2D] focus:ring-[#1B3A2D]"
                />
                <span className="text-sm text-gray-700">Parcial</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="total"
                  checked={type === 'total'}
                  onChange={() => setType('total')}
                  className="text-[#1B3A2D] focus:ring-[#1B3A2D]"
                />
                <span className="text-sm text-gray-700">Total (Quitação)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#2D6A4F]"
            >
              Registrar Pagamento
            </button>
          </div>
        </form>
      </div>

      {/* Right Side: History */}
      <div className="w-full md:w-72 border-l border-gray-100 pl-6 md:block">
        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-gray-500" />
          Histórico de Pagamentos
        </h4>

        <div className="space-y-6 relative">
          {/* Vertical Line */}
          <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

          {existingPayments.length > 0 ? (
            existingPayments.map((payment) => (
              <div key={payment.id} className="relative pl-6">
                <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-green-100 border-2 border-green-500"></div>
                <div className="text-xs text-gray-500 mb-0.5">
                  {formatDate(payment.date)}
                </div>
                <div className="font-bold text-gray-900 text-sm">
                  +{formatMZN(payment.amount)}
                </div>
                {payment.description && (
                  <div className="text-xs text-gray-600 mt-0.5 italic">
                    {payment.description}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 italic pl-6">
              Nenhum pagamento registrado ainda.
            </div>
          )}

          {/* Start Point */}
          <div className="relative pl-6">
            <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-gray-200 border-2 border-gray-400"></div>
            <div className="text-xs text-gray-500 mb-0.5">
              {formatDate(credit.startDate)}
            </div>
            <div className="font-medium text-gray-700 text-xs">
              Crédito Iniciado
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}