import { useState } from 'react';
import {
  Plus,
  Eye,
  DollarSign,
  Filter,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { CreditForm } from '../components/CreditForm';
import { PaymentForm } from '../components/PaymentForm';
import { CreditStatusBadge } from '../components/CreditStatusBadge';
import { useAppState } from '../hooks/useAppState';
import {
  formatMZN,
  formatDate,
  generateInstallmentSchedule,
  getDaysOverdue
} from '../utils/helpers';
import { Credit, CreditStatus } from '../types';

interface CreditsPageProps {
  searchTerm?: string;
}

export function CreditsPage({ searchTerm = '' }: CreditsPageProps) {
  const {
    credits,
    clients,
    addCredit,
    addPayment,
    updateCreditStatus,
    getCreditWithDetails
  } = useAppState();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [detailedCredit, setDetailedCredit] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<CreditStatus | 'all'>('all');

  const handleCreateCredit = (data: any) => {
    addCredit(data);
    setIsCreateModalOpen(false);
  };

  const handlePayment = (data: any) => {
    addPayment(data);
    setIsPaymentModalOpen(false);
    setSelectedCredit(null);
    if (detailedCredit) {
      const updated = getCreditWithDetails(detailedCredit.id);
      setDetailedCredit(updated);
    }
  };

  const openPaymentModal = (credit: Credit) => {
    setSelectedCredit(credit);
    setIsPaymentModalOpen(true);
  };

  const openDetailModal = (credit: Credit) => {
    const details = getCreditWithDetails(credit.id);
    setDetailedCredit(details);
    setIsDetailModalOpen(true);
  };

  const filteredCredits = credits.filter(credit => {
    const client = clients.find(c => c.id === credit.clientId);
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credit.amount.toString().includes(searchTerm) ||
      credit.totalToPay.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || credit.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1B1B1B] font-montserrat">
            Gestão de Créditos
          </h2>
          <p className="text-gray-500 text-sm">
            Controle de empréstimos e pagamentos.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-[#1B3A2D] text-white rounded-lg font-medium hover:bg-[#2D6A4F] transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20">
          <Plus className="w-4 h-4" />
          Novo Crédito
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtrar por Status:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#40916C] outline-none">
          <option value="all">Todos</option>
          <option value="pending">Pendente</option>
          <option value="active">Aprovado / Ativo</option>
          <option value="paid">Pago</option>
          <option value="overdue">Atrasado</option>
          <option value="rejected">Rejeitado</option>
        </select>
      </div>

      <DataTable
        data={filteredCredits}
        searchPlaceholder="Buscar por valor ou status..."
        columns={[
          {
            header: 'Cliente',
            accessor: (credit) => {
              const client = clients.find((c) => c.id === credit.clientId);
              return (
                <span className="font-medium text-gray-900">
                  {client?.name || 'Desconhecido'}
                </span>
              );
            }
          },
          {
            header: 'Valor Total',
            accessor: (credit) => formatMZN(credit.totalToPay)
          },
          {
            header: 'Juros',
            accessor: (credit) => `${credit.interestRate}%`
          },
          {
            header: 'Prazo',
            accessor: (credit) => `${credit.termMonths} meses`
          },
          {
            header: 'Restante',
            accessor: (credit) => (
              <span
                className={`font-bold ${credit.status === 'overdue' ? 'text-red-600' : 'text-[#1B3A2D]'}`}>
                {formatMZN(credit.remainingAmount)}
              </span>
            )
          },
          {
            header: 'Status',
            accessor: (credit) => <CreditStatusBadge status={credit.status} />
          },
          {
            header: 'Vencimento',
            accessor: (credit) => formatDate(credit.endDate)
          }]
        }
        actions={(credit) => (
          <div className="flex items-center justify-end gap-3">
            <select
              value={credit.status}
              onChange={(e) =>
                updateCreditStatus(credit.id, e.target.value as CreditStatus)
              }
              onClick={(e) => e.stopPropagation()}
              className="text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50 focus:ring-1 focus:ring-[#40916C] outline-none cursor-pointer">
              <option value="pending">Pendente</option>
              <option value="active">Aprovado</option>
              <option value="paid">Pago</option>
              <option value="overdue">Atrasado</option>
              <option value="rejected">Rejeitado</option>
            </select>

            {credit.status !== 'paid' && (
              <button
                onClick={() => openPaymentModal(credit)}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                title="Registrar Pagamento">
                <DollarSign className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => openDetailModal(credit)}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Ver Detalhes">
              <Eye className="w-4 h-4" />
            </button>
          </div>
        )} />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Crédito">
        <CreditForm
          clients={clients}
          onSubmit={handleCreateCredit}
          onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Registrar Pagamento">
        {selectedCredit && (
          <PaymentForm
            credit={selectedCredit}
            client={clients.find((c) => c.id === selectedCredit.clientId)!}
            onSubmit={handlePayment}
            onCancel={() => setIsPaymentModalOpen(false)} />
        )}
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalhes do Crédito"
        size="lg">
        {detailedCredit && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-6 border-b border-gray-100">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {detailedCredit.client?.name}
                </h3>
                <p className="text-sm text-gray-500">
                  ID: {detailedCredit.id} • Iniciado em{' '}
                  {formatDate(detailedCredit.startDate)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <CreditStatusBadge status={detailedCredit.status} />
                <div className="text-right">
                  <p className="text-xs text-gray-500">Vencimento</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(detailedCredit.endDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">
                  Capital Original
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatMZN(detailedCredit.debtInfo.originalAmount)}
                </p>
              </div>
              <div className="p-5 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-xs text-amber-600 font-bold uppercase tracking-wide mb-1">
                  Juros Acumulados ({detailedCredit.interestRate}%)
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  {formatMZN(detailedCredit.debtInfo.interestAmount)}
                </p>
              </div>
              <div className="p-5 rounded-xl bg-green-50 border border-green-100">
                <p className="text-xs text-green-600 font-bold uppercase tracking-wide mb-1">
                  Total com Juros
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatMZN(detailedCredit.debtInfo.totalWithInterest)}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">
                  Pago:{' '}
                  <span className="font-semibold text-green-600">
                    {formatMZN(detailedCredit.debtInfo.totalPaid)}
                  </span>
                </span>
                <span className="text-gray-600">
                  Progresso:{' '}
                  <span className="font-semibold">
                    {Math.round(
                      (detailedCredit.debtInfo.totalPaid /
                        detailedCredit.debtInfo.totalWithInterest) *
                      100
                    )}
                    %
                  </span>
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#40916C] transition-all duration-500"
                  style={{
                    width: `${(detailedCredit.debtInfo.totalPaid / detailedCredit.debtInfo.totalWithInterest) * 100}%`
                  }}>
                </div>
              </div>
            </div>

            <div
              className={`p-6 rounded-xl border-2 ${detailedCredit.status === 'overdue' ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                    Valor Atual da Dívida
                  </h4>
                  <p
                    className={`text-4xl font-bold mt-1 ${detailedCredit.status === 'overdue' ? 'text-red-600' : 'text-[#1B3A2D]'}`}>
                    {formatMZN(detailedCredit.remainingAmount)}
                  </p>
                </div>
                {detailedCredit.status === 'overdue' && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold">
                    <AlertTriangle className="w-5 h-5" />
                    {getDaysOverdue(detailedCredit.endDate)} dias de atraso
                  </div>
                )}
                {detailedCredit.status === 'paid' && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold">
                    <CheckCircle className="w-5 h-5" />
                    Crédito Quitado
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gray-500" />
                  Histórico de Pagamentos
                </h4>
                <div className="space-y-6 relative pl-2">
                  <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                  {detailedCredit.payments.length > 0 ? (
                    detailedCredit.payments.map((payment: any) => (
                      <div key={payment.id} className="relative pl-8">
                        <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-green-100 border-4 border-white ring-2 ring-green-500"></div>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-900">
                              +{formatMZN(payment.amount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(payment.date)}
                            </p>
                            {payment.description && (
                              <p className="text-sm text-gray-600 mt-1 italic">
                                "{payment.description}"
                              </p>
                            )}
                          </div>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md capitalize">
                            {payment.type === 'total' ? 'Quitação' : 'Parcial'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="relative pl-8 text-gray-500 italic text-sm">
                      Nenhum pagamento registrado ainda.
                    </div>
                  )}

                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-gray-200 border-4 border-white ring-2 ring-gray-400"></div>
                    <p className="font-medium text-gray-900">
                      Crédito Iniciado
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(detailedCredit.startDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  Plano de Parcelas
                </h4>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 font-medium text-gray-600">#</th>
                        <th className="px-4 py-3 font-medium text-gray-600">Vencimento</th>
                        <th className="px-4 py-3 font-medium text-gray-600 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {generateInstallmentSchedule(
                        detailedCredit.totalToPay,
                        detailedCredit.numberOfInstallments ||
                        detailedCredit.termMonths,
                        detailedCredit.startDate
                      ).map((inst: any) => (
                        <tr key={inst.number} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">
                            {inst.number}
                          </td>
                          <td className="px-4 py-3">
                            {formatDate(inst.dueDate)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatMZN(inst.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Fechar
              </button>
              {detailedCredit.status !== 'paid' && (
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    openPaymentModal(detailedCredit);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#2D6A4F] flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Registrar Pagamento
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}