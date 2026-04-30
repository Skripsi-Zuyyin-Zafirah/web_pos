'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MinHeap, HeapItem } from '@/lib/utils/min-heap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { IconClock, IconPlayerPlay, IconCheck, IconLoader2, IconAlertCircle, IconTrash } from '@tabler/icons-react'

export default function QueuePage() {
  const [orders, setOrders] = useState<HeapItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()

    // Realtime subscription
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Queue</h1>
          <p className="text-muted-foreground">Prioritized by Min-Heap Algorithm (Shortest Job First)</p>
        </div>
        <Badge variant="outline" className="h-8 px-4 text-sm font-medium border-blue-500 text-blue-600 bg-blue-50">
          {orders.length} Orders in Queue
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <IconLoader2 className="animate-spin h-10 w-10 text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="col-span-full border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <IconCheck size={48} className="mb-4 opacity-20" />
              <p>No waiting orders. Good job!</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order, index) => (
            <Card 
              key={order.id} 
              className={`relative overflow-hidden border-2 ${
                index === 0 ? 'border-blue-500 shadow-blue-100 shadow-xl scale-[1.02]' : 'border-border'
              } transition-all`}
            >
              {index === 0 && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg flex items-center gap-1 animate-pulse">
                  <IconAlertCircle size={14} /> NEXT UP
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">#{order.id.slice(0, 5).toUpperCase()}</CardTitle>
                    <p className="text-sm font-medium text-muted-foreground">{order.customer_name}</p>
                  </div>
                  <Badge variant={order.status === 'processing' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <IconClock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-semibold">Estimated Time</span>
                  </div>
                  <span className="font-bold text-blue-600">{order.ewp / 60} Min</span>
                </div>
                
                <div className="text-sm space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items</span>
                    <span className="font-medium text-foreground">{order.total_items}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Ordered At</span>
                    <span className="font-medium text-foreground">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {order.status === 'waiting' ? (
                    <Button 
                      className="flex-1" 
                      onClick={() => updateStatus(order.id, 'processing')}
                    >
                      <IconPlayerPlay className="mr-2 h-4 w-4" /> Start
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700" 
                      onClick={() => updateStatus(order.id, 'done')}
                    >
                      <IconCheck className="mr-2 h-4 w-4" /> Finish
                    </Button>
                  )}
                  <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10">
                    <IconTrash size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
