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
  IconLoader2 
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
      toast.error('Failed to fetch data')
    } else {
      setProducts(prodRes.data || [])
      setCategories(catRes.data || [])
    }
    setLoading(false)
  }

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      toast.error('Cart is empty')
      return
    }

    setCheckoutLoading(true)
    
    // 1. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: null, // Optional link to auth user
          cashier_id: user?.id,
          customer_name: customerName || 'Guest',
          total_price: cart.totalPrice(),
          total_items: cart.totalItems(),
          ewp: cart.ewp(),
          status: 'waiting'
        }
      ])
      .select()
      .single()

    if (orderError) {
      toast.error('Failed to create order: ' + orderError.message)
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
      toast.error('Failed to save order items')
      // Note: In production, you'd want a transaction or cleanup here
    } else {
      toast.success('Order placed successfully!')
      cart.clearCart()
      setCustomerName('')
    }
    
    setCheckoutLoading(false)
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Product Catalog */}
      <div className="flex-1 p-6 space-y-6 overflow-hidden flex flex-col">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-10 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Tabs defaultValue="all" className="w-fit">
            <TabsList className="h-11">
              <TabsTrigger value="all" className="px-6">All</TabsTrigger>
              {categories.slice(0, 3).map(cat => (
                <TabsTrigger key={cat.id} value={cat.id} className="px-6">{cat.name}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse bg-muted h-64" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-6">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="group hover:shadow-md transition-all cursor-pointer overflow-hidden border-primary/5"
                  onClick={() => cart.addItem(product)}
                >
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-3 space-y-1">
                    <CardTitle className="text-sm line-clamp-1">{product.name}</CardTitle>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold">Rp {product.price.toLocaleString()}</span>
                      <Badge variant="outline" className="text-[10px]">Stok: {product.stock}</Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Cart Sidebar */}
      <div className="w-[400px] bg-card border-l flex flex-col shadow-xl">
        <div className="p-6 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-bold text-lg">Current Cart</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => cart.clearCart()}>Clear</Button>
        </div>

        <div className="p-4 border-b">
          <Label htmlFor="customer">Customer Name</Label>
          <Input 
            id="customer" 
            placeholder="Guest" 
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1"
          />
        </div>

        <ScrollArea className="flex-1 p-4">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2 opacity-50 py-20">
              <IconShoppingCart size={48} />
              <p>Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden flex-shrink-0 border">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[10px]">N/A</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Rp {item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-7 w-7"
                        onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                      >
                        <IconMinus size={14} />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-7 w-7"
                        onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                      >
                        <IconPlus size={14} />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">Rp {(item.price * item.quantity).toLocaleString()}</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 mt-1"
                      onClick={() => cart.removeItem(item.id)}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-6 bg-muted/30 border-t space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Items</span>
              <span className="font-medium">{cart.totalItems()} Items</span>
            </div>
            <div className="flex justify-between items-center bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-600">
                <IconClock size={18} />
                <span className="text-sm font-semibold">Estimated Work (EWP)</span>
              </div>
              <span className="font-bold text-blue-700">{cart.ewp() / 60} Min</span>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-primary">Rp {cart.totalPrice().toLocaleString()}</span>
            </div>
          </div>
          <Button 
            className="w-full h-14 text-lg font-bold shadow-lg" 
            disabled={cart.items.length === 0 || checkoutLoading}
            onClick={handleCheckout}
          >
            {checkoutLoading ? (
              <IconLoader2 className="animate-spin mr-2" />
            ) : (
              <>Checkout <IconCheck className="ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
