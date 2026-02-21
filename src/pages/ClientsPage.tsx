import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Eye,
  FileText,
  Clock
} from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { ClientForm } from '../components/ClientForm';
import { useAppState } from '../hooks/useAppState';
import { Client } from '../types';
import { CreditStatusBadge } from '../components/CreditStatusBadge';
import { formatMZN, formatDate } from '../utils/helpers';

interface ClientsPageProps {
  searchTerm?: string;
}

export function ClientsPage({ searchTerm = '' }: ClientsPageProps) {
  const { clients, addClient, updateClient, deleteClient, credits, payments } = useAppState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (selectedClient) {
      updateClient(selectedClient.id, data);
    } else {
      addClient(data);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClient(id);
    }
  };

  const effectiveSearchTerm = searchTerm || localSearchTerm;

  const filteredClients = (clients as any[]).filter((client: any) =>
    client.name.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
    client.phone.includes(effectiveSearchTerm)
  );

  const columns = [
    {
      header: 'Cliente',
      accessor: (client: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[#1B3A2D]">
            {client.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-[#1B1B1B]">{client.name}</div>
            <div className="text-xs text-gray-500">{client.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contacto',
      accessor: (client: any) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-3 h-3" />
            {client.phone}
          </div>
        </div>
      ),
    },
    {
      header: 'Status de Crédito',
      accessor: (client: any) => {
        const clientCredits = (credits as any[]).filter((c: any) => c.clientId === client.id);
        const activeCredit = clientCredits.find((c: any) => c.status === 'active' || c.status === 'overdue');
        return activeCredit ? (
          <CreditStatusBadge status={activeCredit.status} />
        ) : (
          <span className="text-xs text-gray-400">Sem créditos ativos</span>
        );
      },
    },
    {
      header: 'Saldo Devedor',
      accessor: (client: any) => {
        const clientCredits = (credits as any[]).filter((c: any) => c.clientId === client.id);
        const totalDebt = clientCredits.reduce((acc: any, c: any) => acc + c.remainingAmount, 0);
        return (
          <div className="font-semibold text-[#1B1B1B]">
            {formatMZN(totalDebt)}
          </div>
        );
      },
    },
    {
      header: 'Ações',
      accessor: (client: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewingClient(client)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Ver Detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(client)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(client.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 px-1 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1B1B1B] font-montserrat tracking-tight">
            Gestão de Clientes
          </h2>
          <p className="text-gray-500 text-xs md:text-sm">
            Visualize e faça a gestão da sua base de clientes.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 md:py-2 bg-[#1B3A2D] text-white rounded-xl hover:bg-[#2D6A4F] transition-all shadow-lg shadow-green-900/20 font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {!searchTerm && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Pesquisar por nome, email ou telefone..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#40916C]/20 focus:border-[#40916C] transition-all outline-none"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Plus className="w-5 h-5 rotate-45" />
            </div>
          </div>
        </div>
      )}

      <DataTable
        data={filteredClients}
        columns={columns}
        onRowClick={setViewingClient}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <ClientForm
          initialData={selectedClient || undefined}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Client Details Modal */}
      <Modal
        isOpen={!!viewingClient}
        onClose={() => setViewingClient(null)}
        title="Detalhes do Cliente"
      >
        {viewingClient && (() => {
          // Calculations
          const clientCredits = (credits as any[]).filter((c: any) => c.clientId === viewingClient.id);
          const creditIds = clientCredits.map(c => c.id);
          const clientPayments = (payments as any[]).filter(p => p.creditId && creditIds.includes(p.creditId));

          const totalLent = clientCredits.reduce((sum, c) => sum + (c.totalToPay || 0), 0);
          const totalPaid = clientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
          const currentDebt = totalLent - totalPaid;

          return (
            <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-[#1B3A2D] border-4 border-white shadow-sm overflow-hidden">
                  {viewingClient.biPhoto ? (
                    <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center text-xs text-gray-400">
                      <FileText className="w-6 h-6 mb-1 text-[#40916C]" /> BI
                    </div>
                  ) : viewingClient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1B1B1B]">
                    {viewingClient.name}
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1 rounded-full text-sm">
                      <Mail className="w-4 h-4" />
                      {viewingClient.email || 'Sem email'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1 rounded-full text-sm">
                      <Phone className="w-4 h-4" />
                      {viewingClient.phone || 'Sem telefone'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <FileText className="w-4 h-4 text-[#40916C]" />
                    BI
                  </div>
                  <div className="font-semibold text-md truncate">{viewingClient.bi}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <div className="w-4 h-4 text-[#40916C]">📍</div>
                    Bairro
                  </div>
                  <div className="font-semibold text-md truncate">{viewingClient.neighborhood || 'Não informado'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Clock className="w-4 h-4 text-[#40916C]" />
                    Membro desde
                  </div>
                  <div className="font-semibold text-md truncate">
                    {formatDate(viewingClient.registeredAt)}
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div>
                <h4 className="font-semibold text-[#1B1B1B] mb-3 flex items-center gap-2">
                  💰 Resumo Financeiro
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="text-gray-500 text-xs mb-1">Total (Deveu Tanto)</div>
                    <div className="font-bold text-lg text-blue-900">{formatMZN(totalLent)}</div>
                  </div>
                  <div className="p-4 bg-green-50/50 rounded-xl border border-green-100">
                    <div className="text-gray-500 text-xs mb-1">Total Pago (Colocou Tanto)</div>
                    <div className="font-bold text-lg text-green-700">{formatMZN(totalPaid)}</div>
                  </div>
                  <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                    <div className="text-gray-500 text-xs mb-1">Total em Dívida (A Dever)</div>
                    <div className="font-bold text-lg text-red-700">{formatMZN(currentDebt)}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Credits List */}
                <div>
                  <h4 className="font-semibold text-[#1B1B1B] mb-3 flex items-center gap-2 text-sm">
                    📜 Últimos Créditos
                  </h4>
                  <div className="space-y-2">
                    {clientCredits.slice(0, 3).map((credit: any) => (
                      <div key={credit.id} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm">{formatMZN(credit.totalToPay)}</span>
                          <CreditStatusBadge status={credit.status} />
                        </div>
                        <div className="text-xs text-gray-500">Início: {formatDate(credit.startDate)}</div>
                      </div>
                    ))}
                    {clientCredits.length === 0 && (
                      <div className="text-center py-4 bg-gray-50 rounded-lg text-gray-400 text-xs">Sem créditos.</div>
                    )}
                  </div>
                </div>

                {/* Payments History */}
                <div>
                  <h4 className="font-semibold text-[#1B1B1B] mb-3 flex items-center gap-2 text-sm">
                    💸 Histórico de Pagamentos
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {clientPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payment: any) => (
                      <div key={payment.id} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm text-green-700">+{formatMZN(payment.amount)}</div>
                          <div className="text-[10px] text-gray-500">{formatDate(payment.date)}</div>
                        </div>
                        <div className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {payment.method === 'emola' ? 'eMola' :
                            payment.method === 'mpesa' ? 'M-Pesa' :
                              payment.method === 'bank' ? 'Transf.' :
                                payment.method === 'cash' ? 'Em Mão' : 'Desconhecido'}
                        </div>
                      </div>
                    ))}
                    {clientPayments.length === 0 && (
                      <div className="text-center py-4 bg-gray-50 rounded-lg text-gray-400 text-xs">Sem pagamentos.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}