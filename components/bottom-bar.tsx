'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  IconLayoutDashboard, 
  IconShoppingCart, 
  IconClock2, 
  IconUser,
  IconPackage,
  IconUsers,
  IconReceipt,
  IconHistory
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/auth-provider'
import { motion } from 'framer-motion'

export function BottomBar() {
  const pathname = usePathname()
  const { profile } = useAuth()
  
  const role = (profile?.role || 'pelanggan').toLowerCase()

  const adminItems = [
    { href: '/admin', icon: IconLayoutDashboard, label: 'Dasbor' },
    { href: '/admin/products', icon: IconPackage, label: 'Produk' },
    { href: '/admin/users', icon: IconUsers, label: 'Pengguna' },
    { href: '/transactions', icon: IconReceipt, label: 'Transaksi' },
  ]

  const cashierItems = [
    { href: '/cashier/dashboard', icon: IconLayoutDashboard, label: 'Dasbor' },
    { href: '/cashier/pos', icon: IconShoppingCart, label: 'POS' },
    { href: '/cashier/queue', icon: IconHistory, label: 'Antrean' },
    { href: '/transactions', icon: IconReceipt, label: 'Transaksi' },
  ]

  const customerItems = [
    { href: '/customer', icon: IconLayoutDashboard, label: 'Dasbor' },
    { href: '/customer/shop', icon: IconShoppingCart, label: 'Belanja' },
    { href: '/transactions', icon: IconClock2, label: 'Riwayat' },
    { href: '/profile', icon: IconUser, label: 'Profil' },
  ]

  let navItems = customerItems
  if (role === 'admin') navItems = adminItems
  else if (role === 'cashier') navItems = cashierItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-20 md:hidden z-50 px-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        // Precise active logic: Dashboard only matches exact, others match prefix
        const isDashboard = item.href === '/admin' || item.href === '/cashier/dashboard' || item.href === '/customer'
        const isActive = isDashboard ? pathname === item.href : pathname.startsWith(item.href)
        
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className="relative flex-1 flex flex-col items-center justify-center h-full transition-all active:scale-90"
          >
            {isActive && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="absolute inset-x-1 top-2 bottom-2 bg-primary/10 dark:bg-primary/20 rounded-2xl -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <div className={cn(
              "flex flex-col items-center gap-1.5 transition-colors duration-300",
              isActive ? "text-primary" : "text-slate-400 dark:text-slate-500"
            )}>
              <div className="relative">
                <item.icon 
                  size={24} 
                  stroke={isActive ? 2.5 : 2} 
                  className={cn(
                    "transition-transform duration-300",
                    isActive ? "scale-110" : "scale-100"
                  )}
                />
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-dot"
                    className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
                  />
                )}
              </div>
              <span className={cn(
                "text-[10px] tracking-tight leading-none",
                isActive ? "font-bold" : "font-medium"
              )}>
                {item.label}
              </span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
