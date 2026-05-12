'use client'

import * as React from "react"
import { SiteHeader } from "@/components/site-header"
import { useNotifications } from "@/hooks/use-notifications"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { 
  IconBell, 
  IconCircleCheck, 
  IconAlertTriangle, 
  IconX, 
  IconInfoCircle,
  IconDotsVertical,
  IconCheck
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications()

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <IconCircleCheck className="size-5 text-emerald-500" />
      case 'warning': return <IconAlertTriangle className="size-5 text-amber-500" />
      case 'error': return <IconX className="size-5 text-rose-500" />
      default: return <IconInfoCircle className="size-5 text-blue-500" />
    }
  }

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
        <div className="flex min-h-screen flex-col bg-muted/20">
          <SiteHeader title="Notifikasi" breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Notifikasi" }]} />
          
          <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Semua Notifikasi</h1>
              <p className="text-muted-foreground">Kelola semua pemberitahuan sistem dan aktivitas Anda.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
              <IconCheck className="mr-2 size-4" />
              Tandai semua dibaca
            </Button>
          </div>

          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-4 p-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 rounded-full bg-muted p-4">
                    <IconBell className="size-10 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-medium">Belum ada notifikasi</h3>
                  <p className="text-sm text-muted-foreground">Semua aktivitas akan muncul di sini.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={cn(
                        "group flex items-start gap-4 p-4 transition-colors hover:bg-muted/50",
                        !notif.is_read && "bg-primary/5"
                      )}
                    >
                      <div className={cn(
                        "mt-1 rounded-full p-2",
                        notif.type === 'success' ? "bg-emerald-500/10" :
                        notif.type === 'warning' ? "bg-amber-500/10" :
                        notif.type === 'error' ? "bg-rose-500/10" :
                        "bg-blue-500/10"
                      )}>
                        {getIcon(notif.type)}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className={cn(
                              "text-sm font-semibold",
                              !notif.is_read ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {notif.title}
                            </h4>
                            {!notif.is_read && (
                              <Badge variant="default" className="h-4 px-1.5 text-[10px]">Baru</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(notif.created_at), "d MMM yyyy, HH:mm", { locale: id })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notif.message}
                        </p>
                        
                        {notif.link && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 text-primary"
                            onClick={() => {
                              markAsRead(notif.id)
                              router.push(notif.link!)
                            }}
                          >
                            Lihat detail
                          </Button>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <IconDotsVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notif.is_read && (
                            <DropdownMenuItem onClick={() => markAsRead(notif.id)}>
                              Tandai dibaca
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </SidebarInset>
    </SidebarProvider>
  )
}
