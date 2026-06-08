'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table'
import {
  IconReceipt,
  IconUser,
  IconChevronRight,
  IconCurrencyDollar,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { OrderDetailsDialog } from '@/components/transactions/order-details-dialog'
import { toast } from 'sonner'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { DataTableToolbar } from '@/components/data-table/toolbar'
import { DataTablePagination } from '@/components/data-table/pagination'
import { DataTableSkeletonRows } from '@/components/data-table/skeleton-rows'
import { DataTableEmptyState } from '@/components/data-table/empty-state'
import { useDataTable } from '@/hooks/use-data-table'

type Order = {
  id: string
  created_at: string
  total_price: number
  total_items: number
  status: string
  customer_name: string
  payment_status: string
  user_id: string
}

type StatusFilter = 'all' | 'done' | 'processing' | 'pending' | 'cancelled'
type PeriodFilter = 'all' | 'today' | '7days' | '30days' | 'thismonth'

const SKELETON_COLS = [
  { type: 'square' as const },
  { type: 'avatar-text' as const },
  { width: 'w-32' },
  { type: 'badge' as const, width: 'w-20' },
  { width: 'w-28', className: 'text-right' },
  { width: 'w-16', className: 'text-right' },
]

function filterByPeriod(orders: Order[], period: PeriodFilter): Order[] {
  if (period === 'all') return orders
  const start = new Date()
  if (period === 'today') { start.setHours(0, 0, 0, 0) }
  else if (period === '7days') { start.setDate(start.getDate() - 7) }
  else if (period === '30days') { start.setDate(start.getDate() - 30) }
  else if (period === 'thismonth') { start.setDate(1); start.setHours(0, 0, 0, 0) }
  return orders.filter((o) => new Date(o.created_at) >= start)
}

export default function TransactionsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')

  const dt = useDataTable({ defaultSortField: 'created_at', defaultSortOrder: 'desc', defaultPageSize: 15 })
  const supabase = createClient()

  useEffect(() => { initPage() }, [])
  useEffect(() => { dt.resetPage() }, [dt.search, statusFilter, periodFilter])

  const initPage = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const role = profile?.role || 'customer'
      setUserRole(role)
      await fetchOrders(user.id, role)
    }
  }

  const fetchOrders = async (userId: string, role: string) => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (role === 'customer') query = query.eq('user_id', userId)
    const { data, error } = await query
    if (error) toast.error('Gagal mengambil riwayat transaksi')
    else setOrders(data || [])
    setLoading(false)
  }

  const refreshOrders = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      await fetchOrders(user.id, profile?.role || 'customer')
    }
  }

  const exportCSV = () => {
    const rows = [
      ['ID', 'Pelanggan', 'Tanggal', 'Status', 'Pembayaran', 'Total', 'Item'],
      ...processedOrders.map((o) => [
        o.id.slice(0, 8).toUpperCase(),
        o.customer_name || 'Anonim',
        new Date(o.created_at).toLocaleDateString('id-ID'),
        o.status,
        o.payment_status,
        o.total_price,
        o.total_items,
      ]),
    ]
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    a.download = `transaksi_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    toast.success('Data transaksi diekspor')
  }

  const processedOrders = useMemo(() => {
    let r = orders

    if (dt.search) {
      const q = dt.search.toLowerCase()
      r = r.filter((o) =>
        o.id.toLowerCase().includes(q) ||
        (o.customer_name || '').toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') r = r.filter((o) => o.status === statusFilter)
    r = filterByPeriod(r, periodFilter)

    return dt.sortData(r, (item, field) => {
      if (field === 'customer_name') return item.customer_name || ''
      if (field === 'total_price') return item.total_price
      if (field === 'created_at') return item.created_at
      if (field === 'status') return item.status
      return (item as any)[field]
    })
  }, [orders, dt.search, statusFilter, periodFilter, dt.sortData])

  const paginatedOrders = useMemo(() => dt.paginateData(processedOrders), [processedOrders, dt.paginateData])
  const totalPages = dt.getTotalPages(processedOrders.length)
  const hasActiveFilters = dt.search !== '' || statusFilter !== 'all' || periodFilter !== 'all'
  const resetFilters = () => { dt.setSearch(''); setStatusFilter('all'); setPeriodFilter('all') }

  // Stats derived from all orders (unfiltered)
  const stats = useMemo(() => ({
    total: orders.length,
    revenue: orders.filter((o) => o.status === 'done').reduce((a, o) => a + o.total_price, 0),
    done: orders.filter((o) => o.status === 'done').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    processing: orders.filter((o) => o.status === 'processing' || o.status === 'pending').length,
  }), [orders])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'done':
        return <Badge className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 font-bold text-[10px] uppercase tracking-widest px-2.5 gap-1"><IconCircleCheck size={10} /> Selesai</Badge>
      case 'cancelled':
        return <Badge className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 font-bold text-[10px] uppercase tracking-widest px-2.5 gap-1"><IconCircleX size={10} /> Batal</Badge>
      case 'processing':
        return <Badge className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900 font-bold text-[10px] uppercase tracking-widest px-2.5 gap-1 animate-pulse"><IconClock size={10} /> Proses</Badge>
      default:
        return <Badge className="bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 font-bold text-[10px] uppercase tracking-widest px-2.5 gap-1"><IconAlertTriangle size={10} /> Antre</Badge>
    }
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header — title only, no search */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Riwayat Transaksi</h1>
        <p className="text-muted-foreground dark:text-slate-400 font-medium">
          {userRole === 'customer'
            ? 'Daftar semua pesanan yang pernah Anda lakukan.'
            : 'Pantau semua arus transaksi di toko Anda.'}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border border-blue-100/50 dark:border-blue-950/30 shadow-sm bg-blue-500/5 dark:bg-blue-950/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Total Transaksi</CardTitle>
            <IconReceipt className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border border-emerald-100/50 dark:border-emerald-950/30 shadow-sm bg-emerald-500/5 dark:bg-emerald-950/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Pendapatan</CardTitle>
            <IconCurrencyDollar className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              Rp {stats.revenue.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-violet-100/50 dark:border-violet-950/30 shadow-sm bg-violet-500/5 dark:bg-violet-950/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">Selesai</CardTitle>
            <IconCircleCheck className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.done}</div>
          </CardContent>
        </Card>

        <Card className="border border-amber-100/50 dark:border-amber-950/30 shadow-sm bg-amber-500/5 dark:bg-amber-950/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Aktif / Antre</CardTitle>
            <IconClock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.processing}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-xl dark:shadow-none rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border dark:border-slate-800">
        <CardHeader className="bg-muted/30 dark:bg-slate-950/20 pb-4 pt-5 border-b dark:border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-0.5">
              <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Data Pesanan</CardTitle>
              <CardDescription className="font-medium text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {processedOrders.length !== orders.length
                  ? `${processedOrders.length} dari ${orders.length} transaksi`
                  : `${orders.length} transaksi`}
              </CardDescription>
            </div>

            {/* Toolbar: search + filters + actions — all inside the card */}
            <DataTableToolbar
              search={{
                value: dt.search,
                onChange: (v: string) => { dt.setSearch(v); dt.resetPage() },
                placeholder: 'Cari ID atau nama pelanggan...',
              }}
              filters={[
                {
                  value: statusFilter,
                  onChange: (v: string) => { setStatusFilter(v as StatusFilter); dt.resetPage() },
                  placeholder: 'Semua Status',
                  width: 'w-44',
                  options: [
                    { value: 'all', label: 'Semua Status' },
                    { value: 'done', label: 'Selesai' },
                    { value: 'processing', label: 'Diproses' },
                    { value: 'pending', label: 'Antre' },
                    { value: 'cancelled', label: 'Dibatalkan' },
                  ],
                },
                {
                  value: periodFilter,
                  onChange: (v: string) => { setPeriodFilter(v as PeriodFilter); dt.resetPage() },
                  placeholder: 'Semua Waktu',
                  width: 'w-40',
                  options: [
                    { value: 'all', label: 'Semua Waktu' },
                    { value: 'today', label: 'Hari Ini' },
                    { value: '7days', label: '7 Hari Terakhir' },
                    { value: '30days', label: '30 Hari Terakhir' },
                    { value: 'thismonth', label: 'Bulan Ini' },
                  ],
                },
              ]}
              onRefresh={refreshOrders}
              onExport={exportCSV}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={resetFilters}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-950/50 border-b dark:border-slate-800">
                <TableRow className="hover:bg-transparent border-b dark:border-slate-800">
                  <TableHead className="font-bold py-3.5 pl-6 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider w-[140px]">Transaksi</TableHead>
                  <DataTableColumnHeader label="Pelanggan" field="customer_name" sortBy={dt.sortBy} sortOrder={dt.sortOrder} onSort={dt.handleSort} />
                  <DataTableColumnHeader label="Waktu" field="created_at" sortBy={dt.sortBy} sortOrder={dt.sortOrder} onSort={dt.handleSort} />
                  <DataTableColumnHeader label="Status" field="status" sortBy={dt.sortBy} sortOrder={dt.sortOrder} onSort={dt.handleSort} />
                  <DataTableColumnHeader label="Total" field="total_price" sortBy={dt.sortBy} sortOrder={dt.sortOrder} onSort={dt.handleSort} align="right" />
                  <TableHead className="w-[90px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <DataTableSkeletonRows rows={8} columns={SKELETON_COLS} />
                ) : paginatedOrders.length === 0 ? (
                  <DataTableEmptyState
                    colSpan={6}
                    icon={IconReceipt}
                    emptyTitle="Riwayat Kosong"
                    emptyDescription="Belum ada transaksi yang tercatat."
                    filteredTitle="Tidak ada hasil"
                    filteredDescription="Coba ubah atau reset filter pencarian Anda."
                    hasActiveFilters={hasActiveFilters}
                    onResetFilters={resetFilters}
                  />
                ) : (
                  paginatedOrders.map((order, idx) => (
                    <TableRow
                      key={order.id}
                      className={`group border-b dark:border-slate-800/50 transition-colors cursor-pointer ${
                        idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-950/20'
                      } hover:bg-[#2FA4AF]/5 dark:hover:bg-[#2FA4AF]/10`}
                      onClick={() => { setSelectedOrderId(order.id); setIsDetailsOpen(true) }}
                    >
                      {/* Transaction ID */}
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <IconReceipt size={16} className="text-slate-500 dark:text-slate-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm leading-tight text-slate-900 dark:text-white font-mono">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground dark:text-slate-400 uppercase">
                              {order.total_items} item
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Customer */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                            <IconUser size={13} />
                          </div>
                          <span className="font-semibold text-sm text-slate-900 dark:text-white truncate max-w-[140px]">
                            {order.customer_name || 'Anonim'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Time */}
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground dark:text-slate-400 uppercase">
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4">
                        {getStatusBadge(order.status)}
                      </TableCell>

                      {/* Total */}
                      <TableCell className="py-4 text-right">
                        <span className="font-black text-[#2FA4AF] text-sm">
                          Rp {Number(order.total_price).toLocaleString('id-ID')}
                        </span>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="py-4 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-[#2FA4AF] hover:text-white dark:hover:bg-[#2FA4AF] transition-all text-slate-500 dark:text-slate-400 gap-0.5"
                          onClick={() => { setSelectedOrderId(order.id); setIsDetailsOpen(true) }}
                        >
                          Rincian <IconChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {!loading && processedOrders.length > 0 && (
          <DataTablePagination
            currentPage={dt.currentPage}
            totalPages={totalPages}
            pageSize={dt.pageSize}
            total={processedOrders.length}
            onPageChange={dt.setCurrentPage}
            onPageSizeChange={(s: number) => { dt.setPageSize(s); dt.resetPage() }}
            pageSizeOptions={[10, 15, 25, 50]}
          />
        )}
      </Card>

      <OrderDetailsDialog
        orderId={selectedOrderId}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  )
}
