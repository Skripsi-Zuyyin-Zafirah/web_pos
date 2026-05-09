'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  IconShoppingCart, 
  IconClock2, 
  IconChecklist, 
  IconReceipt
} from '@tabler/icons-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Profile = {
  id: string
  full_name: string | null
  role: string
}

type Order = {
  id: string
  created_at: string
  total_price: number
  total_items: number
  status: string
  payment_status: string
  ewp?: number
}

type OrderItem = {
  id: string
  quantity: number
  price: number
  products: {
    name: string
  } | null
}

export default function CustomerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalOrders: 0,
    waitTime: '0 mnt'
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [queuePosition, setQueuePosition] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channel: any

    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profileData as Profile)

        // Fetch active orders count
        const { count: activeCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('status', ['waiting', 'processing'])
        
        // Fetch total orders count
        const { count: totalCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        // Fetch recent orders
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        setRecentOrders((ordersData as Order[]) || [])

        // Find active order for the large widget
        const currentActive = (ordersData as Order[])?.find(o => o.status === 'waiting' || o.status === 'processing')
        setActiveOrder(currentActive || null)

        // Calculate queue position
        let queuePos = 0
        if (currentActive) {
          const { count: queueCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .in('status', ['waiting', 'processing'])
            .lt('created_at', currentActive.created_at)
          
          queuePos = (queueCount || 0) + 1
        }
        setQueuePosition(queuePos)

        setStats({
          activeOrders: activeCount || 0,
          totalOrders: totalCount || 0,
          waitTime: currentActive ? `${currentActive.ewp || 0} mnt` : '0 mnt'
        })
      }
      setLoading(false)
    }

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      channel = supabase
        .channel('customer_dashboard')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
          },
          (payload) => {
            console.log('Realtime change received:', payload)
            fetchData()
          }
        )
        .subscribe()
    }

    fetchData()
    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  const viewDetail = async (order: Order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
    
    const supabase = createClient()
    const { data } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        price,
        products (
          name
        )
      `)
      .eq('order_id', order.id)
    
    setOrderItems((data as unknown as OrderItem[]) || [])
  }

  if (loading) {
    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 rounded-lg w-1/4"></div>
          <div className="h-64 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">Selamat datang kembali, {profile?.full_name || 'Pelanggan'}!</p>
        </div>
        <Link href="/customer/shop">
          <Button className="bg-[#2FA4AF] hover:bg-[#258a94] text-white rounded-full font-bold shadow-lg shadow-[#2FA4AF]/20">
            Mulai Belanja <IconShoppingCart size={18} className="ml-2" />
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Pesanan Aktif', value: stats.activeOrders.toString(), icon: IconClock2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { title: 'Total Belanja', value: stats.totalOrders.toString(), icon: IconChecklist, color: 'text-[#2FA4AF]', bg: 'bg-[#2FA4AF]/10' },
          { title: 'Estimasi Tunggu', value: stats.waitTime, icon: IconClock2, color: 'text-violet-500', bg: 'bg-violet-500/10' },
        ].map((stat, index) => (
          <Card key={index} className="border-slate-100 shadow-sm">
            <CardContent className="p-6 flex flex-col gap-2">
              <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <p className="text-xs font-medium text-slate-500 mt-2">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Order Status - Large Widget */}
      <Card className="border-slate-100 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold">Status Pesanan Aktif</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {activeOrder ? (
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Queue Circle */}
              <div className="relative h-32 w-32 flex-shrink-0">
                <div className="absolute inset-0 bg-slate-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-[#2FA4AF] rounded-full border-t-transparent animate-spin-slow" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-[#2FA4AF]">#{queuePosition || '-'}</span>
                  <span className="text-xs font-medium text-slate-500">Antrean</span>
                </div>
              </div>

              {/* Order Details */}
              <div className="flex-1 space-y-4 w-full">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900">Pesanan #{activeOrder.id.slice(0, 8)}...</h4>
                    <p className="text-xs text-slate-500">{activeOrder.total_items} item • Rp {activeOrder.total_price.toLocaleString('id-ID')}</p>
                  </div>
                  <span className={`px-3 py-1 ${
                    activeOrder.status === 'processing' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                  } text-xs font-bold rounded-full`}>
                    {activeOrder.status === 'processing' ? 'Sedang Diproses' : 'Menunggu'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Progres</span>
                    <span>{activeOrder.status === 'processing' ? '60%' : '10%'}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2FA4AF] rounded-full" style={{ width: activeOrder.status === 'processing' ? '60%' : '10%' }} />
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeOrder.status === 'processing' 
                    ? 'Pesanan Anda sedang diproses oleh staf kami.'
                    : 'Pesanan Anda berada dalam antrean.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              <IconReceipt size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="font-medium">Tidak ada pesanan aktif saat ini.</p>
              <p className="text-xs text-slate-400 mt-1">Mulai belanja untuk membuat pesanan baru.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders Table */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold">Riwayat Pesanan Terakhir</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">ID Pesanan</th>
                  <th scope="col" className="px-6 py-4 font-bold">Tanggal</th>
                  <th scope="col" className="px-6 py-4 font-bold">Total</th>
                  <th scope="col" className="px-6 py-4 font-bold">Status</th>
                  <th scope="col" className="px-6 py-4 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <IconReceipt size={40} className="text-slate-300" />
                        <p className="font-medium">Tidak ada riwayat pesanan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <th scope="row" className="px-6 py-4 font-bold text-slate-900 truncate max-w-[150px]">
                        #{order.id.slice(0, 8)}...
                      </th>
                      <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">Rp {order.total_price.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          order.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                          order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {order.status === 'done' ? 'Selesai' :
                           order.status === 'cancelled' ? 'Dibatalkan' :
                           order.status === 'processing' ? 'Diproses' : 'Menunggu'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#2FA4AF] hover:text-[#258a94] hover:bg-[#2FA4AF]/5 font-bold"
                          onClick={() => viewDetail(order)}
                        >
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

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-bold text-slate-900">Rincian Pesanan</DialogTitle>
            <DialogDescription>
              Pesanan #{selectedOrder?.id.slice(0, 8)}... pada {selectedOrder && new Date(selectedOrder.created_at).toLocaleDateString('id-ID')}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="max-h-[300px] overflow-y-auto space-y-3">
              {orderItems.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-4">Memuat rincian...</p>
              ) : (
                orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <div>
                      <p className="font-medium text-slate-900">{item.products?.name || 'Produk'}</p>
                      <p className="text-xs text-slate-500">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <p className="font-bold text-slate-900">Rp {(item.quantity * item.price).toLocaleString('id-ID')}</p>
                  </div>
                ))
              )}
            </div>
            
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center font-bold text-slate-900">
              <span>Total</span>
              <span>Rp {selectedOrder?.total_price.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
