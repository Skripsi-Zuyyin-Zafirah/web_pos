'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { DataTableToolbar } from '@/components/data-table/toolbar'
import { DataTableSkeletonRows } from '@/components/data-table/skeleton-rows'
import { DataTableEmptyState } from '@/components/data-table/empty-state'
import { useDataTable } from '@/hooks/use-data-table'
import { IconPlus, IconTrash, IconEdit, IconLoader2, IconCategory, IconCalendar, IconCheck, IconX } from '@tabler/icons-react'

type Category = { id: string; name: string; created_at: string }

const SKELETON_COLS = [
  { width: 'w-44' },
  { width: 'w-32' },
  { width: 'w-24', className: 'text-right' },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const supabase = createClient()

  const dt = useDataTable({ defaultSortField: 'name', defaultSortOrder: 'asc' })

  useEffect(() => { fetchCategories() }, [])
  useEffect(() => { dt.resetPage() }, [dt.search])

  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true })
    if (error) toast.error('Gagal mengambil kategori')
    else setCategories(data || [])
    setLoading(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setIsAdding(true)
    const { error } = await supabase.from('categories').insert([{ name: newName }])
    if (error) toast.error(error.message)
    else { toast.success('Kategori ditambahkan'); setNewName(''); fetchCategories() }
    setIsAdding(false)
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    const { error } = await supabase.from('categories').update({ name: editName }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Kategori diperbarui'); setEditingId(null); fetchCategories() }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kategori ini?')) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Kategori dihapus'); fetchCategories() }
  }

  const exportCSV = () => {
    const rows = [['Nama', 'Dibuat'], ...processedCategories.map((c) => [c.name, new Date(c.created_at).toLocaleDateString('id-ID')])]
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    a.download = `kategori_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    toast.success('Data diekspor')
  }

  const processedCategories = useMemo(() => {
    const filtered = dt.search
      ? categories.filter((c) => c.name.toLowerCase().includes(dt.search.toLowerCase()))
      : categories
    return dt.sortData(filtered, (item, field) => (item as any)[field])
  }, [categories, dt.search, dt.sortData])

  const hasActiveFilters = dt.search !== ''

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="space-y-1 text-center md:text-left">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Kategori</h1>
        <p className="text-muted-foreground font-medium">Atur produk Anda ke dalam kelompok yang logis.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Add form */}
        <div className="md:col-span-4">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 pb-6">
              <CardTitle className="text-xl font-black">Tambah Baru</CardTitle>
              <CardDescription className="font-medium text-xs uppercase tracking-widest">Buat kelompok baru</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Nama Kategori</label>
                  <Input
                    placeholder="e.g. Staple Foods"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-11 rounded-xl shadow-inner border-none bg-muted/50"
                  />
                </div>
                <Button type="submit" disabled={isAdding} className="w-full h-11 font-bold rounded-xl shadow-lg">
                  {isAdding ? <IconLoader2 className="animate-spin" /> : <><IconPlus className="mr-2 h-5 w-5" /> Tambah Kategori</>}
                </Button>
              </form>

              {/* Summary */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Total Kategori</span>
                  <span className="font-black text-lg">{categories.length}</span>
                </div>
                {dt.search && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Hasil Pencarian</span>
                    <span className="font-black text-lg text-[#2FA4AF]">{processedCategories.length}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="md:col-span-8">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="bg-muted/30 dark:bg-slate-950/20 pb-4 pt-5 border-b dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <CardTitle className="text-xl font-black tracking-tight">Kategori yang Ada</CardTitle>
                  <CardDescription className="font-medium text-xs uppercase tracking-widest">Kelola taksonomi Anda</CardDescription>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <IconCategory size={20} />
                </div>
              </div>
              <div className="mt-3">
                <DataTableToolbar
                  search={{ value: dt.search, onChange: (v: string) => { dt.setSearch(v); dt.resetPage() }, placeholder: 'Cari kategori...' }}
                  onRefresh={fetchCategories}
                  onExport={exportCSV}
                  hasActiveFilters={hasActiveFilters}
                  onResetFilters={() => dt.setSearch('')}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/80 dark:bg-slate-950/50 border-b dark:border-slate-800">
                  <TableRow className="hover:bg-transparent border-b dark:border-slate-800">
                    <DataTableColumnHeader label="Nama" field="name" sortBy={dt.sortBy} sortOrder={dt.sortOrder} onSort={dt.handleSort} className="pl-6" />
                    <DataTableColumnHeader label="Dibuat" field="created_at" sortBy={dt.sortBy} sortOrder={dt.sortOrder} onSort={dt.handleSort} />
                    <TableHead className="text-right font-bold py-3.5 pr-6 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <DataTableSkeletonRows rows={4} columns={SKELETON_COLS} />
                  ) : processedCategories.length === 0 ? (
                    <DataTableEmptyState
                      colSpan={3}
                      icon={IconCategory}
                      emptyTitle="Belum ada kategori"
                      emptyDescription='Gunakan form di sebelah kiri untuk menambah kategori.'
                      hasActiveFilters={hasActiveFilters}
                      onResetFilters={() => dt.setSearch('')}
                    />
                  ) : processedCategories.map((category, idx) => (
                    <TableRow
                      key={category.id}
                      className={`group border-b dark:border-slate-800/50 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-950/20'} hover:bg-[#2FA4AF]/5 dark:hover:bg-[#2FA4AF]/10`}
                    >
                      <TableCell className="py-4 pl-6">
                        {editingId === category.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-9 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(category.id); if (e.key === 'Escape') setEditingId(null) }}
                          />
                        ) : (
                          <span className="font-bold text-slate-900 dark:text-white">{category.name}</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                          <IconCalendar size={14} className="text-slate-400" />
                          {new Date(category.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4 pr-6">
                        {editingId === category.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-emerald-500/10 text-emerald-500" onClick={() => handleUpdate(category.id)}>
                              <IconCheck className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-slate-500/10 text-slate-400" onClick={() => setEditingId(null)}>
                              <IconX className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors"
                              onClick={() => { setEditingId(category.id); setEditName(category.name) }}>
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                              onClick={() => handleDelete(category.id)}>
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
