'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { IconLoader2, IconReceipt, IconPackage, IconUser, IconCalendar } from '@tabler/icons-react'

type OrderItem = {
  id: string
  quantity: number
  price: number
  products: {
    name: string
    unit: string
  }
}

type OrderDetails = {
  id: string
  created_at: string
  total_price: number
  status: string
  customer_name: string
  payment_status: string
}

interface OrderDetailsDialogProps {
  orderId: string | null
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailsDialog({ orderId, isOpen, onClose }: OrderDetailsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState<OrderDetails | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (orderId && isOpen) {
      fetchOrderDetails()
    }
  }, [orderId, isOpen])

  const fetchOrderDetails = async () => {
    setLoading(true)
    try {
      const [orderRes, itemsRes] = await Promise.all([
        supabase.from('orders').select('*').eq('id', orderId).single(),
        supabase.from('order_items').select('*, products(name, unit)').eq('order_id', orderId)
      ])

      if (orderRes.data) setDetails(orderRes.data)
      if (itemsRes.data) setItems(itemsRes.data as any[])
    } catch (error) {
      console.error('Error fetching order details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'done':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 font-bold">Selesai</Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="font-bold">Dibatalkan</Badge>
      case 'processing':
        return <Badge className="bg-blue-500 hover:bg-blue-600 font-bold">Diproses</Badge>
      default:
        return <Badge variant="secondary" className="font-bold">Menunggu</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="bg-muted/30 p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                <IconReceipt className="text-primary" /> Detail Pesanan
              </DialogTitle>
              <DialogDescription className="font-mono text-[10px] uppercase tracking-widest font-bold opacity-70">
                ID: {orderId}
              </DialogDescription>
            </div>
            {details && getStatusBadge(details.status)}
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <IconLoader2 className="animate-spin text-primary opacity-20" size={48} />
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Memuat rincian...</p>
            </div>
          ) : details ? (
            <>
              {/* Order Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-muted/30 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <IconUser size={12} /> Pelanggan
                  </p>
                  <p className="font-bold text-sm truncate">{details.customer_name || 'Anonim'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <IconCalendar size={12} /> Tanggal
                  </p>
                  <p className="font-bold text-sm">
                    {new Date(details.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1 ml-1">
                  <IconPackage size={12} /> Rincian Item
                </p>
                <div className="rounded-2xl border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-bold text-xs uppercase">Produk</TableHead>
                        <TableHead className="text-center font-bold text-xs uppercase">Qty</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase">Harga</TableHead>
                        <TableHead className="text-right font-bold text-xs uppercase">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-bold">{item.products.name}</TableCell>
                          <TableCell className="text-center font-medium">
                            {item.quantity} <span className="text-[10px] text-muted-foreground">{item.products.unit}</span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            Rp {Number(item.price).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-black text-primary">
                            Rp {(item.quantity * item.price).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Total Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-dashed">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Bayar</p>
                <p className="text-3xl font-black tracking-tighter text-primary">
                  Rp {Number(details.total_price).toLocaleString()}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-10 opacity-50">
              <p>Data pesanan tidak ditemukan.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
