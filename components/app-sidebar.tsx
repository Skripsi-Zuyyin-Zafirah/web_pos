'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconArchive,
  IconCategory,
  IconChartBar,
  IconLayoutDashboard,
  IconSettings,
  IconShoppingCart,
  IconUsers,
  IconHistory,
  IconPackage,
  IconClock2,
  IconUser
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/providers/auth-provider"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, profile, loading } = useAuth()
  const pathname = usePathname()
  
  const role = (profile?.role || 'pelanggan').toLowerCase()
  const isCustomerPath = pathname.startsWith('/customer')

  if (loading) return <Sidebar {...props} /> // Tetap tampilkan rangka sidebar kosong saat loading
  
  // Define menu items based on role
  const adminItems = [
    {
      title: "Dasbor",
      url: "/admin",
      icon: IconLayoutDashboard,
    },
    {
      title: "Inventaris",
      url: "#",
      icon: IconPackage,
      isActive: true,
      items: [
        {
          title: "Produk",
          url: "/admin/products",
        },
        {
          title: "Kategori",
          url: "/admin/categories",
        },
      ],
    },
    {
      title: "Pengguna",
      url: "/admin/users",
      icon: IconUsers,
    },
  ]

  const cashierItems = [
    {
      title: "Dasbor",
      url: "/cashier/dashboard",
      icon: IconLayoutDashboard,
    },
    {
      title: "Antarmuka POS",
      url: "/cashier/pos",
      icon: IconShoppingCart,
    },
    {
      title: "Antrean Pesanan",
      url: "/cashier/queue",
      icon: IconHistory,
    },
  ]

  const customerItems = [
    {
      title: "Dasbor",
      url: "/customer",
      icon: IconLayoutDashboard,
    },
    {
      title: "Belanja",
      url: "/customer/shop",
      icon: IconShoppingCart,
    },
    {
      title: "Riwayat",
      url: "/customer/history",
      icon: IconClock2,
    },
    {
      title: "Profil",
      url: "/profile",
      icon: IconUser,
    },
  ]

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <IconArchive className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Wholesale POS</span>
                  <span className="">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isCustomerPath ? (
          <NavMain items={customerItems} label="Menu Pelanggan" />
        ) : (
          <>
            {role === 'admin' && <NavMain items={adminItems} label="Manajemen" />}
            {(role === 'admin' || role === 'cashier') && <NavMain items={cashierItems} label="Transaksi" />}
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User",
          email: user?.email || "",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
