'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MinHeap, HeapItem } from '@/lib/utils/min-heap'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { 
  IconClock, 
  IconPlayerPlay, 
  IconCheck, 
  IconLoader2, 
  IconAlertCircle, 
  IconTrash, 
  IconHistory, 
  IconChefHat, 
  IconShoppingCart,
  IconArrowDown,
  IconVariable,
  IconCalendarEvent,
  IconRefresh,
  IconEye
} from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'
import { OrderDetailsDialog } from '@/components/cashier/order-details'
import { PaymentConfirmationDialog } from '@/components/cashier/payment-dialog'

export default function QueuePage() {
  const [orders, setOrders] = useState<HeapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [paymentTarget, setPaymentTarget] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel('queue-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .neq('status', 'done')
        .neq('status', 'cancelled')

      if (error) {
        toast.error('Gagal mengambil antrean')
        console.error('Fetch orders error:', error)
      } else if (data) {
        const heap = new MinHeap()
        data.forEach((order) => heap.push(order))
        setOrders(heap.getSortedItems())
      }
    } catch (e) {
      console.error('Exception in fetchOrders:', e)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId: string, status: string, assignedStaffId?: string | null) => {
    setLoading(true)
    try {
      if (status === 'processing') {
        // Find an available staff
        const { data: idleStaff } = await supabase
          .from('staff')
          .select('id, name')
          .eq('status', 'idle')
          .limit(1)
          .single()

        if (!idleStaff) {
          toast.error('Staf tidak tersedia! Harap tunggu atau bebaskan anggota staf.')
          setLoading(false)
          return
        }

        // Assign staff and update order
        const { error: orderError } = await supabase
          .from('orders')
          .update({ 
            status, 
            assigned_staff_id: idleStaff.id
          })
          .eq('id', orderId)

        if (orderError) throw orderError

        // Update staff status
        const { error: staffError } = await supabase
          .from('staff')
          .update({ 
            status: 'busy', 
            current_order_id: orderId,
            updated_at: new Date().toISOString()
          })
          .eq('id', idleStaff.id)

        if (staffError) throw staffError

        toast.success(`Pesanan dimulai oleh ${idleStaff.name}`)
      } else if (status === 'cancelled') {
        const { error } = await supabase.rpc('cancel_order_transaction', {
          p_order_id: orderId,
          p_staff_id: assignedStaffId || null
        })

        if (error) throw error
        console.log("Cancel order transaction success")
        toast.success(`Pesanan dibatalkan`)
      } else {
        // For other status (like cancelled, if implemented)
        const { error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', orderId)

        if (error) throw error
        toast.success(`Status pesanan diperbarui ke ${status}`)
      }
    } catch (err: any) {
      console.error('Update status error:', err)
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint
      })
      toast.error('Error: ' + (err.message || 'Operation failed'))
    } finally {
      fetchOrders()
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <div className="p-6 bg-background border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <IconHistory size={20} strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Antrean Dapur</h1>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-10">
            SJF Min-Heap: Prioritas = (Item × 30d) + Waktu Kedatangan
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="h-10 px-4 rounded-xl font-black bg-primary/10 text-primary border-primary/20 shadow-none text-sm uppercase tracking-wider">
            {orders.length} PESANAN AKTIF
          </Badge>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={fetchOrders}>
            <IconRefresh size={20} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-40 gap-4 opacity-20">
              <IconLoader2 className="animate-spin h-12 w-12 text-primary" />
              <p className="font-black uppercase tracking-widest text-sm">Memuat Antrean...</p>
            </div>
          ) : orders.length === 0 ? (
            <Card className="col-span-full border-none shadow-xl rounded-3xl overflow-hidden bg-background py-20 text-center">
              <CardContent className="flex flex-col items-center justify-center gap-6 text-muted-foreground">
                <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <IconCheck size={48} strokeWidth={3} />
                </div>
                <div className="space-y-2">
                  <p className="font-black text-2xl text-foreground uppercase tracking-tighter">Dapur Kosong</p>
                  <p className="font-medium">Semua pesanan telah berhasil diproses.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence mode="popLayout">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: index === 0 ? 1.03 : 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30,
                    layout: { duration: 0.4 }
                  }}
                  className={index === 0 ? 'z-10' : 'z-0'}
                >
                  <Card 
                    className={`group relative h-full flex flex-col border-none shadow-sm hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden bg-background ${
                      index === 0 ? 'ring-4 ring-primary ring-offset-4 ring-offset-muted/20' : ''
                    }`}
                  >
                    {index === 0 && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl flex items-center gap-1.5 z-20 shadow-lg">
                        <IconAlertCircle size={14} strokeWidth={3} /> PRIORITAS UTAMA
                      </div>
                    )}
                    
                    <CardHeader className={`pb-4 pt-8 ${index === 0 ? 'bg-primary/5' : 'bg-muted/30'}`}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="w-fit font-mono text-[9px] font-black bg-background/50 border-none px-2 py-0.5">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </Badge>
                          <span className="text-[10px] font-black text-muted-foreground">POS: {index + 1}</span>
                        </div>
                        <CardTitle className="text-2xl font-black tracking-tighter uppercase line-clamp-1">{order.customer_name}</CardTitle>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 flex-1 flex flex-col gap-5">
                      {/* EWP Transparency Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                          <IconVariable size={14} strokeWidth={3} />
                          <span>Perhitungan EWP</span>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-2xl border-2 border-dashed border-muted flex flex-col gap-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold flex items-center gap-1.5">
                              <IconShoppingCart size={14} className="text-blue-500" />
                              {order.total_items} item
                            </span>
                            <span className="text-muted-foreground">×</span>
                            <span className="font-bold">30d</span>
                            <span className="text-muted-foreground">=</span>
                            <Badge className="bg-blue-500 text-white font-black border-none">
                              {order.ewp}s
                            </Badge>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-blue-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((order.ewp / 600) * 100, 100)}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Arrival & Tie-breaker Section */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                          <IconCalendarEvent size={14} strokeWidth={3} />
                          <span>Logika Tie-Breaker</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">Tiba Pada</span>
                            <span className="font-black text-xs">
                              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                          <IconArrowDown size={16} className="text-muted-foreground/30" />
                          <div className="flex flex-col text-right">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">Status</span>
                            <Badge 
                              variant={order.status === 'processing' ? 'default' : 'secondary'}
                              className={`font-black uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-md ${
                                order.status === 'processing' ? 'animate-pulse' : ''
                              }`}
                            >
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto flex flex-col gap-2 pt-2">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1 h-12 font-black uppercase tracking-widest rounded-xl border-2 hover:bg-muted"
                            onClick={() => {
                              setSelectedOrderId(order.id)
                              setIsDetailsOpen(true)
                            }}
                          >
                            <IconEye size={18} className="mr-2" strokeWidth={3} /> Detail
                          </Button>
                          {order.status === 'waiting' ? (
                            <Button 
                              className="flex-1 h-12 font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20" 
                              onClick={() => updateStatus(order.id, 'processing')}
                            >
                              <IconPlayerPlay className="mr-2 h-5 w-5" strokeWidth={3} /> Mulai
                            </Button>
                          ) : (
                            <Button 
                              className="flex-1 h-12 font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 border-none" 
                              onClick={() => {
                                setPaymentTarget(order)
                                setIsPaymentOpen(true)
                              }}
                            >
                              <IconCheck className="mr-2 h-5 w-5" strokeWidth={3} /> Selesai
                            </Button>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full h-12 font-black uppercase tracking-widest rounded-xl text-destructive hover:bg-destructive/10 border-2"
                          onClick={() => {
                            console.log('Tombol batal diklik untuk pesanan:', order.id)
                            if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
                              updateStatus(order.id, 'cancelled', order.assigned_staff_id)
                            }
                          }}
                        >
                          <IconTrash size={20} strokeWidth={2.5} className="mr-2 inline-block" /> Batalkan Pesanan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <OrderDetailsDialog 
        orderId={selectedOrderId} 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
      />

      <PaymentConfirmationDialog 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        orderId={paymentTarget?.id}
        customerName={paymentTarget?.customer_name || ''}
        totalPrice={paymentTarget?.total_price || 0}
        staffId={paymentTarget?.assigned_staff_id}
        onSuccess={fetchOrders}
      />
    </div>
  )
}

