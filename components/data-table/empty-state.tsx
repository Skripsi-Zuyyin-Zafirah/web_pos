import { ComponentType } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { IconX } from '@tabler/icons-react'

interface DataTableEmptyStateProps {
  colSpan: number
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
  /** Shown when no active filters */
  emptyTitle?: string
  emptyDescription?: string
  /** Shown when filters are active but yield no results */
  filteredTitle?: string
  filteredDescription?: string
  hasActiveFilters?: boolean
  onResetFilters?: () => void
}

export function DataTableEmptyState({
  colSpan,
  icon: Icon,
  emptyTitle = 'Belum ada data',
  emptyDescription = 'Tambahkan data baru untuk memulai.',
  filteredTitle = 'Tidak ada hasil',
  filteredDescription = 'Coba ubah atau reset filter Anda.',
  hasActiveFilters = false,
  onResetFilters,
}: DataTableEmptyStateProps) {
  const title = hasActiveFilters ? filteredTitle : emptyTitle
  const desc = hasActiveFilters ? filteredDescription : emptyDescription

  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-20 text-muted-foreground dark:text-slate-400">
        <div className="flex flex-col items-center gap-3 opacity-50">
          <Icon size={48} strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="font-bold text-base">{title}</p>
            <p className="text-sm font-medium">{desc}</p>
          </div>
          {hasActiveFilters && onResetFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="mt-1 rounded-lg font-bold border-slate-200 dark:border-slate-700"
            >
              <IconX size={14} className="mr-1" /> Reset Filter
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
