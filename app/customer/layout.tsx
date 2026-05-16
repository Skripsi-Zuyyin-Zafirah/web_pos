'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  IconLayoutDashboard, 
  IconShoppingCart, 
  IconClock2, 
  IconUser
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const navItems = [
  { href: '/customer', icon: IconLayoutDashboard, label: 'Dasbor' },
  { href: '/customer/shop', icon: IconShoppingCart, label: 'Belanja' },
  { href: '/transactions', icon: IconClock2, label: 'Riwayat' },
  { href: '/profile', icon: IconUser, label: 'Profil' },
]

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Generate breadcrumbs based on pathname
  const breadcrumbs: { label: string; href?: string }[] = [
    { label: "Pelanggan", href: "/customer" },
  ]

  if (pathname === '/customer/shop') {
    breadcrumbs.push({ label: "Belanja" })
  } else if (pathname === '/customer/history') {
    breadcrumbs.push({ label: "Riwayat" })
  } else if (pathname === '/profile') {
    breadcrumbs.push({ label: "Profil" })
  } else if (pathname === '/customer') {
    breadcrumbs.push({ label: "Dasbor" })
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader breadcrumbs={breadcrumbs} />
        <main className="flex flex-1 flex-col pb-28 md:pb-0">
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 bg-muted/20 min-h-full">
                {children}
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Bar - Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around items-center h-16 md:hidden z-50">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center h-full">
                <div className={cn(
                  "flex flex-col items-center gap-1 text-[10px] font-medium transition-all",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}>
                  <item.icon size={20} stroke={2} />
                  <span>{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>
      </SidebarInset>
    </SidebarProvider>
  )
}
