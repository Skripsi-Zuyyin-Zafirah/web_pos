import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

interface DataTablePaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
}

export function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: DataTablePaginationProps) {
  const start = Math.min(total, (currentPage - 1) * pageSize + 1)
  const end = Math.min(total, currentPage * pageSize)

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
  )

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10">
      {/* Page size + info */}
      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Tampilkan</span>
          <Select value={pageSize.toString()} onValueChange={(v) => onPageSizeChange(parseInt(v))}>
            <SelectTrigger className="h-8 w-16 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white">
              {pageSizeOptions.map((n) => (
                <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs font-medium">baris</span>
        </div>
        <span className="hidden sm:inline text-xs">
          {start}–{end} dari {total}
        </span>
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" disabled={currentPage === 1} onClick={() => onPageChange(1)} className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          <IconChevronLeft size={14} className="-mr-1" /><IconChevronLeft size={14} />
        </Button>
        <Button variant="outline" size="icon" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          <IconChevronLeft size={14} />
        </Button>

        {pageNumbers.map((page, idx, arr) => {
          const dotsBefore = page > 2 && arr[idx - 1] !== page - 1
          const dotsAfter = page < totalPages - 1 && arr[idx + 1] !== page + 1
          return (
            <div key={page} className="flex items-center">
              {dotsBefore && <span className="px-1.5 text-xs text-slate-400">…</span>}
              <Button
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                className={`h-8 w-8 rounded-lg text-xs font-bold ${
                  currentPage === page
                    ? 'bg-[#2FA4AF] text-white hover:bg-[#258a94] border-none shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {page}
              </Button>
              {dotsAfter && <span className="px-1.5 text-xs text-slate-400">…</span>}
            </div>
          )
        })}

        <Button variant="outline" size="icon" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          <IconChevronRight size={14} />
        </Button>
        <Button variant="outline" size="icon" disabled={currentPage === totalPages} onClick={() => onPageChange(totalPages)} className="h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
          <IconChevronRight size={14} className="-ml-1" /><IconChevronRight size={14} />
        </Button>
      </div>
    </div>
  )
}
