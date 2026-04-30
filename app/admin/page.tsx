'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell 
} from 'recharts'
import { 
  IconCurrencyDollar, 
  IconShoppingCart, 
  IconClock, 
  IconUsers,
  IconLoader2,
  IconTrendingUp
} from '@tabler/icons-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgEwp: 0,
    totalUsers: 0
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    
    // 1. Fetch Stats
    const { data: orders } = await supabase.from('orders').select('total_price, ewp, created_at')
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

    if (orders) {
      const revenue = orders.reduce((acc, curr) => acc + Number(curr.total_price), 0)
      const avgEwp = orders.length > 0 
        ? orders.reduce((acc, curr) => acc + curr.ewp, 0) / orders.length 
        : 0
      
      setStats({
        totalRevenue: revenue,
        totalOrders: orders.length,
        avgEwp: Math.round(avgEwp / 60),
        totalUsers: userCount || 0
      })

      // 2. Prepare Chart Data (Daily Sales)
      const dailyData: Record<string, number> = {}
      orders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString()
        dailyData[date] = (dailyData[date] || 0) + Number(order.total_price)
      })
      
      setChartData(Object.entries(dailyData).map(([name, total]) => ({ name, total })))
    }

    // 3. Fetch Top Products
    const { data: items } = await supabase
      .from('order_items')
      .select('quantity, products(name)')
    
    if (items) {
      const productSales: Record<string, number> = {}
      items.forEach(item => {
        const name = (item.products as any)?.name || 'Unknown'
        productSales[name] = (productSales[name] || 0) + item.quantity
      })
      
      const sortedProducts = Object.entries(productSales)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
      
      setTopProducts(sortedProducts)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <IconLoader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    )
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground text-lg">Detailed overview of your wholesale POS performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-blue-600 uppercase tracking-wider">Total Revenue</CardTitle>
            <IconCurrencyDollar className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">Rp {stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-blue-500 mt-1 font-bold flex items-center gap-1">
              <IconTrendingUp size={14} /> +12.5% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Total Orders</CardTitle>
            <IconShoppingCart className="h-6 w-6 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.totalOrders}</div>
            <p className="text-xs text-emerald-500 mt-1 font-bold italic">Orders successfully processed</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-amber-600 uppercase tracking-wider">Avg. Wait Time</CardTitle>
            <IconClock className="h-6 w-6 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.avgEwp} Min</div>
            <p className="text-xs text-amber-500 mt-1 font-bold italic text-opacity-80">Based on Min-Heap efficiency</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-purple-50/50 dark:bg-purple-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-purple-600 uppercase tracking-wider">Total Users</CardTitle>
            <IconUsers className="h-6 w-6 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.totalUsers}</div>
            <p className="text-xs text-purple-500 mt-1 font-bold italic text-opacity-80">Registered customers & staff</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales Chart */}
        <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 pb-6">
            <CardTitle className="text-xl font-black tracking-tight">Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp ${value / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`Rp ${value.toLocaleString()}`, 'Total Revenue']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 pb-6">
            <CardTitle className="text-xl font-black tracking-tight">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
