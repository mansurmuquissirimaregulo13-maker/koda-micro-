import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { formatMZN } from '../utils/helpers';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function ReportsPage() {
  const { stats, credits, clients } = useAppState();

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('pt-BR');

    doc.setFillColor(27, 58, 45); // #1B3A2D
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text('Koda Finance', 20, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text('Relatório de Créditos e Performance', 20, 32);
    doc.text(`Gerado em: ${today}`, 150, 32);

    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text('Resumo Financeiro', 20, 55);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.rect(20, 60, 50, 20, 'FD');
    doc.text('Total Emprestado', 25, 68);
    doc.setFont("helvetica", "bold");
    doc.text(formatMZN(stats.totalLent), 25, 75);

    doc.setFont("helvetica", "normal");
    doc.rect(80, 60, 50, 20, 'FD');
    doc.text('Total Recebido', 85, 68);
    doc.setTextColor(27, 58, 45);
    doc.setFont("helvetica", "bold");
    doc.text(formatMZN(stats.totalCollected), 85, 75);

    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    doc.rect(140, 60, 50, 20, 'FD');
    doc.text('Créditos Ativos', 145, 68);
    doc.setFont("helvetica", "bold");
    doc.text(stats.activeCredits.toString(), 145, 75);

    const significantCredits = credits.filter(c => c.status !== 'rejected');

    const tableData = significantCredits.map(credit => {
      const client = clients.find(c => c.id === credit.clientId);
      return [
        client?.name || 'N/A',
        formatMZN(credit.amount),
        formatMZN(credit.remainingAmount),
        new Date(credit.startDate).toLocaleDateString('pt-BR'),
        new Date(credit.endDate).toLocaleDateString('pt-BR'),
        getStatusLabel(credit.status)
      ];
    });

    function getStatusLabel(status: string) {
      switch (status) {
        case 'paid': return 'PAGO';
        case 'active': return 'ATIVO';
        case 'overdue': return 'ATRASADO';
        case 'pending': return 'PENDENTE';
        default: return status.toUpperCase();
      }
    }

    autoTable(doc, {
      startY: 90,
      head: [['Cliente', 'Valor Original', 'Saldo Devedor', 'Início', 'Fim', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [27, 58, 45],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: 50
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { halign: 'right' },
        2: { halign: 'right', fontStyle: 'bold' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center', fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: [245, 247, 246]
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 5) {
          const status = data.cell.raw as string;
          if (status === 'ATRASADO') {
            data.cell.styles.textColor = [220, 38, 38];
          } else if (status === 'PAGO') {
            data.cell.styles.textColor = [22, 163, 74];
          }
        }
      }
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Koda Finance - Sistema de Gestão de Microcrédito - Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
    }

    doc.save(`Relatorio_Koda_${today.replace(/\//g, '-')}.pdf`);
  };

  const handleExportExcel = () => {
    const activeCredits = credits.filter(c => c.status === 'active' || c.status === 'overdue');
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Cliente,Valor,Restante,Inicio,Fim,Status\n";

    activeCredits.forEach(credit => {
      const client = clients.find(c => c.id === credit.clientId);
      const row = [
        client?.name || 'N/A',
        credit.amount,
        credit.remainingAmount,
        credit.startDate,
        credit.endDate,
        credit.status
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_koda.csv");
    document.body.appendChild(link);
    link.click();
  };

  const monthlyData = [
    { name: 'Jan', emprestado: 40000, recebido: 24000 },
    { name: 'Fev', emprestado: 30000, recebido: 13980 },
    { name: 'Mar', emprestado: 20000, recebido: 9800 },
    { name: 'Abr', emprestado: 27800, recebido: 39080 },
    { name: 'Mai', emprestado: 18900, recebido: 48000 },
    { name: 'Jun', emprestado: 23900, recebido: 38000 }
  ];

  const statusData = [
    { name: 'Ativos', value: credits.filter((c) => c.status === 'active').length },
    { name: 'Pagos', value: credits.filter((c) => c.status === 'paid').length },
    { name: 'Atrasados', value: credits.filter((c) => c.status === 'overdue').length },
    { name: 'Pendentes', value: credits.filter((c) => c.status === 'pending').length }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1B1B1B] font-montserrat">
            Relatórios e Análises
          </h2>
          <p className="text-gray-500 text-sm">
            Visão geral do desempenho financeiro.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Excel (CSV)
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-[#1B3A2D] text-white rounded-lg font-medium hover:bg-[#2D6A4F] flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Total Emprestado
          </h3>
          <p className="text-2xl font-bold text-[#1B1B1B]">
            {formatMZN(stats.totalLent)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Total Recebido
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {formatMZN(stats.totalCollected)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Taxa de Inadimplência
          </h3>
          <p className="text-2xl font-bold text-red-500">
            {stats.totalClients > 0 ?
              (stats.overdueCredits / stats.totalClients * 100).toFixed(1) :
              0}
            %
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-[#1B1B1B] mb-6">
            Fluxo de Caixa (6 Meses)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF' }}
                  dy={10} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} />
                <Bar
                  dataKey="emprestado"
                  name="Emprestado"
                  fill="#1B3A2D"
                  radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="recebido"
                  name="Recebido"
                  fill="#40916C"
                  radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-[#1B1B1B] mb-6">
            Distribuição de Status
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value">
                  {statusData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}>
                  </div>
                  <span className="text-sm text-gray-600">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}