import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MinHeap, HeapItem } from '@/lib/utils/min-heap'
import { toast } from 'sonner'

export function useAutoDispatch(enabled: boolean = true) {
  const supabase = createClient()
  const [isProcessing, setIsProcessing] = useState(false)

  const dispatchOrder = useCallback(async () => {
    if (!enabled || isProcessing) return
    setIsProcessing(true)

    try {
      // 1. Get available staff
      const { data: idleStaff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('status', 'idle')
        .limit(1)

      if (staffError || !idleStaff || idleStaff.length === 0) {
        setIsProcessing(false)
        return
      }

      const staff = idleStaff[0]

      // 2. Get the top order from Min-Heap
      const { data: waitingOrders, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'waiting')

      if (orderError || !waitingOrders || waitingOrders.length === 0) {
        setIsProcessing(false)
        return
      }

      // Reconstruct heap to get the absolute top (root)
      const heap = new MinHeap()
      waitingOrders.forEach((o) => heap.push(o))
      const topOrder = heap.peek()

      if (!topOrder) {
        setIsProcessing(false)
        return
      }

      // 3. ATOMIC UPDATE: Assign order to staff
      // We use a conditional update to ensure the order is still 'waiting'
      const { data: updatedOrder, error: updateOrderError } = await supabase
        .from('orders')
        .update({ 
          status: 'processing', 
          assigned_staff_id: staff.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', topOrder.id)
        .eq('status', 'waiting') // Optimistic lock
        .select()

      if (updateOrderError || !updatedOrder || updatedOrder.length === 0) {
        // Someone else probably picked it up or status changed
        setIsProcessing(false)
        return
      }

      // 4. Update staff status
      await supabase
        .from('staff')
        .update({ 
          status: 'busy', 
          current_order_id: topOrder.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', staff.id)

      toast.success(`Auto-Dispatch: ${topOrder.customer_name} assigned to ${staff.name}`, {
        description: `Order #${topOrder.id.slice(0, 8).toUpperCase()} is now being processed.`,
        icon: '🤖'
      })

    } catch (err) {
      console.error('Auto-dispatch error:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [enabled, isProcessing, supabase])

  // Listen for changes to trigger dispatch
  useEffect(() => {
    if (!enabled) return

    const channel = supabase
      .channel('auto-dispatch-trigger')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => dispatchOrder()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff' },
        () => dispatchOrder()
      )
      .subscribe()

    // Initial check
    dispatchOrder()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled, dispatchOrder, supabase])

  return { isProcessing }
}
