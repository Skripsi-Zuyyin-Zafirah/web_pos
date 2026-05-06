'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStaff } from '@/hooks/use-staff'
import { StaffStatusGrid, QueueStatsCounter } from '@/components/cashier/dashboard-components'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IconLayoutDashboard, IconActivity, IconRefresh, IconArrowRight, IconChefHat } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CashierDashboardPage() {
  const { staff, loading: staffLoading } = useStaff()
  const [stats, setStats] = useState({ waiting: 0, processing: 0, done: 0 })
  const [activeOrders, setActiveOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchOrderStats()

    const channel = supabase
      .channel('order-stats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrderStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchOrderStats = async () => {
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('id, status, customer_name, assigned_staff_id, staff(name)')
    
    if (!error && allOrders) {
      const waiting = allOrders.filter(o => o.status === 'waiting').length
      const processing = allOrders.filter(o => o.status === 'processing').length
      
      // Get done orders today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: doneCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'done')
        .gte('updated_at', today.toISOString())

      setStats({ 
        waiting, 
        processing, 
        done: doneCount || 0 
      })

      // Set active orders (processing)
      setActiveOrders(allOrders.filter(o => o.status === 'processing'))
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full bg-muted/20">
      {/* Header */}
      <div className="p-6 bg-background border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <IconLayoutDashboard size={20} strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Cashier Dashboard</h1>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-10">Real-time store & staff monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={fetchOrderStats}>
            <IconRefresh size={14} className="mr-2" /> Refresh
          </Button>
          <Button asChild className="rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
            <Link href="/cashier/queue">
              View Queue <IconArrowRight size={16} className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* Statistics Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <IconActivity size={18} className="text-primary" strokeWidth={3} />
            <h2 className="font-black uppercase tracking-widest text-xs">Live Statistics</h2>
          </div>
          <QueueStatsCounter 
            waiting={stats.waiting} 
            processing={stats.processing} 
            done={stats.done} 
          />
        </div>

        {/* Staff Availability Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <IconChefHat size={18} className="text-primary" strokeWidth={3} />
            <h2 className="font-black uppercase tracking-widest text-xs">Staff Availability</h2>
          </div>
          <StaffStatusGrid staff={staff} loading={staffLoading} />
        </div>

        {/* Active Tasks Table/List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <IconActivity size={18} className="text-primary" strokeWidth={3} />
            <h2 className="font-black uppercase tracking-widest text-xs">Active Tasks</h2>
          </div>
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-background">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order ID</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assigned To</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {activeOrders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-medium">
                          No orders are currently being processed.
                        </td>
                      </tr>
                    ) : (
                      activeOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs font-bold bg-muted px-2 py-1 rounded-lg">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-black text-sm uppercase tracking-tight">{order.customer_name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <IconChefHat size={16} />
                              </div>
                              <span className="font-bold text-sm">{order.staff?.name || 'Unassigned'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Badge className="bg-amber-500/10 text-amber-700 border-none font-black text-[9px] uppercase tracking-widest animate-pulse">
                              Processing
                            </Badge>
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
      </div>
    </div>
  )
}
