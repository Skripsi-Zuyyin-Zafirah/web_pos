import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface DataTableBulkBarProps {
  selectedCount: number
  onClear: () => void
  children: ReactNode
}

export function DataTableBulkBar({ selectedCount, onClear, children }: DataTableBulkBarProps) {
  if (selectedCount === 0) return null
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-[#2FA4AF]/5 border-b border-[#2FA4AF]/20 dark:border-[#2FA4AF]/30">
      <span className="text-sm font-bold text-[#2FA4AF]">{selectedCount} baris dipilih</span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 rounded-lg text-slate-500 dark:text-slate-400 font-semibold text-xs"
        >
          Batal Pilih
        </Button>
        {children}
      </div>
    </div>
  )
}
