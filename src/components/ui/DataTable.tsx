"use client";

import type { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { IconButton } from "./Button";
import { EmptyState, Spinner } from "./Feedback";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyTitle: string;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  rowKey: (row: T) => string;
}

export function DataTable<T>({
  rows,
  columns,
  loading,
  emptyTitle,
  emptyMessage,
  emptyAction,
  onEdit,
  onDelete,
  rowKey,
}: DataTableProps<T>) {
  if (loading) return <Spinner label="Loading records" />;
  if (rows.length === 0)
    return <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />;

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-card">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-surface-subtle text-xs uppercase tracking-wide text-ink-muted">
            {columns.map((column) => (
              <th key={column.key} scope="col" className={cnTh(column.className)}>
                {column.header}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                <span className="sr-only">Actions</span>Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-line/60 last:border-0 hover:bg-surface-subtle/60">
              {columns.map((column) => (
                <td key={column.key} className={cnTd(column.className)}>
                  {column.render(row)}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {onEdit && (
                      <IconButton label="Edit" onClick={() => onEdit(row)} className="h-8 w-8 text-ink-soft hover:text-primary">
                        <Pencil className="h-4 w-4" aria-hidden />
                      </IconButton>
                    )}
                    {onDelete && (
                      <IconButton label="Delete" onClick={() => onDelete(row)} className="h-8 w-8 text-ink-soft hover:text-danger">
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </IconButton>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function cnTh(className?: string) {
  return `px-4 py-3 font-semibold ${className ?? ""}`;
}
function cnTd(className?: string) {
  return `px-4 py-3 align-top text-ink-soft ${className ?? ""}`;
}
