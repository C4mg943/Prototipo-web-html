import type { ReactNode } from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

/**
 * Componente genérico de tabla con estilos consistentes
 */
export function DataTable<T extends { id?: number }>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 ${
                  col.className ?? ''
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.map((row, rowIndex) => (
            <tr
              key={row.id ?? rowIndex}
              onClick={() => onRowClick?.(row)}
              className={`hover:bg-slate-50 ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={`whitespace-nowrap px-4 py-3 text-sm text-slate-900 ${
                    col.className ?? ''
                  }`}
                >
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key as string] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}