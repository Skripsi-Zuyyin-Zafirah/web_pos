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

const navItems = [
  { href: '/customer', icon: IconLayoutDashboard, label: 'Dashboard' },
  { href: '/customer/shop', icon: IconShoppingCart, label: 'Belanja' },
  { href: '/customer/history', icon: IconClock2, label: 'Riwayat' },
  { href: '/customer/profile', icon: IconUser, label: 'Profil' },
]

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
        <div className="h-20 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-[#2FA4AF] p-1.5 rounded-lg text-white">
              <IconShoppingCart size={20} />
            </div>
            <span className="font-black text-lg tracking-tighter">CUSTOMER PORTAL</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all",
                  isActive 
                    ? "bg-[#2FA4AF]/10 text-[#2FA4AF]" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}>
                  <item.icon size={20} stroke={2} />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
              Z
            </div>
            <div>
              <p className="text-sm font-bold">Zuyyin</p>
              <p className="text-xs text-slate-500">Pelanggan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom Bar - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 md:hidden z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center h-full">
              <div className={cn(
                "flex flex-col items-center gap-1 text-xs font-medium transition-all",
                isActive ? "text-[#2FA4AF]" : "text-slate-500 hover:text-slate-900"
              )}>
                <item.icon size={22} stroke={2} />
                <span>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
