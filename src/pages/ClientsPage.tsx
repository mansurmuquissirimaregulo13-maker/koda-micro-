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
  const { clients, addClient, updateClient, deleteClient, credits } = useAppState();
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
        {viewingClient && (
          <div className="space-y-8 py-4">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-[#1B3A2D] border-4 border-white shadow-sm">
                {viewingClient.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#1B1B1B]">
                  {viewingClient.name}
                </h3>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1 rounded-full text-sm">
                    <Mail className="w-4 h-4" />
                    {viewingClient.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1 rounded-full text-sm">
                    <Phone className="w-4 h-4" />
                    {viewingClient.phone}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <FileText className="w-4 h-4" />
                  BI
                </div>
                <div className="font-semibold text-lg">{viewingClient.bi}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  Membro desde
                </div>
                <div className="font-semibold text-lg">
                  {formatDate(viewingClient.registeredAt)}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-[#1B1B1B] mb-4 flex items-center gap-2">
                Histórico de Créditos
              </h4>
              <div className="space-y-3">
                {(credits as any[])
                  .filter((c: any) => c.clientId === viewingClient.id)
                  .map((credit: any) => (
                    <div
                      key={credit.id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-[#40916C]/30 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatMZN(credit.amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Início: {formatDate(credit.startDate)}
                        </div>
                      </div>
                      <CreditStatusBadge status={credit.status} />
                    </div>
                  ))}
                {credits.filter((c: any) => c.clientId === viewingClient.id).length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm">Nenhum crédito registado.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}