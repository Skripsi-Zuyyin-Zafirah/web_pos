'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  IconShoppingCart, 
  IconTrendingUp, 
  IconUsers, 
  IconArrowRight, 
  IconLayoutDashboard,
  IconClock2
} from '@tabler/icons-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="h-16 border-b flex items-center justify-between px-6 md:px-20 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <IconTrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-black tracking-tighter">WHOLESALE POS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="font-bold">Login</Button>
          </Link>
          <Link href="/auth/register">
            <Button className="font-bold rounded-full px-6">Sign Up</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 md:px-20 bg-gradient-to-b from-muted/50 to-background text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
          
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              Intelligent Point of Sale for <span className="text-primary">Wholesale Commerce</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Maximize efficiency with our automated Min-Heap priority queue. Shortest jobs get processed first, keeping your customers happy and your staff productive.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/menu">
                <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-full shadow-xl">
                  Browse Menu <IconArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link href="/queue">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold rounded-full border-2">
                  Track Queue <IconClock2 className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 px-6 md:px-20 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-xl bg-card rounded-3xl overflow-hidden group hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-10 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <IconTrendingUp size={32} stroke={2.5} />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Priority Queue</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our algorithm automatically prioritizes small orders, reducing the bottleneck of large wholesale transactions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-card rounded-3xl overflow-hidden group hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-10 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <IconShoppingCart size={32} stroke={2.5} />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Wholesale POS</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Bulk order management with real-time stock tracking and automated EWP calculations for every transaction.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-card rounded-3xl overflow-hidden group hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-10 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <IconLayoutDashboard size={32} stroke={2.5} />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Admin Insights</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Monitor your business performance with beautiful analytics, sales trends, and staff productivity metrics.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-20 px-6 md:px-20 bg-muted/30 border-t border-b">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-4xl font-black tracking-tighter">Ready to optimize your staff?</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <Link href="/admin">
                <div className="p-8 bg-card rounded-3xl shadow-lg border-2 border-transparent hover:border-primary transition-all group">
                  <IconUsers size={48} className="mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <h4 className="text-xl font-bold">Admin Portal</h4>
                  <p className="text-sm text-muted-foreground mt-2">Manage products, users, and view analytics.</p>
                </div>
              </Link>
              <Link href="/cashier/pos">
                <div className="p-8 bg-card rounded-3xl shadow-lg border-2 border-transparent hover:border-primary transition-all group">
                  <IconShoppingCart size={48} className="mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <h4 className="text-xl font-bold">Cashier Interface</h4>
                  <p className="text-sm text-muted-foreground mt-2">Fast transaction entry and queue management.</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t text-center text-muted-foreground text-sm font-medium">
        <p>&copy; 2026 Wholesale POS System. Built for speed and efficiency.</p>
      </footer>
    </div>
  )
}
