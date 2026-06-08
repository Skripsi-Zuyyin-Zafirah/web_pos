'use client'

import { useState, useEffect, useMemo, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { DataTableToolbar } from '@/components/data-table/toolbar'
import { DataTableSkeletonRows } from '@/components/data-table/skeleton-rows'
import { DataTableEmptyState } from '@/components/data-table/empty-state'
import { useDataTable } from '@/hooks/use-data-table'
import { IconLoader2, IconUserShield, IconUser, IconTruck, IconUsers, IconMail, IconPlus, IconKey } from '@tabler/icons-react'
import { createUser } from './user-actions'

type Profile = {
  id: string
  full_name: string | null
  role: 'admin' | 'cashier' | 'customer'
  updated_at: string
}

type RoleFilter = 'all' | 'admin' | 'cashier' | 'customer'

const SKELETON_COLS = [
  { type: 'avatar-text' as const },
  { type: 'badge' as const, width: 'w-24' },
  { width: 'w-40' },
  { width: 'w-40', className: 'text-right' },
]

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const supabase = createClient()

  const dt = useDataTable({ defaultSortField: 'full_name', defaultSortOrder: 'asc' })

  useEffect(() => { fetchProfiles() }, [])
  useEffect(() => { dt.resetPage() }, [dt.search, roleFilter])

  const fetchProfiles = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('*').order('full_name', { ascending: true })
    if (error) toast.error('Gagal mengambil pengguna')
    else setProfiles(data || [])
    setLoading(false)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) toast.error(error.message)
    else { toast.success('Peran pengguna diperbarui'); fetchProfiles() }
  }

  const handleAddUser = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createUser(formData)
      if (result.error) toast.error(result.error)
      else { toast.success('Pengguna baru berhasil dibuat'); setIsDialogOpen(false); fetchProfiles() }
    })
  }

  const exportCSV = () => {
    const rows = [
      ['Nama', 'Peran', 'Aktivitas Terakhir'],
      ...processedProfiles.map((p) => [p.full_name || 'Anonim', p.role, new Date(p.updated_at).toLocaleDateString('id-ID')]),
    ]
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    a.download = `pengguna_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    toast.success('Data diekspor')
  }

  const processedProfiles = useMemo(() => {
    let r = profiles
    if (dt.search) r = r.filter((p) => (p.full_name || '').toLowerCase().includes(dt.search.toLowerCase()))
    if (roleFilter !== 'all') r = r.filter((p) => p.role === roleFilter)
    return dt.sortData(r, (item, field) => {
      if (field === 'full_name') return item.full_name || ''
      return (item as any)[field]
    })
  }, [profiles, dt.search, roleFilter, dt.sortData])

  const hasActiveFilters = dt.search !== '' || roleFilter !== 'all'
  const resetFilters = () => { dt.setSearch(''); setRoleFilter('all') }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="font-bold rounded-lg px-2.5 py-1 gap-1.5 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900"><IconUserShield size={12} /> Admin</Badge>
      case 'cashier': return <Badge className="font-bold rounded-lg px-2.5 py-1 gap-1.5 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900"><IconTruck size={12} /> Kasir</Badge>
      default: return <Badge className="font-bold rounded-lg px-2.5 py-1 gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"><IconUser size={12} /> Pelanggan</Badge>
    }
  }

  const roleAvatarColor = (role: string) => {
    if (role === 'admin') return 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400'
    if (role === 'cashier') return 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase">Kontrol Akses Pengguna</h1>
          <p className="text-muted-foreground font-medium">Kelola izin dan peran untuk tim dan pelanggan Anda.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2FA4AF] hover:bg-[#258a94] text-white font-black px-6 h-12 rounded-2xl shadow-xl shadow-[#2FA4AF]/20 transition-all active:scale-95 gap-2">
              <IconPlus size={18} /> Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">Buat Akun Baru</DialogTitle>
              <DialogDescription className="font-medium text-slate-500">Daftarkan anggota tim atau pelanggan baru secara langsung.</DialogDescription>
            </DialogHeader>
            <form action={handleAddUser} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Nama Lengkap</Label>
                  <div className="relative group">
                    <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#2FA4AF] transition-colors" />
                    <Input id="fullName" name="fullName" required className="pl-10 h-12 border-slate-200 rounded-xl focus:ring-4 focus:ring-[#2FA4AF]/10 focus:border-[#2FA4AF] transition-all font-medium" placeholder="Contoh: Budi Santoso" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Alamat Email</Label>
                  <div className="relative group">
                    <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#2FA4AF] transition-colors" />
                    <Input id="email" name="email" type="email" required className="pl-10 h-12 border-slate-200 rounded-xl focus:ring-4 focus:ring-[#2FA4AF]/10 focus:border-[#2FA4AF] transition-all font-medium" placeholder="budi@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Kata Sandi</Label>
                  <div className="relative group">
                    <IconKey className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#2FA4AF] transition-colors" />
                    <Input id="password" name="password" type="password" required minLength={6} className="pl-10 h-12 border-slate-200 rounded-xl focus:ring-4 focus:ring-[#2FA4AF]/10 focus:border-[#2FA4AF] transition-all font-medium" placeholder="••••••••" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Peran Akses</Label>
                  <Select name="role" defaultValue="customer">
                    <SelectTrigger className="h-12 border-slate-200 rounded-xl focus:ring-4 focus:ring-[#2FA4AF]/10 focus:border-[#2FA4AF] transition-all font-bold"><SelectValue placeholder="Pilih Peran" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="admin" className="font-bold text-red-600">Akses Admin</SelectItem>
                      <SelectItem value="cashier" className="font-bold text-blue-600">Akses Kasir</SelectItem>
                      <SelectItem value="customer" className="font-bold text-slate-600">Akses Pelanggan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={isPending} className="w-full bg-[#2FA4AF] hover:bg-[#258a94] text-white font-black h-12 rounded-2xl shadow-xl shadow-[#2FA4AF]/20 transition-all active:scale-95">
                  {isPending ? <span className="flex items-center gap-2"><IconLoader2 className="animate-spin" size={18} /> Mendaftarkan...</span> : 'Simpan Pengguna'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-red-500/5 dark:bg-red-950/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Admin</CardTitle>
            <IconUserShield className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-black text-slate-900 dark:text-white">{profiles.filter((p) => p.role === 'admin').length} Pengguna</div></CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-blue-500/5 dark:bg-blue-950/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Kasir</CardTitle>
            <IconTruck className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-black text-slate-900 dark:text-white">{profiles.filter((p) => p.role === 'cashier').length} Pengguna</div></CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-slate-500/5 dark:bg-slate-950/20 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Pelanggan</CardTitle>
            <IconUser className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-black text-slate-900 dark:text-white">{profiles.filter((p) => p.role === 'customer').length} Pengguna</div></CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="border-none shadow-xl dark:shadow-none rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border dark:border-slate-800">
        <CardHeader className="bg-muted/30 dark:bg-slate-950/20 pb-4 pt-5 border-b dark:border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-0.5">
              <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Profil Sistem</CardTitle>
              <CardDescription className="font-medium text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Akun database</CardDescription>
            </div>
            <DataTableToolbar
              search={{ value: dt.search, onChange: (v: string) => { dt.setSearch(v); dt.resetPage() }, placeholder: 'Cari nama pengguna...' }}
              filters={[
                {
                  value: roleFilter,
                  onChange: (v: string) => { setRoleFilter(v as RoleFilter); dt.resetPage() },
                  placeholder: 'Semua Peran',
                  options: [
                    { value: 'all', label: 'Semua Peran' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'cashier', label: 'Kasir' },
                    { value: 'customer', label: 'Pelanggan' },
                  ],
                  width: 'w-40',
                },
              ]}
              onRefresh={fetchProfiles}
              onExport={exportCSV}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={resetFilters}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 bg-white dark:bg-slate-900">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-950/50 border-b dark:border-slate-800">
              <TableRow className="hover:bg-transparent border-b dark:border-slate-800">
                <DataTableColumnHeader label="Profil" field="full_name" sortBy={dt.sortBy} sortOrder={dt.sortOrder} onSort={dt.handleSort} className="pl-6" />
                <DataTableColumnHeader label="Peran" field="role" sortBy={dt.sortBy} sortOrder={dt.sortOrder} onSort={dt.handleSort} />
                <DataTableColumnHeader label="Aktivitas Terakhir" field="updated_at" sortBy={dt.sortBy} sortOrder={dt.sortOrder} onSort={dt.handleSort} />
                <TableHead className="text-right font-bold py-3.5 pr-6 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Ubah Akses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <DataTableSkeletonRows rows={4} columns={SKELETON_COLS} />
              ) : processedProfiles.length === 0 ? (
                <DataTableEmptyState
                  colSpan={4}
                  icon={IconUsers}
                  emptyTitle="Belum ada pengguna"
                  emptyDescription='Klik "Tambah Pengguna" untuk membuat akun baru.'
                  hasActiveFilters={hasActiveFilters}
                  onResetFilters={resetFilters}
                />
              ) : processedProfiles.map((profile, idx) => (
                <TableRow
                  key={profile.id}
                  className={`group border-b dark:border-slate-800/50 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-950/20'} hover:bg-[#2FA4AF]/5 dark:hover:bg-[#2FA4AF]/10`}
                >
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black uppercase text-sm shadow-sm flex-shrink-0 ${roleAvatarColor(profile.role)}`}>
                        {profile.full_name?.charAt(0) || '?'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white truncate">{profile.full_name || 'Pengguna Anonim'}</span>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider font-mono">ID: {profile.id.slice(0, 8)}…</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">{getRoleBadge(profile.role)}</TableCell>
                  <TableCell className="py-4 font-medium text-sm text-muted-foreground">
                    {new Date(profile.updated_at).toLocaleDateString('id-ID')} — {new Date(profile.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="text-right py-4 pr-6">
                    <Select defaultValue={profile.role} onValueChange={(v) => handleRoleChange(profile.id, v)}>
                      <SelectTrigger className="w-[160px] ml-auto h-9 rounded-xl font-bold shadow-sm border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <SelectItem value="admin" className="font-bold text-red-600">Akses Admin</SelectItem>
                        <SelectItem value="cashier" className="font-bold text-blue-600">Akses Kasir</SelectItem>
                        <SelectItem value="customer" className="font-bold">Akses Pelanggan</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        {/* Result count footer */}
        {!loading && processedProfiles.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Menampilkan {processedProfiles.length} dari {profiles.length} pengguna
              {hasActiveFilters && <button onClick={resetFilters} className="ml-2 text-[#2FA4AF] hover:underline font-bold">Reset filter</button>}
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

