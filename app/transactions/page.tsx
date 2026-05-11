'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  IconSearch, 
  IconReceipt, 
  IconLoader2, 
  IconEye, 
  IconCalendar,
  IconFilter,
  IconUser,
  IconChevronRight
} from '@tabler/icons-react'
import { OrderDetailsDialog } from '@/components/transactions/order-details-dialog'
import { toast } from 'sonner'

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

export default function TransactionsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    initPage()
  }, [])

  const initPage = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setCurrentUserId(user.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      const role = profile?.role || 'customer'
      setUserRole(role)
      fetchOrders(user.id, role)
    }
  }

  const fetchOrders = async (userId: string, role: string) => {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    // Role-based filtering
    if (role === 'customer') {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      toast.error('Gagal mengambil riwayat transaksi')
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'done':
        return <Badge className="bg-emerald-500/10 text-emerald-700 border-none font-bold text-[10px] uppercase tracking-widest px-3">Selesai</Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="bg-rose-500/10 text-rose-700 border-none font-bold text-[10px] uppercase tracking-widest px-3">Batal</Badge>
      case 'processing':
        return <Badge className="bg-blue-500/10 text-blue-700 border-none font-bold text-[10px] uppercase tracking-widest px-3 animate-pulse">Proses</Badge>
      default:
        return <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-widest px-3">Antre</Badge>
    }
  }

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(search.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase">Riwayat Transaksi</h1>
          <p className="text-muted-foreground font-medium">
            {userRole === 'customer' 
              ? 'Daftar semua pesanan yang pernah Anda lakukan.' 
              : 'Pantau semua arus transaksi di toko Anda.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari ID atau Nama..." 
              className="pl-9 h-10 rounded-xl border-none shadow-sm bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
            <IconFilter size={18} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-background">
        <CardHeader className="bg-muted/30 pb-6 pt-6 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black tracking-tight">Data Pesanan</CardTitle>
              <CardDescription className="font-medium text-xs uppercase tracking-widest">
                Total {filteredOrders.length} Transaksi
              </CardDescription>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <IconReceipt size={20} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="hover:bg-transparent">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Transaksi</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pelanggan</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Waktu</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Total</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"></th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
                      <IconLoader2 className="mx-auto h-10 w-10 animate-spin text-primary opacity-20" />
                      <p className="mt-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Menarik data...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2 opacity-50 font-medium">
                        <IconReceipt size={48} />
                        <p>Belum ada riwayat transaksi.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="group hover:bg-muted/30 transition-colors border-b">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs">
                            <IconReceipt size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm leading-tight">#{order.id.slice(0, 8).toUpperCase()}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{order.total_items} Item</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <IconUser size={12} />
                          </div>
                          <span className="font-bold text-sm">{order.customer_name || 'Anonim'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <span className="font-black text-primary">Rp {Number(order.total_price).toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all group-hover:translate-x-1"
                          onClick={() => {
                            setSelectedOrderId(order.id)
                            setIsDetailsOpen(true)
                          }}
                        >
                          Rincian <IconChevronRight size={14} className="ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <OrderDetailsDialog 
        orderId={selectedOrderId} 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
      />
    </div>
  )
}
