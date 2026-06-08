import { ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconSearch, IconDownload, IconColumns, IconX, IconRefresh } from '@tabler/icons-react'

export interface FilterConfig {
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
  width?: string
}

export interface ColumnConfig {
  key: string
  label: string
}

interface DataTableToolbarProps {
  /** Search box config. Omit to hide. */
  search?: {
    value: string
    onChange: (v: string) => void
    placeholder?: string
  }
  /** Dropdown filter selects. */
  filters?: FilterConfig[]
  /** Called when refresh button clicked. Omit to hide button. */
  onRefresh?: () => void
  /** Called when export CSV clicked. Omit to hide button. */
  onExport?: () => void
  /** Column visibility toggle. Omit to hide. */
  columnVisibility?: {
    config: ColumnConfig[]
    state: Record<string, boolean>
    onChange: (key: string, val: boolean) => void
  }
  /** Show reset-filter chip. */
  hasActiveFilters?: boolean
  onResetFilters?: () => void
  /** Extra action buttons rendered after the built-in ones. */
  actions?: ReactNode
}

export function DataTableToolbar({
  search,
  filters = [],
  onRefresh,
  onExport,
  columnVisibility,
  hasActiveFilters,
  onResetFilters,
  actions,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Action buttons row */}
      {(onRefresh || onExport || columnVisibility || actions) && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {actions}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-9 rounded-lg border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 gap-1.5 font-semibold"
            >
              <IconRefresh size={14} /> Refresh
            </Button>
          )}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="h-9 rounded-lg border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 gap-1.5 font-semibold"
            >
              <IconDownload size={14} /> Export CSV
            </Button>
          )}
          {columnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 gap-1.5 font-semibold"
                >
                  <IconColumns size={14} /> Kolom
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tampilkan Kolom
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columnVisibility.config.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.key}
                    checked={columnVisibility.state[col.key]}
                    onCheckedChange={(val) => columnVisibility.onChange(col.key, val)}
                    className="font-medium"
                  >
                    {col.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Search + filter row */}
      {(search || filters.length > 0 || hasActiveFilters) && (
        <div className="flex flex-wrap items-center gap-2">
          {search && (
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={search.placeholder ?? 'Cari...'}
                className="pl-9 h-9 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm"
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
              />
            </div>
          )}

          {filters.map((f, i) => (
            <Select key={i} value={f.value} onValueChange={f.onChange}>
              <SelectTrigger
                className={`h-9 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm ${f.width ?? 'w-44'}`}
              >
                <SelectValue placeholder={f.placeholder} />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                {f.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {hasActiveFilters && onResetFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-9 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 gap-1 font-semibold px-2"
            >
              <IconX size={14} /> Reset
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
