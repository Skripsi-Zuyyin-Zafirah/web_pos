'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { IconCash, IconCheck, IconLoader2, IconAlertTriangle } from '@tabler/icons-react'
import { toast } from 'sonner'

export function PaymentConfirmationDialog({
  isOpen,
  onClose,
  orderId,
  customerName,
  totalPrice,
  staffId,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  orderId: string | null
  customerName: string
  totalPrice: number
  staffId: string | null
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [cashAmount, setCashAmount] = useState<string>('')
  const supabase = createClient()

  const change = (parseFloat(cashAmount) || 0) - totalPrice

  const handleFinalize = async () => {
    if (!orderId || !staffId) return
    if ((parseFloat(cashAmount) || 0) < totalPrice) {
      toast.error('Insufficient cash amount')
      return
    }

    setLoading(true)
    
    // Call the RPC for atomic transaction
    const { error } = await supabase.rpc('finalize_order_transaction', {
      p_order_id: orderId,
      p_staff_id: staffId
    })

    if (error) {
      console.error('Finalize error:', error)
      toast.error('Failed to finalize payment: ' + error.message)
    } else {
      toast.success('Payment confirmed!', {
        description: `Order #${orderId.slice(0, 8).toUpperCase()} for ${customerName} is completed.`,
        icon: '💰'
      })
      onSuccess()
      onClose()
    }
    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl border-none shadow-2xl">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
              <IconCash size={28} strokeWidth={2.5} />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tighter uppercase">Confirm Payment</DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-70">
                Cash Transaction Only
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Summary Card */}
          <div className="bg-muted/30 p-6 rounded-3xl space-y-4 border-2 border-dashed border-muted">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Bill</span>
              <span className="text-2xl font-black tracking-tighter text-foreground">Rp {totalPrice.toLocaleString()}</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</p>
              <p className="font-bold uppercase">{customerName}</p>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Cash Received</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground">Rp</span>
              <Input 
                type="number"
                placeholder="0"
                className="h-14 pl-12 rounded-2xl border-2 font-black text-lg focus:ring-primary/20"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Change Display */}
          {parseFloat(cashAmount) >= totalPrice && (
            <div className="bg-emerald-500/10 p-4 rounded-2xl flex justify-between items-center animate-in fade-in slide-in-from-top-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Change</span>
              <span className="font-black text-xl text-emerald-700">Rp {change.toLocaleString()}</span>
            </div>
          )}
          
          {parseFloat(cashAmount) > 0 && parseFloat(cashAmount) < totalPrice && (
            <div className="bg-red-500/10 p-4 rounded-2xl flex items-center gap-2 text-red-600 animate-pulse">
              <IconAlertTriangle size={18} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest">Insufficient Funds</span>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 gap-2">
          <Button variant="ghost" onClick={onClose} disabled={loading} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">
            Cancel
          </Button>
          <Button 
            className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 border-none"
            onClick={handleFinalize}
            disabled={loading || !cashAmount || parseFloat(cashAmount) < totalPrice}
          >
            {loading ? (
              <IconLoader2 className="animate-spin mr-2" size={18} />
            ) : (
              <IconCheck size={18} className="mr-2" strokeWidth={3} />
            )}
            Confirm & Finalize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
