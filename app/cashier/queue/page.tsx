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
  IconCalendarEvent
} from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'

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
      .update({ status, updated_at: new Date().toISOString() })
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
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <IconHistory size={20} strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Kitchen Dispatch</h1>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-10">
            SJF Min-Heap: Priority = (Items × 30s) + Arrival Tie-breaker
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="h-10 px-4 rounded-xl font-black bg-primary/10 text-primary border-primary/20 shadow-none text-sm uppercase tracking-wider">
            {orders.length} ACTIVE ORDERS
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
                        <IconAlertCircle size={14} strokeWidth={3} /> TOP PRIORITY
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
                          <span>EWP Calculation</span>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-2xl border-2 border-dashed border-muted flex flex-col gap-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold flex items-center gap-1.5">
                              <IconShoppingCart size={14} className="text-blue-500" />
                              {order.total_items} items
                            </span>
                            <span className="text-muted-foreground">×</span>
                            <span className="font-bold">30s</span>
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
                          <span>Tie-Breaker Logic</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">Arrived At</span>
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

                      <div className="mt-auto flex gap-2 pt-2">
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
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}

function IconRefresh({ size = 24, className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
    </svg>
  )
}
