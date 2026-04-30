"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
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
import { IconDashboard, IconListDetails, IconChartBar, IconFolder, IconUsers, IconCamera, IconFileDescription, IconFileAi, IconSettings, IconHelp, IconSearch, IconDatabase, IconReport, IconFileWord, IconInnerShadowTop } from "@tabler/icons-react"

const data = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: <IconDashboard />,
    },
    {
      title: "Product Management",
      url: "/admin/products",
      icon: <IconDatabase />,
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: <IconListDetails />,
    },
    {
      title: "User Management",
      url: "/admin/users",
      icon: <IconUsers />,
    },
  ],
  navSecondary: [
    {
      title: "POS Interface",
      url: "/cashier/pos",
      icon: <IconInnerShadowTop />,
    },
    {
      title: "Order Queue",
      url: "/queue",
      icon: <IconListDetails />,
    },
  ],
  documents: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
