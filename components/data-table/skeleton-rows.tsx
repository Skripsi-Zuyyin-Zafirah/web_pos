import { TableCell, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

export interface SkeletonColumn {
  /** Tailwind width class, e.g. 'w-40'. Defaults to 'w-32'. */
  width?: string
  /** Shape variant */
  type?: 'text' | 'badge' | 'square' | 'circle' | 'avatar-text'
  /** Extra cell className */
  className?: string
}

interface DataTableSkeletonRowsProps {
  rows?: number
  columns: SkeletonColumn[]
  hasCheckbox?: boolean
}

function SkeletonCell({ type = 'text', width = 'w-32' }: SkeletonColumn) {
  switch (type) {
    case 'square':
      return <Skeleton className="h-11 w-11 rounded-xl" />
    case 'circle':
      return <Skeleton className="h-10 w-10 rounded-full" />
    case 'badge':
      return <Skeleton className={`h-6 ${width} rounded-lg`} />
    case 'avatar-text':
      return (
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
      )
    default:
      return <Skeleton className={`h-4 ${width} rounded`} />
  }
}

export function DataTableSkeletonRows({ rows = 5, columns, hasCheckbox = false }: DataTableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="border-b dark:border-slate-800/50">
          {hasCheckbox && (
            <TableCell className="pl-5">
              <Skeleton className="h-4 w-4 rounded" />
            </TableCell>
          )}
          {columns.map((col, j) => (
            <TableCell key={j} className={`py-3.5 ${col.className ?? ''}`}>
              <SkeletonCell {...col} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
