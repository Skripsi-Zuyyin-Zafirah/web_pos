'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MinHeap, HeapItem } from '@/lib/utils/min-heap'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  IconSearch, 
  IconClock, 
  IconLoader2, 
  IconCheck, 
  IconTrendingUp, 
  IconMoodSmile,
  IconArrowBadgeUpFilled
} from '@tabler/icons-react'

export default function QueueTrackingPage() {
  const [orders, setOrders] = useState<HeapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchId, setSearchId] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel('public-queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
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

    if (!error) {
      const heap = new MinHeap()
      data.forEach(order => heap.push(order))
      setOrders(heap.getSortedItems())
    }
    setLoading(false)
  }

  const myOrderIndex = useMemo(() => {
    if (!searchId) return -1
    return orders.findIndex(o => o.id.toLowerCase().includes(searchId.toLowerCase()))
  }, [orders, searchId])

  const totalWaitTime = useMemo(() => {
    if (myOrderIndex === -1) return 0
    return orders.slice(0, myOrderIndex + 1).reduce((acc, curr) => acc + curr.ewp, 0)
  }, [orders, myOrderIndex])

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-16 px-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 translate-x-1/4">
          <IconTrendingUp size={240} />
        </div>
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <Badge className="bg-blue-500 hover:bg-blue-600 border-none px-4 py-1 text-sm">Real-time Priority Queue</Badge>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Track Your Order</h1>
          <p className="text-slate-400 text-lg max-w-xl">
            Our intelligent Min-Heap system ensures the shortest jobs are processed first to minimize overall wait time.
          </p>
          
          <div className="relative max-w-md pt-4">
            <IconSearch className="absolute left-4 top-[calc(1rem+50%)] -translate-y-1/2 h-6 w-6 text-slate-500" />
            <Input 
              placeholder="Enter your Order ID (e.g. #abc12)" 
              className="h-16 pl-12 text-lg bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 shadow-2xl rounded-2xl"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto -mt-10 px-6 space-y-10">
        {/* Highlight Section */}
        {myOrderIndex !== -1 && (
          <Card className="border-none shadow-2xl bg-primary text-primary-foreground rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <IconMoodSmile className="h-6 w-6" />
                    </div>
                    <span className="font-bold uppercase tracking-widest text-sm text-primary-foreground/80">Your Order Status</span>
                  </div>
                  <h2 className="text-5xl font-black tracking-tighter">
                    {myOrderIndex === 0 ? "Currently Up Next!" : `${myOrderIndex} Orders Ahead`}
                  </h2>
                  <div className="flex items-center gap-6">
                    <div className="space-y-1">
                      <p className="text-xs text-primary-foreground/60 font-bold uppercase tracking-wider">Queue Position</p>
                      <p className="text-2xl font-black">#{myOrderIndex + 1}</p>
                    </div>
                    <div className="w-px h-10 bg-primary-foreground/20" />
                    <div className="space-y-1">
                      <p className="text-xs text-primary-foreground/60 font-bold uppercase tracking-wider">Estimated Wait</p>
                      <p className="text-2xl font-black">{Math.ceil(totalWaitTime / 60)} Minutes</p>
                    </div>
                  </div>
                </div>
                <div className="md:w-48 flex flex-col justify-center items-center p-6 bg-white/10 rounded-2xl backdrop-blur-md">
                  <Progress value={((orders.length - myOrderIndex) / orders.length) * 100} className="h-3 bg-white/20 mb-3" />
                  <p className="text-xs font-bold text-center opacity-80">
                    Priority: {orders[myOrderIndex].ewp / 60}m job
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Queue List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Live Queue Board
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </h3>
            <Badge variant="outline" className="border-none bg-muted px-3 py-1 font-bold">
              {orders.length} Active Jobs
            </Badge>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <IconLoader2 className="animate-spin h-10 w-10 text-primary" />
              <p className="text-muted-foreground font-medium">Calibrating priority queue...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-3xl border-2 border-dashed flex flex-col items-center">
              <IconCheck size={64} className="text-muted-foreground opacity-20 mb-4" />
              <p className="text-xl text-muted-foreground font-bold">All caught up!</p>
              <p className="text-muted-foreground">No orders in the waiting list right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => {
                const isSelected = searchId && order.id.toLowerCase().includes(searchId.toLowerCase())
                return (
                  <Card 
                    key={order.id} 
                    className={`border-none shadow-sm transition-all duration-300 ${
                      isSelected 
                        ? "ring-4 ring-primary ring-offset-4 scale-[1.02]" 
                        : index === 0 
                        ? "bg-blue-50/50 dark:bg-blue-950/20" 
                        : "bg-card"
                    } hover:shadow-md rounded-2xl`}
                  >
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg ${
                          index === 0 ? "bg-blue-500 text-white shadow-lg shadow-blue-200" : "bg-muted text-muted-foreground"
                        }`}>
                          {index + 1}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-lg uppercase tracking-tighter">#{order.id.slice(0, 5)}</span>
                            {order.status === 'processing' && (
                              <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 border-none animate-pulse">
                                Processing
                              </Badge>
                            )}
                            {index === 0 && order.status === 'waiting' && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                                Up Next
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-bold text-muted-foreground">
                            {order.customer_name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="hidden sm:flex flex-col items-end">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Wait Time</p>
                          <div className="flex items-center gap-1.5">
                            <IconClock size={16} className="text-blue-500" />
                            <span className="text-lg font-black text-slate-700 dark:text-slate-200">
                              {order.ewp / 60}m
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="bg-primary text-primary-foreground p-2 rounded-full animate-bounce">
                            <IconArrowBadgeUpFilled size={24} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
