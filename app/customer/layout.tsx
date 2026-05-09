'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  IconLayoutDashboard, 
  IconShoppingCart, 
  IconClock2, 
  IconUser,
  IconChevronLeft,
  IconChevronRight,
  IconLogout,
  IconLogin
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

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
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Sidebar - Desktop */}
      <aside className={cn(
        "hidden md:flex flex-col bg-white border-r border-slate-200 h-screen fixed top-0 left-0 transition-all duration-300 z-30",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className={cn(
          "h-20 flex items-center border-b border-slate-200",
          isCollapsed ? "justify-center" : "justify-between px-4"
        )}>
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="bg-[#2FA4AF] p-1.5 rounded-lg text-white flex-shrink-0">
              <IconShoppingCart size={20} />
            </div>
            {!isCollapsed && (
              <span className="font-black text-lg tracking-tighter truncate">CUSTOMER</span>
            )}
          </div>
          {!isCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCollapsed(true)}
              className="text-slate-500 hover:text-[#2FA4AF] h-8 w-8"
            >
              <IconChevronLeft size={16} />
            </Button>
          )}
          {isCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCollapsed(false)}
              className="text-slate-500 hover:text-[#2FA4AF] h-8 w-8 absolute -right-4 top-6 bg-white border border-slate-200 rounded-full shadow-md z-10 flex items-center justify-center"
            >
              <IconChevronRight size={14} />
            </Button>
          )}
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all",
                  isCollapsed ? "justify-center" : "",
                  isActive 
                    ? "bg-[#2FA4AF]/10 text-[#2FA4AF]" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}>
                  <item.icon size={20} stroke={2} className="flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className={cn(
            "flex items-center gap-3",
            isCollapsed ? "justify-center" : "px-2"
          )}>
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 flex-shrink-0 text-sm">
              Z
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">Zuyyin</p>
                <p className="text-xs text-slate-500 truncate">Pelanggan</p>
              </div>
            )}
          </div>
          
          {user ? (
            <Button 
              variant="ghost" 
              className={cn(
                "w-full flex items-center gap-3 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-medium text-sm transition-all h-10",
                isCollapsed ? "justify-center px-0" : "px-4 justify-start"
              )}
              onClick={handleLogout}
            >
              <IconLogout size={20} stroke={2} className="flex-shrink-0" />
              {!isCollapsed && <span>Keluar</span>}
            </Button>
          ) : (
            <Link href="/auth/login" className="w-full block">
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full flex items-center gap-3 text-slate-600 hover:text-[#2FA4AF] hover:bg-[#2FA4AF]/5 rounded-xl font-medium text-sm transition-all h-10",
                  isCollapsed ? "justify-center px-0" : "px-4 justify-start"
                )}
              >
                <IconLogin size={20} stroke={2} className="flex-shrink-0" />
                {!isCollapsed && <span>Masuk</span>}
              </Button>
            </Link>
          )}
        </div>
      </aside>

      {/* Content Area */}
      <main className={cn(
        "flex-1 pb-20 md:pb-0 flex flex-col transition-all duration-300",
        isCollapsed ? "md:ml-16" : "md:ml-64"
      )}>
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 h-14 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/customer" className="hover:text-[#2FA4AF] transition-colors flex items-center gap-1">
              <IconLayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>
            {pathname !== '/customer' && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-medium flex items-center gap-1">
                  {pathname === '/customer/shop' ? (
                    <><IconShoppingCart size={16} /><span>Belanja</span></>
                  ) : pathname === '/customer/history' ? (
                    <><IconClock2 size={16} /><span>Riwayat</span></>
                  ) : pathname === '/customer/profile' ? (
                    <><IconUser size={16} /><span>Profil</span></>
                  ) : (
                    <span>Detail</span>
                  )}
                </span>
              </>
            )}
          </div>

          {/* Right side - User Info (Visible on mobile since sidebar is hidden) */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
              Z
            </div>
            <span className="text-xs font-bold text-slate-700">Zuyyin</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
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
