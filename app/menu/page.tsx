'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { IconSearch, IconFlame, IconChefHat, IconGlassFull, IconSoup } from '@tabler/icons-react'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  image_url: string | null
  category_id: string | null
}

type Category = {
  id: string
  name: string
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('categories').select('*').order('name')
    ])

    if (!prodRes.error) setProducts(prodRes.data || [])
    if (!catRes.error) setCategories(catRes.data || [])
    setLoading(false)
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12 px-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
          <IconChefHat size={120} />
        </div>
        <div className="max-w-6xl mx-auto space-y-4 relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Digital Menu</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            Explore our fresh collection of wholesale products. Freshness guaranteed every single day.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto -mt-8 px-6 pb-20 space-y-8">
        {/* Controls */}
        <Card className="shadow-xl border-none">
          <CardContent className="p-6 space-y-6">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search for your favorites..." 
                className="pl-10 h-14 text-lg bg-muted/30 border-none shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedCategory}>
              <ScrollArea className="w-full whitespace-nowrap">
                <TabsList className="h-12 inline-flex w-full md:w-auto p-1 bg-muted/50">
                  <TabsTrigger value="all" className="px-8 font-medium">All Items</TabsTrigger>
                  {categories.map(cat => (
                    <TabsTrigger key={cat.id} value={cat.id} className="px-8 font-medium">
                      {cat.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>
            </Tabs>
          </CardContent>
        </Card>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-muted h-80 rounded-2xl" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <IconSoup className="mx-auto h-16 w-16 text-muted-foreground opacity-20" />
            <p className="text-xl text-muted-foreground font-medium">No products found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="group overflow-hidden rounded-2xl border-none shadow-md hover:shadow-2xl transition-all duration-300 bg-card"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground/40">
                      <IconGlassFull size={48} stroke={1.5} />
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="destructive" className="flex items-center gap-1 shadow-lg border-none">
                        <IconFlame size={12} /> Low Stock
                      </Badge>
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                      <Badge variant="outline" className="text-lg font-bold py-2 px-6 border-2">Sold Out</Badge>
                    </div>
                  )}
                </div>
                <CardHeader className="p-5 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                        {product.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-1">
                        {categories.find(c => c.id === product.category_id)?.name || 'General'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">
                    {product.description || 'No description available for this item.'}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-black text-primary">
                      Rp {product.price.toLocaleString()}
                    </span>
                    <Badge variant="secondary" className="font-medium">
                      Stock: {product.stock}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
