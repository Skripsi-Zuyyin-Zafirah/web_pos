'use client'

import * as React from "react"
import {
  IconArchive,
  IconCategory,
  IconChartBar,
  IconLayoutDashboard,
  IconSettings,
  IconShoppingCart,
  IconUsers,
  IconHistory,
  IconPackage
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
  const { user } = useAuth()
  
  // Define menu items based on role
  const adminItems = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconLayoutDashboard,
    },
    {
      title: "Inventory",
      url: "#",
      icon: IconPackage,
      isActive: true,
      items: [
        {
          title: "Products",
          url: "/admin/products",
        },
        {
          title: "Categories",
          url: "/admin/categories",
        },
      ],
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: IconUsers,
    },
  ]

  const cashierItems = [
    {
      title: "POS Interface",
      url: "/cashier/pos",
      icon: IconShoppingCart,
    },
    {
      title: "Order Queue",
      url: "/cashier/queue",
      icon: IconHistory,
    },
  ]

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <IconArchive className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Wholesale POS</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={adminItems} label="Management" />
        <NavMain items={cashierItems} label="Transactions" />
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
