import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export type StaffMember = {
  id: string
  name: string
  status: 'idle' | 'busy'
  current_order_id: string | null
  updated_at: string
}

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStaff()

    const channel = supabase
      .channel('staff-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setStaff((prev) => 
              prev.map((s) => (s.id === payload.new.id ? { ...s, ...payload.new } : s))
            )
          } else if (payload.eventType === 'INSERT') {
            setStaff((prev) => [...prev, payload.new as StaffMember])
          } else if (payload.eventType === 'DELETE') {
            setStaff((prev) => prev.filter((s) => s.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('name', { ascending: true })

    if (!error && data) {
      setStaff(data as StaffMember[])
    }
    setLoading(false)
  }

  return { staff, loading, refresh: fetchStaff }
}
