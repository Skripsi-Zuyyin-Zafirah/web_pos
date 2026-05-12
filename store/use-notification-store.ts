import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type Notification = {
  id: string
  user_id: string | null
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  link: string | null
  is_read: boolean
  created_at: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  subscribeToNotifications: () => () => void
}

const supabase = createClient()

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: true,

  fetchNotifications: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Ambil role user dari profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const isStaff = profile?.role === 'admin' || profile?.role === 'cashier'
      
      let query = supabase
        .from('notifications')
        .select('*')
      
      if (isStaff) {
        // Staff melihat notifikasi miliknya, notifikasi perannya, dan notifikasi umum staf (NULL)
        query = query.or(`user_id.eq.${user.id},target_role.eq.${profile.role},target_role.is.null`)
      } else {
        // Customer hanya melihat notifikasi miliknya atau yang memang ditargetkan ke customer
        query = query.or(`user_id.eq.${user.id},target_role.eq.customer`)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      set({ 
        notifications: data || [],
        unreadCount: data?.filter((n) => !n.is_read).length || 0,
        loading: false
      })
    } catch (error) {
      console.error('Error fetching notifications:', error)
      set({ loading: false })
    }
  },

  markAsRead: async (id: string) => {
    // Update local state first for instant UI response
    const { notifications } = get()
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    )
    set({ 
      notifications: updatedNotifications,
      unreadCount: Math.max(0, updatedNotifications.filter(n => !n.is_read).length)
    })

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error('Error marking as read:', error)
      // Rollback if failed
      get().fetchNotifications()
    }
  },

  markAllAsRead: async () => {
    const { notifications } = get()
    set({ 
      notifications: notifications.map(n => ({ ...n, is_read: true })),
      unreadCount: 0 
    })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .eq('is_read', false)

      if (error) throw error
    } catch (error) {
      console.error('Error marking all as read:', error)
      get().fetchNotifications()
    }
  },

  subscribeToNotifications: () => {
    // Jika sudah ada channel aktif, jangan buat lagi
    const existingChannels = supabase.getChannels()
    if (existingChannels.some(c => c.topic === 'realtime:notifications-global')) {
      return () => {} // Return empty cleanup
    }

    get().fetchNotifications()

    const channel = supabase
      .channel('notifications-global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return

          // Ambil role user dari profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as any
            const isStaff = profile?.role === 'admin' || profile?.role === 'cashier'
            
            let isTargeted = false
            if (isStaff) {
              isTargeted = newNotif.user_id === user.id || 
                          newNotif.target_role === profile?.role || 
                          newNotif.target_role === null
            } else {
              isTargeted = newNotif.user_id === user.id || 
                          newNotif.target_role === 'customer'
            }

            if (isTargeted) {
              set((state) => {
                const exists = state.notifications.some(n => n.id === newNotif.id)
                if (exists) return state
                
                const updated = [newNotif, ...state.notifications].slice(0, 20)
                return {
                  notifications: updated,
                  unreadCount: updated.filter((n: any) => !n.is_read).length
                }
              })
              
              const toastMethod = (newNotif.type || 'info') as 'success' | 'info' | 'warning' | 'error'
              toast[toastMethod](newNotif.title, {
                description: newNotif.message,
              })
            }
          } else if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            // Re-fetch untuk memastikan data paling akurat saat ada update/delete
            get().fetchNotifications()
          }
        }
      )
      .subscribe()

    return () => {
      // Kita tidak menghapus channel di sini agar komponen lain tetap bisa mendengar
      // Channel akan otomatis tertutup saat browser ditutup atau refresh total
    }
  }
}))
