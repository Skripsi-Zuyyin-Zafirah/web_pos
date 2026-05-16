import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { BottomBar } from "@/components/bottom-bar"

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader breadcrumbs={[{ label: "Kasir", href: "/cashier/pos" }, { label: "Antarmuka POS" }]} />
        <main className="flex flex-1 flex-col pb-28 md:pb-0 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </main>
        <BottomBar />
      </SidebarInset>
    </SidebarProvider>
  )
}
