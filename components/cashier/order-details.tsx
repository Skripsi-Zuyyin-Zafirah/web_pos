'use client'

import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { IconPrinter, IconLoader2, IconShoppingCart, IconUser, IconCalendar, IconId } from '@tabler/icons-react'
import { toast } from 'sonner'

export function OrderDetailsDialog({ 
  orderId, 
  isOpen, 
  onClose 
}: { 
  orderId: string | null, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails()
    }
  }, [isOpen, orderId])

  const fetchOrderDetails = async () => {
    setLoading(true)
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*, staff!orders_assigned_staff_id_fkey(name)')
        .eq('id', orderId)
        .single()

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*, products(name)')
        .eq('order_id', orderId)

      if (orderError || itemsError) {
        console.error('Fetch details error:', { orderError, itemsError })
        toast.error('Gagal mengambil detail pesanan')
      } else {
        setOrder(orderData)
        setItems(itemsData)
      }
    } catch (e: any) {
      console.error('Exception in fetchOrderDetails:', e)
      toast.error('Terjadi kesalahan: ' + (e.message || 'Operasi gagal'))
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-3xl border-none shadow-2xl">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Badge variant="outline" className="font-mono text-[10px] font-black uppercase tracking-widest bg-muted/50 border-none">
                #{orderId?.slice(0, 8).toUpperCase()}
              </Badge>
              <DialogTitle className="text-2xl font-black tracking-tighter uppercase">Detail Pesanan</DialogTitle>
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" onClick={handlePrint} disabled={loading || !order}>
              <IconPrinter size={20} strokeWidth={2.5} />
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
            <IconLoader2 className="animate-spin h-10 w-10 text-primary" />
            <p className="font-black uppercase tracking-widest text-[10px]">Mengambil Detail...</p>
          </div>
        ) : order ? (
          <div className="space-y-6 pt-4">
            {/* Order Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 p-4 rounded-2xl space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Pelanggan</p>
                <div className="flex items-center gap-2">
                  <IconUser size={16} className="text-primary" />
                  <span className="font-bold text-sm">{order.customer_name}</span>
                </div>
              </div>
              <div className="bg-muted/30 p-4 rounded-2xl space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Ditugaskan Ke</p>
                <div className="flex items-center gap-2">
                  <IconId size={16} className="text-primary" />
                  <span className="font-bold text-sm">{order.staff?.name || 'Menunggu Distribusi'}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <IconShoppingCart size={16} className="text-primary" strokeWidth={3} />
                <h3 className="font-black uppercase tracking-widest text-[10px]">Daftar Produk</h3>
              </div>
              <div className="border rounded-2xl overflow-hidden bg-background">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="px-4 py-3 font-black uppercase tracking-widest text-[9px]">Produk</th>
                      <th className="px-4 py-3 font-black uppercase tracking-widest text-[9px] text-center">Jml</th>
                      <th className="px-4 py-3 font-black uppercase tracking-widest text-[9px] text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <p className="font-bold uppercase tracking-tight">{item.products?.name}</p>
                        </td>
                        <td className="px-4 py-3 text-center font-black">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-black">
                          Rp {(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-primary/5">
                      <td colSpan={2} className="px-4 py-4 font-black uppercase tracking-widest text-[10px]">Estimasi Total</td>
                      <td className="px-4 py-4 text-right font-black text-lg tracking-tighter text-primary">
                        Rp {order.total_price?.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Print Section (Hidden on screen) */}
            <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:p-8 print:text-black print:z-[9999]" id="printable-receipt">
              <div className="text-center space-y-4 border-b pb-6 mb-6">
                <h1 className="text-2xl font-black uppercase">STRUK KERJA GUDANG</h1>
                <p className="text-sm font-bold">Order ID: {orderId?.toUpperCase()}</p>
              </div>
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-1">
                  <p className="text-xs uppercase font-bold text-gray-500">Customer</p>
                  <p className="text-lg font-black">{order.customer_name}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-xs uppercase font-bold text-gray-500">Pegawai Bertugas</p>
                  <p className="text-lg font-black">{order.staff?.name || '________________'}</p>
                </div>
              </div>
              <div className="border-y-2 border-black py-4 mb-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="py-2 font-black uppercase text-xs">Produk / SKU</th>
                      <th className="py-2 font-black uppercase text-xs text-center">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3">
                          <p className="font-bold text-lg">{item.products?.name}</p>
                        </td>
                        <td className="py-3 text-center font-black text-2xl">
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 text-[10px] text-center font-bold uppercase tracking-widest opacity-50">
                Printed at {new Date().toLocaleString()} - Wholesale POS v1.0
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="pt-4 border-t">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">
            Tutup
          </Button>
          <Button className="rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20" onClick={handlePrint}>
            <IconPrinter size={16} className="mr-2" /> Cetak Struk Kerja
          </Button>
        </DialogFooter>
      </DialogContent>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Dialog>
  )
}
