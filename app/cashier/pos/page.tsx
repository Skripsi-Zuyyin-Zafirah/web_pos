'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  IconSearch, 
  IconPlus, 
  IconMinus, 
  IconTrash, 
  IconShoppingCart, 
  IconClock, 
  IconCheck, 
  IconLoader2,
  IconPackage,
  IconUser
} from '@tabler/icons-react'
import { useAuth } from '@/components/providers/auth-provider'

type Product = {
  id: string
  name: string
  price: number
  stock: number
  image_url: string | null
  category_id: string | null
}

type Category = {
  id: string
  name: string
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  
  const { user } = useAuth()
  const supabase = createClient()
  const cart = useCart()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('categories').select('*').order('name')
    ])

    if (prodRes.error || catRes.error) {
      toast.error('Gagal mengambil data')
    } else {
      setProducts(prodRes.data || [])
      setCategories(catRes.data || [])
    }
    setLoading(false)
  }

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      toast.error('Keranjang kosong')
      return
    }

    setCheckoutLoading(true)
    
    // 1. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: null,
          cashier_id: user?.id,
          customer_name: customerName || 'Tamu',
          total_price: cart.totalPrice(),
          total_items: cart.totalItems(),
          ewp: cart.ewp(),
          status: 'waiting'
        }
      ])
      .select()
      .single()

    if (orderError) {
      toast.error('Gagal membuat pesanan: ' + orderError.message)
      setCheckoutLoading(false)
      return
    }

    // 2. Create Order Items
    const orderItems = cart.items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      toast.error('Gagal menyimpan item pesanan')
    } else {
      toast.success('Pesanan berhasil dibuat!')
      cart.clearCart()
      setCustomerName('')
    }
    
    setCheckoutLoading(false)
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'all' || p.category_id === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex h-full overflow-hidden bg-muted/20">
      {/* Product Catalog */}
      <div className="flex-1 flex flex-col min-w-0 border-r">
        <div className="p-6 bg-background border-b space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight uppercase">Terminal Kasir</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pilih produk untuk ditambahkan ke keranjang</p>
            </div>
            <div className="relative w-full md:w-80">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari item..." 
                className="pl-10 h-11 rounded-xl bg-muted/30 border-none shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="h-11 bg-muted/30 p-1 rounded-xl">
              <TabsTrigger value="all" className="px-6 rounded-lg font-bold">Semua Produk</TabsTrigger>
              {categories.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id} className="px-6 rounded-lg font-bold">{cat.name}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1 p-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(15)].map((_, i) => (
                <Card key={i} className="animate-pulse bg-muted/50 h-64 border-none rounded-3xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 text-muted-foreground opacity-50">
              <IconPackage size={64} />
              <p className="mt-4 font-bold">Tidak ada produk ditemukan di kategori ini</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-10">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="group relative flex flex-col border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden rounded-3xl bg-background"
                  onClick={() => cart.addItem(product)}
                >
                  <div className="aspect-square relative overflow-hidden bg-muted/30">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-30">
                        Tanpa Gambar
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-background/80 backdrop-blur-md text-primary border-none shadow-sm font-black px-2 py-1 rounded-lg">
                        {product.stock}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-4 flex-1">
                    <CardTitle className="text-base font-black leading-tight mb-1">{product.name}</CardTitle>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-primary font-black text-lg">Rp {product.price.toLocaleString()}</span>
                    </div>
                  </CardHeader>
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Cart Sidebar */}
      <div className="w-[420px] bg-background flex flex-col shadow-2xl relative z-10">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
              <IconShoppingCart className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <h2 className="font-black text-lg uppercase tracking-tight">Keranjang Aktif</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{cart.totalItems()} Item terpilih</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive rounded-lg" onClick={() => cart.clearCart()}>Hapus</Button>
        </div>

        <div className="p-6 bg-muted/10 border-b space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Atribusi Pelanggan</Label>
            <div className="relative">
              <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="customer" 
                placeholder="Pelanggan Tamu" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-background border-none shadow-inner"
              />
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-30 px-10 text-center">
              <IconShoppingCart size={80} strokeWidth={1} />
              <p className="mt-4 font-black uppercase tracking-widest text-sm">Keranjang kosong</p>
              <p className="mt-2 text-xs font-medium">Pilih produk dari katalog untuk memulai checkout.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="group relative bg-muted/20 hover:bg-muted/40 p-3 rounded-2xl transition-all border border-transparent hover:border-muted-foreground/10">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-xl bg-background overflow-hidden flex-shrink-0 shadow-sm border">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[10px] font-black opacity-20 uppercase">Kosong</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <p className="text-sm font-black line-clamp-1">{item.name}</p>
                        <p className="text-xs font-bold text-primary">Rp {item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="h-7 w-7 rounded-lg shadow-sm"
                          onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                        >
                          <IconMinus size={14} />
                        </Button>
                        <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="h-7 w-7 rounded-lg shadow-sm"
                          onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                        >
                          <IconPlus size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-between items-end">
                      <p className="text-sm font-black">Rp {(item.price * item.quantity).toLocaleString()}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => cart.removeItem(item.id)}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-6 bg-background border-t space-y-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
              <span>Total Volume</span>
              <span>{cart.totalItems()} Unit</span>
            </div>
            
            <div className="flex justify-between items-center bg-blue-500/5 p-4 rounded-2xl border-2 border-blue-500/10">
              <div className="flex items-center gap-2 text-blue-600">
                <IconClock size={18} strokeWidth={2.5} />
                <span className="text-xs font-black uppercase tracking-tighter">Beban Produksi (EWP)</span>
              </div>
              <span className="font-black text-blue-700 text-sm">{Math.round(cart.ewp() / 60)} Menit</span>
            </div>
            
            <Separator className="my-2 opacity-50" />
            
            <div className="flex justify-between items-end px-1">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground pb-1">Total Keseluruhan</span>
              <span className="text-3xl font-black text-primary leading-none tracking-tighter">Rp {cart.totalPrice().toLocaleString()}</span>
            </div>
          </div>
          
          <Button 
            className="w-full h-16 text-lg font-black uppercase tracking-tighter rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
            disabled={cart.items.length === 0 || checkoutLoading}
            onClick={handleCheckout}
          >
            {checkoutLoading ? (
              <IconLoader2 className="animate-spin h-6 w-6" />
            ) : (
              <div className="flex items-center gap-3">
                Proses Transaksi
                <IconCheck className="h-6 w-6" strokeWidth={3} />
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
