import { useEffect } from 'react'
import { useNotificationStore, type Notification } from '@/store/use-notification-store'

export type { Notification }

export function useNotifications() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    subscribeToNotifications 
  } = useNotificationStore()

  useEffect(() => {
    const unsubscribe = subscribeToNotifications()
    return () => {
      unsubscribe()
    }
  }, [subscribeToNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  }
}
