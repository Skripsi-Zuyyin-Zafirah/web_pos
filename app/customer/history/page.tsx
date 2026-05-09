'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconSearch, IconClock2, IconCheck, IconX, IconReceipt } from '@tabler/icons-react'

type Order = {
  id: string
  created_at: string
  total_price: number
  total_items: number
  status: string
  payment_status: string
}

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['done', 'cancelled'])
        .order('created_at', { ascending: false })

      if (!error && data) {
        setOrders(data as Order[])
      }
    }
    setLoading(false)
  }

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 rounded-lg w-1/4"></div>
          <div className="h-64 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-slate-900">Riwayat Pesanan</h1>
        <p className="text-slate-500 text-sm">Lihat semua pesanan Anda yang telah selesai atau dibatalkan.</p>
      </div>

      {/* Controls */}
      <div className="relative max-w-md">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Cari ID Pesanan..."
          className="pl-10 h-11 border-slate-200 focus:border-[#2FA4AF] focus:ring-[#2FA4AF]/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Orders Table */}
      <Card className="border-slate-100 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">ID Pesanan</th>
                  <th scope="col" className="px-6 py-4 font-bold">Tanggal</th>
                  <th scope="col" className="px-6 py-4 font-bold">Item</th>
                  <th scope="col" className="px-6 py-4 font-bold">Total</th>
                  <th scope="col" className="px-6 py-4 font-bold">Status</th>
                  <th scope="col" className="px-6 py-4 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <IconReceipt size={40} className="text-slate-300" />
                        <p className="font-medium">Tidak ada riwayat pesanan yang ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <th scope="row" className="px-6 py-4 font-bold text-slate-900 truncate max-w-[150px]">
                        #{order.id.slice(0, 8)}...
                      </th>
                      <td className="px-6 py-4">{formatDate(order.created_at)}</td>
                      <td className="px-6 py-4">{order.total_items} Item</td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        Rp {order.total_price.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        {order.status === 'done' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">
                            <IconCheck size={12} /> Selesai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-700">
                            <IconX size={12} /> Dibatalkan
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" className="text-[#2FA4AF] hover:text-[#258a94] hover:bg-[#2FA4AF]/5 font-bold">
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
