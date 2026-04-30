'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MinHeap, HeapItem } from '@/lib/utils/min-heap'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { IconClock, IconPlayerPlay, IconCheck, IconLoader2, IconAlertCircle, IconTrash, IconHistory, IconChefHat, IconShoppingCart } from '@tabler/icons-react'

export default function QueuePage() {
  const [orders, setOrders] = useState<HeapItem[]>([])
  const [loading, setLoading] = useState(true)
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
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .neq('status', 'done')
      .neq('status', 'cancelled')

    if (error) {
      toast.error('Failed to fetch queue')
    } else {
      const heap = new MinHeap()
      data.forEach((order) => heap.push(order))
      setOrders(heap.getSortedItems())
    }
    setLoading(false)
  }

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success(`Order moved to ${status}`)
    }
  }

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <div className="p-6 bg-background border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tighter uppercase">Kitchen Dispatch</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Prioritized using SJF Min-Heap Algorithm</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="h-10 px-4 rounded-xl font-black bg-primary/10 text-primary border-primary/20 shadow-none text-sm uppercase tracking-wider">
            {orders.length} ACTIVE ORDERS
          </Badge>
          <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground">
            <IconHistory size={20} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-40 gap-4 opacity-20">
              <IconLoader2 className="animate-spin h-12 w-12 text-primary" />
              <p className="font-black uppercase tracking-widest text-sm">Loading Queue...</p>
            </div>
          ) : orders.length === 0 ? (
            <Card className="col-span-full border-none shadow-xl rounded-3xl overflow-hidden bg-background py-20 text-center">
              <CardContent className="flex flex-col items-center justify-center gap-6 text-muted-foreground">
                <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <IconCheck size={48} strokeWidth={3} />
                </div>
                <div className="space-y-2">
                  <p className="font-black text-2xl text-foreground uppercase tracking-tighter">Kitchen is Empty</p>
                  <p className="font-medium">All orders have been successfully processed.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            orders.map((order, index) => (
              <Card 
                key={order.id} 
                className={`group relative flex flex-col border-none shadow-sm hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden bg-background ${
                  index === 0 ? 'ring-4 ring-primary ring-offset-4 ring-offset-muted/20 scale-[1.03] z-10' : ''
                }`}
              >
                {index === 0 && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl flex items-center gap-1.5 z-20 shadow-lg">
                    <IconAlertCircle size={14} strokeWidth={3} /> CRITICAL PRIORITY
                  </div>
                )}
                
                <CardHeader className={`pb-6 pt-8 ${index === 0 ? 'bg-primary/5' : 'bg-muted/30'}`}>
                  <div className="flex flex-col gap-2">
                    <Badge variant="outline" className="w-fit font-mono text-[10px] font-black bg-background/50 border-none px-2 py-0.5">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </Badge>
                    <CardTitle className="text-2xl font-black tracking-tighter uppercase line-clamp-1">{order.customer_name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={order.status === 'processing' ? 'default' : 'secondary'}
                        className={`font-black uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-md ${
                          order.status === 'processing' ? 'animate-pulse' : ''
                        }`}
                      >
                        {order.status === 'processing' ? <IconChefHat size={12} className="mr-1" /> : null}
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 flex-1 flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-500/5 p-3 rounded-2xl border-2 border-blue-500/5 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-600/70">Complexity</p>
                      <div className="flex items-center gap-2 text-blue-600">
                        <IconClock size={16} strokeWidth={3} />
                        <span className="font-black text-sm">{Math.round(order.ewp / 60)}m</span>
                      </div>
                    </div>
                    <div className="bg-amber-500/5 p-3 rounded-2xl border-2 border-amber-500/5 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/70">Quantity</p>
                      <div className="flex items-center gap-2 text-amber-600">
                        <IconShoppingCart size={16} strokeWidth={3} />
                        <span className="font-black text-sm">{order.total_items} Items</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex justify-between px-1">
                    <span>RECEIVED AT</span>
                    <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="mt-auto flex gap-2">
                    {order.status === 'waiting' ? (
                      <Button 
                        className="flex-1 h-12 font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20" 
                        onClick={() => updateStatus(order.id, 'processing')}
                      >
                        <IconPlayerPlay className="mr-2 h-5 w-5" strokeWidth={3} /> Start
                      </Button>
                    ) : (
                      <Button 
                        className="flex-1 h-12 font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 border-none" 
                        onClick={() => updateStatus(order.id, 'done')}
                      >
                        <IconCheck className="mr-2 h-5 w-5" strokeWidth={3} /> Finish
                      </Button>
                    )}
                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10 border-2">
                      <IconTrash size={20} strokeWidth={2.5} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
