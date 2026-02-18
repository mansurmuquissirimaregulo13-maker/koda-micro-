import {
  Users,
  CreditCard,
  Banknote,
  Plus,
  CheckCircle,
  DollarSign,
  PiggyBank,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

import { StatCard } from '../components/StatCard';
import { AlertsPanel } from '../components/AlertsPanel';
import { DataTable } from '../components/DataTable';
import { CreditStatusBadge } from '../components/CreditStatusBadge';
import { useAppState } from '../hooks/useAppState';
import { formatMZN, formatDate } from '../utils/helpers';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DashboardPageProps {
  onNewClient: () => void;
  onNewCredit: () => void;
}

export function DashboardPage({
  onNewClient,
  onNewCredit
}: DashboardPageProps) {
  const { stats, credits, clients, company, savingsGroups, groupMembers, contributions } = useAppState();

  const isSavings = company?.type === 'savings';

  const chartData = [
    { name: 'Jan', value: 25000 },
    { name: 'Fev', value: 45000 },
    { name: 'Mar', value: 35000 },
    { name: 'Abr', value: 80000 },
    { name: 'Mai', value: 60000 },
    { name: 'Jun', value: 95000 }
  ];

  const recentCredits = credits.slice(0, 5);
  const overdueCredits = credits.filter((c) => c.status === 'overdue');
  const paidClients = clients.filter((client) => {
    const clientCredits = credits.filter((c) => c.clientId === client.id);
    return (
      clientCredits.length > 0 &&
      clientCredits.every((c) => c.status === 'paid')
    );
  });

  if (isSavings) {
    return (
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 px-1 md:px-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <StatCard
            title="Entradas do Mês"
            value={formatMZN(stats.monthEntries || 0)}
            icon={TrendingUp}
            color="bg-green-500" />

          <StatCard
            title="Caixa Disponível"
            value={formatMZN(stats.remanescente || 0)}
            icon={PiggyBank}
            color="bg-blue-500" />

          <StatCard
            title="Total em Dívida"
            value={formatMZN(stats.totalDebt || 0)}
            icon={AlertCircle}
            color="bg-amber-500" />

          <StatCard
            title="Membros"
            value={stats.totalClients.toString()}
            icon={Users}
            color="bg-[#1B3A2D]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base md:text-lg font-bold text-[#1B1B1B] font-montserrat">
                  Atividade do Grupo
                </h3>
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                  {savingsGroups[0]?.name || 'Nenhum grupo ativo'}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Últimas Contribuições</h4>
                  <DataTable
                    data={contributions.slice(0, 5)}
                    searchable={false}
                    columns={[
                      {
                        header: 'Membro',
                        accessor: (c) => {
                          const client = clients.find(cl => cl.id === c.memberId);
                          return client?.name || 'Desconhecido';
                        }
                      },
                      { header: 'Valor', accessor: (c) => formatMZN(c.amount) },
                      { header: 'Data', accessor: (c) => formatDate(c.paymentDate) }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm h-full">
              <h3 className="text-base md:text-lg font-bold text-[#1B1B1B] font-montserrat mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Resumo de Poupança
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Total de Contribuições</span>
                  <span className="font-bold text-[#1B3A2D]">{contributions.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Média por Grupo</span>
                  <span className="font-bold text-[#1B3A2D]">
                    {formatMZN(stats.activeGroups > 0 ? stats.totalSavings / stats.activeGroups : 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
              <h3 className="text-base font-bold text-[#1B1B1B] font-montserrat mb-4">
                Posição Financeira dos Membros
              </h3>
              <DataTable<any>
                data={groupMembers.filter((m: any) => m.groupId === savingsGroups[0]?.id)}
                searchable={false}
                columns={[
                  {
                    header: 'Membro',
                    accessor: (m) => (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[8px] font-bold">
                          {m.name?.substring(0, 1)}
                        </div>
                        <span className="text-sm">{m.name}</span>
                      </div>
                    )
                  },
                  {
                    header: 'Poupança',
                    accessor: (m) => {
                      const totalC = contributions
                        .filter(c => c.memberId === m.id)
                        .reduce((sum, c) => sum + c.amount, 0);
                      return formatMZN(totalC);
                    }
                  },
                  {
                    header: 'Juros Ganhos',
                    accessor: (m) => (
                      <span className="text-green-600">
                        {formatMZN(m.earnedInterest || 0)}
                      </span>
                    )
                  },
                  {
                    header: 'Valor Total',
                    accessor: (m) => {
                      const totalC = contributions
                        .filter(c => c.memberId === m.id)
                        .reduce((sum, c) => sum + c.amount, 0);
                      return (
                        <span className="font-bold text-[#1B3A2D]">
                          {formatMZN(totalC + (m.earnedInterest || 0))}
                        </span>
                      );
                    }
                  }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 px-1 md:px-0">
      {/* Info section removed as emails are now handled via Gmail SMTP */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title="Clientes"
          value={stats.totalClients.toString()}
          icon={Users}
          color="bg-blue-500"
          trend="up"
          trendValue="+12%" />

        <StatCard
          title="Créditos Ativos"
          value={stats.activeCredits.toString()}
          icon={CreditCard}
          color="bg-green-500"
          trend="up"
          trendValue="+5%" />

        <StatCard
          title="Total Emprestado"
          value={formatMZN(stats.totalLent)}
          icon={Banknote}
          color="bg-purple-500" />

        <StatCard
          title="Total Arrecadado"
          value={formatMZN(stats.totalCollected)}
          icon={DollarSign}
          color="bg-emerald-600"
          trend="up"
          trendValue="Recuperado" />

        <div className={`${stats.overdueCredits > 0 ? 'animate-pulse-subtle ring-2 ring-red-100 col-span-2 md:col-span-1' : 'col-span-2 md:col-span-1'} rounded-xl`}>
          <StatCard
            title="Créditos Atrasados"
            value={stats.overdueCredits.toString()}
            icon={AlertCircle}
            color="bg-red-500"
            trend="down"
            trendValue={`${stats.overdueCredits} críticos`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-base md:text-lg font-bold text-[#1B1B1B] font-montserrat">
                Desempenho de Empréstimos
              </h3>
              <select className="text-xs md:text-sm border-gray-200 rounded-lg text-gray-500 p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-[#40916C]">
                <option>Últimos 6 meses</option>
                <option>Este ano</option>
              </select>
            </div>
            <div className="h-[220px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    dy={10} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px'
                    }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#40916C"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: '#40916C',
                      strokeWidth: 2,
                      stroke: '#fff'
                    }}
                    activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-base md:text-lg font-bold text-[#1B1B1B] font-montserrat mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Clientes em Dia (Sem Dívidas)
            </h3>
            <div className="flex flex-wrap gap-2">
              {paidClients.length > 0 ? (
                paidClients.map((client) => (
                  <span
                    key={client.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-[10px] md:text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                    {client.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Nenhum cliente com todos os créditos pagos.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 h-full">
          <AlertsPanel overdueCredits={overdueCredits} clients={clients} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base md:text-lg font-bold text-[#1B1B1B] font-montserrat">
              Créditos Recentes
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={onNewClient}
                className="w-full sm:w-auto px-6 py-3.5 md:py-2 text-sm font-bold text-[#1B3A2D] bg-[#D8F3DC] rounded-xl hover:bg-[#b7e4c0] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm">
                <Plus className="w-4 h-4" />
                Novo Cliente
              </button>
              <button
                onClick={onNewCredit}
                className="w-full sm:w-auto px-6 py-3.5 md:py-2 text-sm font-bold text-white bg-[#1B3A2D] rounded-xl hover:bg-[#2D6A4F] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 active:scale-95">
                <Plus className="w-4 h-4" />
                Novo Crédito
              </button>
            </div>
          </div>

          <DataTable
            data={recentCredits}
            searchable={false}
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
                header: 'Valor',
                accessor: (credit) => formatMZN(credit.amount)
              },
              {
                header: 'Status',
                accessor: (credit) => <CreditStatusBadge status={credit.status} />
              },
              {
                header: 'Data Início',
                accessor: (credit) => formatDate(credit.startDate)
              }]
            } />
        </div>
      </div>
    </div>
  );
}