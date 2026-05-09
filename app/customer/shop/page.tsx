'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { IconSearch, IconFlame, IconChefHat, IconGlassFull, IconSoup, IconFilter } from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  unit: string
  image_url: string | null
  category_id: string | null
}

type Category = {
  id: string
  name: string
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const supabase = createClient()

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts(prev => [...prev, payload.new as Product].sort((a, b) => a.name.localeCompare(b.name)))
          } else if (payload.eventType === 'UPDATE') {
            setProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p))
          } else if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  } as const

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  } as const

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Section with Premium Gradient and Glassmorphism */}
      <div className="relative bg-gradient-to-br from-[#2FA4AF] via-[#258a94] to-[#1a656c] text-white py-16 px-6 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              Katalog Digital
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-black tracking-tight sm:text-5xl mb-4"
          >
            Pilih Produk Terbaik Anda
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/80 text-lg max-w-2xl leading-relaxed"
          >
            Jelajahi koleksi produk grosir kami yang segar dan berkualitas tinggi. Kesegaran terjamin setiap hari untuk kebutuhan usaha Anda.
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto -mt-10 px-6 pb-20 space-y-8 relative z-20">
        {/* Controls Card - Glassmorphism styled */}
        <Card className="shadow-xl border-slate-100/50 bg-white/90 backdrop-blur-md">
          <CardContent className="p-6 space-y-6">
            {/* Search Input */}
            <div className="relative">
              <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Cari produk favorit Anda..." 
                className="pl-12 h-14 text-base bg-slate-50 border-slate-100 focus:border-[#2FA4AF] focus:ring-[#2FA4AF]/10 rounded-xl shadow-inner transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            {/* Categories Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 whitespace-nowrap">
                <IconFilter size={18} className="text-[#2FA4AF]" />
                Kategori:
              </div>
              <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedCategory}>
                <ScrollArea className="w-full whitespace-nowrap">
                  <TabsList className="h-11 inline-flex w-full md:w-auto p-1 bg-slate-100 rounded-lg">
                    <TabsTrigger value="all" className="px-6 font-medium text-sm data-[state=active]:bg-white data-[state=active]:text-[#2FA4AF] data-[state=active]:shadow-sm rounded-md transition-all">
                      Semua Produk
                    </TabsTrigger>
                    {categories.map(cat => (
                      <TabsTrigger key={cat.id} value={cat.id} className="px-6 font-medium text-sm data-[state=active]:bg-white data-[state=active]:text-[#2FA4AF] data-[state=active]:shadow-sm rounded-md transition-all">
                        {cat.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </ScrollArea>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-white border-slate-100 h-[380px] rounded-2xl" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 space-y-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
          >
            <IconSoup className="mx-auto h-16 w-16 text-slate-300" stroke={1.5} />
            <p className="text-xl text-slate-600 font-bold">Produk tidak ditemukan</p>
            <p className="text-sm text-slate-400">Coba gunakan kata kunci lain atau pilih kategori yang berbeda.</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <Card 
                  className="group overflow-hidden rounded-2xl border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white flex flex-col h-[400px]"
                >
                  {/* Image Container */}
                  <div className="aspect-[4/3] relative overflow-hidden bg-slate-50">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300 bg-slate-100">
                        <IconGlassFull size={48} stroke={1.5} />
                      </div>
                    )}
                    
                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-slate-700 text-xs font-bold rounded-full shadow-sm">
                        {categories.find(c => c.id === product.category_id)?.name || 'Umum'}
                      </span>
                      
                      {product.stock > 0 && product.stock <= 5 && (
                        <Badge variant="destructive" className="flex items-center gap-1 shadow-lg border-none bg-rose-500 text-white">
                          <IconFlame size={12} /> Menipis
                        </Badge>
                      )}
                      
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                          <span className="text-rose-600 text-sm font-black uppercase tracking-wider border-2 border-rose-600 px-4 py-1.5 rounded-lg">
                            Habis
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#2FA4AF] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                        {product.description || 'Tidak ada deskripsi tersedia untuk produk ini.'}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      {/* Price & Unit */}
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-[#2FA4AF]">
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          / {product.unit || 'pcs'}
                        </span>
                      </div>

                      {/* Stock Info */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-500">Stok Tersedia:</span>
                        <span className={cn(
                          "font-bold px-2 py-0.5 rounded-full",
                          product.stock === 0 
                            ? "text-rose-600 bg-rose-50" 
                            : product.stock <= 5 
                              ? "text-amber-600 bg-amber-50" 
                              : "text-emerald-600 bg-emerald-50"
                        )}>
                          {product.stock} {product.unit || 'pcs'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
