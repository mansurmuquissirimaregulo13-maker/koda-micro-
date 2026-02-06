import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Credit, Client } from '../utils/mockData';
import { formatMZN, getDaysOverdue } from '../utils/helpers';
interface AlertsPanelProps {
  overdueCredits: Credit[];
  clients: Client[];
}
export function AlertsPanel({ overdueCredits, clients }: AlertsPanelProps) {
  const getSeverity = (days: number) => {
    if (days <= 7)
    return {
      color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      label: 'Leve'
    };
    if (days <= 30)
    return {
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      label: 'Moderado'
    };
    return {
      color: 'bg-red-50 border-red-200 text-red-700 font-semibold',
      label: 'Crítico'
    };
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[#1B1B1B] font-montserrat flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Alertas de Atraso
        </h3>
        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
          {overdueCredits.length}
        </span>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {overdueCredits.length > 0 ?
        overdueCredits.map((credit) => {
          const client = clients.find((c) => c.id === credit.clientId);
          const days = getDaysOverdue(credit.endDate);
          const severity = getSeverity(days);
          return (
            <div
              key={credit.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${severity.color}`}>

                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {client?.name || 'Cliente Desconhecido'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium">
                      {days} dias de atraso
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-white/50 rounded-full border border-black/5 uppercase tracking-wide">
                      {severity.label}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">
                    {formatMZN(credit.remainingAmount)}
                  </p>
                  <p className="text-xs opacity-75">Devido</p>
                </div>
              </div>);

        }) :

        <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p>Nenhum crédito em atraso.</p>
            <p className="text-xs mt-1">Ótimo trabalho!</p>
          </div>
        }
      </div>
    </div>);

}