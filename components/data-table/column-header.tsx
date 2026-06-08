import { IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react'
import { TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface DataTableColumnHeaderProps {
  label: string
  field: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (field: string) => void
  className?: string
  align?: 'left' | 'right'
}

export function DataTableColumnHeader({
  label,
  field,
  sortBy,
  sortOrder,
  onSort,
  className,
  align = 'left',
}: DataTableColumnHeaderProps) {
  const isActive = sortBy === field
  const isSortable = !!onSort

  const icon = !isActive
    ? <IconSelector size={14} className="opacity-40" />
    : sortOrder === 'asc'
      ? <IconChevronUp size={14} className="text-[#2FA4AF]" />
      : <IconChevronDown size={14} className="text-[#2FA4AF]" />

  return (
    <TableHead
      className={cn(
        'font-bold py-3.5 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider',
        isSortable && 'cursor-pointer hover:text-[#2FA4AF] dark:hover:text-[#2FA4AF] transition-colors select-none',
        align === 'right' && 'text-right',
        className,
      )}
      onClick={isSortable ? () => onSort(field) : undefined}
    >
      {isSortable ? (
        <div className={cn('flex items-center gap-1', align === 'right' && 'justify-end')}>
          {label} {icon}
        </div>
      ) : (
        label
      )}
    </TableHead>
  )
}
