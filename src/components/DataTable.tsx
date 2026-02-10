import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
}
export function DataTable<
  T extends {
    id: string;
  }>(
    {
      data,
      columns,
      searchable = true,
      searchPlaceholder = 'Pesquisar...',
      onRowClick,
      actions
    }: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Filter data based on search
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    return Object.values(item as any).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {searchable &&
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 md:py-2.5 text-base md:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#40916C] focus:border-transparent bg-gray-50/50" />
          </div>
        </div>
      }

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {columns.map((col, idx) =>
                <th
                  key={idx}
                  className={`px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider text-xs ${col.className || ''}`}>

                  {col.header}
                </th>
              )}
              {actions &&
                <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider text-xs text-right">
                  Ações
                </th>
              }
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length > 0 ?
              paginatedData.map((item) =>
                <tr
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={`
                    hover:bg-gray-50 transition-colors
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}>

                  {columns.map((col, idx) =>
                    <td
                      key={idx}
                      className={`px-4 md:px-6 py-4 text-gray-700 whitespace-nowrap md:whitespace-normal ${col.className || ''}`}>

                      {typeof col.accessor === 'function' ?
                        col.accessor(item) :
                        item[col.accessor] as React.ReactNode}
                    </td>
                  )}
                  {actions &&
                    <td
                      className="px-6 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}>

                      {actions(item)}
                    </td>
                  }
                </tr>
              ) :

              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-8 text-center text-gray-500">

                  Nenhum dado encontrado
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      {totalPages > 1 &&
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Mostrando {startIndex + 1} a{' '}
            {Math.min(startIndex + itemsPerPage, filteredData.length)} de{' '}
            {filteredData.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50">

              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50">

              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      }
    </div>);

}