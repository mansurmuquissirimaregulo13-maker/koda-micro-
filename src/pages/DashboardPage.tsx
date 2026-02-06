import React from 'react';
import {
  Users,
  CreditCard,
  Banknote,
  AlertCircle,
  Plus,
  CheckCircle } from
'lucide-react';
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
  ResponsiveContainer } from
'recharts';
interface DashboardPageProps {
  onNewClient: () => void;
  onNewCredit: () => void;
}
export function DashboardPage({
  onNewClient,
  onNewCredit
}: DashboardPageProps) {
  const { stats, credits, clients, getOverdueCreditsWithDetails } =
  useAppState();
  // Prepare chart data (mock monthly data)
  const chartData = [
  {
    name: 'Jan',
    value: 25000
  },
  {
    name: 'Fev',
    value: 45000
  },
  {
    name: 'Mar',
    value: 35000
  },
  {
    name: 'Abr',
    value: 80000
  },
  {
    name: 'Mai',
    value: 60000
  },
  {
    name: 'Jun',
    value: 95000
  }];

  const recentCredits = credits.slice(0, 5);
  const overdueCredits = credits.filter((c) => c.status === 'overdue');
  const paidClients = clients.filter((client) => {
    const clientCredits = credits.filter((c) => c.clientId === client.id);
    return (
      clientCredits.length > 0 &&
      clientCredits.every((c) => c.status === 'paid'));

  });
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clientes"
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

        <div
          className={`${stats.overdueCredits > 0 ? 'animate-pulse-subtle ring-2 ring-red-100' : ''} rounded-xl`}>

          <StatCard
            title="Créditos Atrasados"
            value={stats.overdueCredits.toString()}
            icon={AlertCircle}
            color="bg-red-500"
            trend="down"
            trendValue={`${stats.overdueCredits} críticos`} />

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1B1B1B] font-montserrat">
                Desempenho de Empréstimos
              </h3>
              <select className="text-sm border-gray-200 rounded-lg text-gray-500">
                <option>Últimos 6 meses</option>
                <option>Este ano</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
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
                    tick={{
                      fill: '#9CA3AF'
                    }}
                    dy={10} />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: '#9CA3AF'
                    }} />

                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
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
                    activeDot={{
                      r: 6
                    }} />

                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Em Dia Section */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-[#1B1B1B] font-montserrat mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Clientes em Dia (Sem Dívidas)
            </h3>
            <div className="flex flex-wrap gap-2">
              {paidClients.length > 0 ?
              paidClients.map((client) =>
              <span
                key={client.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">

                    {client.name}
                  </span>
              ) :

              <p className="text-sm text-gray-500">
                  Nenhum cliente com todos os créditos pagos.
                </p>
              }
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="lg:col-span-1 h-full">
          <AlertsPanel overdueCredits={overdueCredits} clients={clients} />
        </div>
      </div>

      {/* Recent Credits & Quick Actions */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1B1B1B] font-montserrat">
              Créditos Recentes
            </h3>
            <div className="flex gap-2">
              <button
                onClick={onNewClient}
                className="px-3 py-2 text-sm font-medium text-[#1B3A2D] bg-[#D8F3DC] rounded-lg hover:bg-[#b7e4c0] transition-colors flex items-center gap-2">

                <Plus className="w-4 h-4" />
                Novo Cliente
              </button>
              <button
                onClick={onNewCredit}
                className="px-3 py-2 text-sm font-medium text-white bg-[#1B3A2D] rounded-lg hover:bg-[#2D6A4F] transition-colors flex items-center gap-2">

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
                    </span>);

              }
            },
            {
              header: 'Valor',
              accessor: (credit) => formatMZN(credit.amount)
            },
            {
              header: 'Status',
              accessor: (credit) =>
              <CreditStatusBadge status={credit.status} />

            },
            {
              header: 'Data Início',
              accessor: (credit) => formatDate(credit.startDate)
            }]
            } />

        </div>
      </div>
    </div>);

}