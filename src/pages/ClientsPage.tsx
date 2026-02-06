import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Eye,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock
} from
  'lucide-react';
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
  const {
    clients,
    addClient,
    updateClient,
    deleteClient,
    getClientCredits,
    getClientPayments
  } = useAppState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(
    undefined
  );
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'overdue' | 'none'>(
    'all'
  );

  // ... handlers ...

  const handleCreate = (data: any) => {
    addClient(data);
    setIsModalOpen(false);
  };
  const handleUpdate = (data: any) => {
    if (editingClient) {
      updateClient(editingClient.id, data);
      setEditingClient(undefined);
      setIsModalOpen(false);
    }
  };
  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };
  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este cliente?')) {
      deleteClient(id);
    }
  };
  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setIsDetailModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(undefined);
  };
  const getClientStatus = (clientId: string) => {
    const credits = getClientCredits(clientId);
    if (credits.length === 0) return 'none';
    if (credits.some((c) => c.status === 'overdue')) return 'overdue';
    if (credits.some((c) => c.status === 'active' || c.status === 'pending'))
      return 'active';
    return 'paid';
  };
  const filteredClients = clients.filter((client) => {
    const status = getClientStatus(client.id);
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.bi.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    if (filter === 'active') return status === 'active';
    if (filter === 'overdue') return status === 'overdue';
    if (filter === 'none') return status === 'none' || status === 'paid';
    return true;
  });
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1B1B1B] font-montserrat">
            Gestão de Clientes
          </h2>
          <p className="text-gray-500 text-sm">
            Gerencie sua base de clientes e históricos.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#1B3A2D] text-white rounded-lg font-medium hover:bg-[#2D6A4F] transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20">

          <Plus className="w-4 h-4" />
          Cadastrar Cliente
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          {
            id: 'all',
            label: 'Todos'
          },
          {
            id: 'active',
            label: 'Com Crédito Ativo'
          },
          {
            id: 'overdue',
            label: 'Com Atraso'
          },
          {
            id: 'none',
            label: 'Sem Crédito / Pagos'
          }].
          map((f) =>
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-colors border
              ${filter === f.id ? 'bg-[#1B3A2D] text-white border-[#1B3A2D]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
            `}>

              {f.label}
            </button>
          )}
      </div>

      <DataTable
        data={filteredClients}
        searchPlaceholder="Buscar por nome, BI ou telefone..."
        onRowClick={handleViewDetails}
        columns={[
          {
            header: 'Nome',
            accessor: (client) => {
              const status = getClientStatus(client.id);
              const statusColors = {
                none: 'bg-gray-400',
                paid: 'bg-green-500',
                active: 'bg-yellow-500',
                overdue: 'bg-red-500'
              };
              return (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {client.name.charAt(0)}
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusColors[status]}`} />

                  </div>
                  <span className="font-medium text-gray-900">
                    {client.name}
                  </span>
                </div>);

            }
          },
          {
            header: 'BI / Passaporte',
            accessor: 'bi'
          },
          {
            header: 'Contato',
            accessor: (client) =>
              <div className="flex flex-col text-xs">
                <span className="flex items-center gap-1 text-gray-700">
                  <Phone className="w-3 h-3" /> {client.phone}
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Mail className="w-3 h-3" /> {client.email}
                </span>
              </div>

          },
          {
            header: 'Endereço',
            accessor: 'address'
          }]
        }
        actions={(client) =>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(client);
              }}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Ver Detalhes">

              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(client);
              }}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar">

              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(client.id);
              }}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remover">

              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        } />


      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}>

        <ClientForm
          onSubmit={editingClient ? handleUpdate : handleCreate}
          onCancel={handleCloseModal}
          initialData={editingClient} />

      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalhes do Cliente"
        size="lg">

        {selectedClient &&
          <div className="space-y-8">
            {/* Header Info */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#1B3A2D] text-white flex items-center justify-center text-2xl font-bold">
                    {selectedClient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedClient.name}
                    </h3>
                    <div className="flex flex-col gap-1 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> {selectedClient.bi}
                      </span>
                      <span className="flex items-center gap-2">
                        <Phone className="w-4 h-4" /> {selectedClient.phone}
                      </span>
                      <span className="flex items-center gap-2">
                        <Mail className="w-4 h-4" /> {selectedClient.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 max-w-sm">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Observações / Fiador
                  </h4>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm text-gray-600 min-h-[80px]">
                    {selectedClient.notes || 'Nenhuma observação registrada.'}
                  </div>
                  {selectedClient.residenceProof &&
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#40916C] font-medium cursor-pointer hover:underline">
                      <FileText className="w-4 h-4" />
                      {selectedClient.residenceProof}
                    </div>
                  }
                </div>
              </div>
            </div>

            {/* Credit History */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Histórico de Créditos
              </h3>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Data Início
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Valor
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Status
                      </th>
                      <th className="px-4 py-3 font-medium text-gray-600 text-right">
                        Restante
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getClientCredits(selectedClient.id).length > 0 ?
                      getClientCredits(selectedClient.id).map((credit) =>
                        <tr key={credit.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {formatDate(credit.startDate)}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {formatMZN(credit.totalToPay)}
                          </td>
                          <td className="px-4 py-3">
                            <CreditStatusBadge status={credit.status} />
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-[#1B3A2D]">
                            {formatMZN(credit.remainingAmount)}
                          </td>
                        </tr>
                      ) :

                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-gray-500">

                          Nenhum crédito registrado.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium uppercase">
                  Total Emprestado
                </p>
                <p className="text-xl font-bold text-blue-900 mt-1">
                  {formatMZN(
                    getClientCredits(selectedClient.id).reduce(
                      (sum, c) => sum + c.totalToPay,
                      0
                    )
                  )}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <p className="text-xs text-green-600 font-medium uppercase">
                  Total Pago
                </p>
                <p className="text-xl font-bold text-green-900 mt-1">
                  {formatMZN(
                    getClientPayments(selectedClient.id).reduce(
                      (sum, p) => sum + p.amount,
                      0
                    )
                  )}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs text-red-600 font-medium uppercase">
                  Saldo Devedor
                </p>
                <p className="text-xl font-bold text-red-900 mt-1">
                  {formatMZN(
                    getClientCredits(selectedClient.id).reduce(
                      (sum, c) => sum + c.remainingAmount,
                      0
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        }
      </Modal>
    </div>);

}