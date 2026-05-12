'use client'

import * as React from "react"
import { IconBell, IconCheck, IconInfoCircle, IconAlertTriangle, IconCircleCheck, IconX } from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useNotifications, Notification } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function NotificationBell() {
  const [mounted, setMounted] = React.useState(false)
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full bg-background/50">
        <IconBell className="size-5 text-muted-foreground" />
      </Button>
    )
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <IconCircleCheck className="size-4 text-emerald-500" />
      case 'warning': return <IconAlertTriangle className="size-4 text-amber-500" />
      case 'error': return <IconX className="size-4 text-rose-500" />
      default: return <IconInfoCircle className="size-4 text-blue-500" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full bg-background/50 hover:bg-accent/50">
          <IconBell className="size-5 text-muted-foreground" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-background"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-xl border-border/50 bg-background/95 backdrop-blur-md shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">Notifikasi</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => {
                e.preventDefault()
                markAllAsRead()
              }}
            >
              Tandai semua dibaca
            </Button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          <div className="flex flex-col py-1">
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <span className="text-xs text-muted-foreground animate-pulse">Memuat...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 px-4 text-center">
                <div className="rounded-full bg-muted/50 p-3">
                  <IconBell className="size-6 text-muted-foreground/50" />
                </div>
                <p className="text-xs text-muted-foreground">Belum ada notifikasi baru</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {notifications.map((notif) => (
                  <motion.div
                    layout
                    key={notif.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <DropdownMenuItem
                      className={cn(
                        "flex flex-col items-start gap-1 border-b border-border/10 px-4 py-3 transition-colors last:border-0 focus:bg-accent/50",
                        !notif.is_read && "bg-primary/5"
                      )}
                      onSelect={(e) => {
                        e.preventDefault()
                        if (!notif.is_read) markAsRead(notif.id)
                        if (notif.link) router.push(notif.link)
                      }}
                    >
                      <div className="flex w-full items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "rounded-full p-1.5",
                            notif.type === 'success' ? "bg-emerald-500/10" :
                            notif.type === 'warning' ? "bg-amber-500/10" :
                            notif.type === 'error' ? "bg-rose-500/10" :
                            "bg-blue-500/10"
                          )}>
                            {getIcon(notif.type)}
                          </div>
                          <span className={cn(
                            "text-sm font-medium",
                            !notif.is_read ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {notif.title}
                          </span>
                        </div>
                        {!notif.is_read && (
                          <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed ml-8">
                        {notif.message}
                      </p>
                      <div className="flex w-full items-center justify-between mt-1 ml-8">
                        <span className="text-[10px] text-muted-foreground/70">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="border-t border-border/50 px-4 py-2 bg-muted/10">
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto w-full p-0 text-xs text-muted-foreground hover:text-primary transition-colors"
              onClick={() => router.push('/notifications')}
            >
              Lihat semua aktivitas
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
