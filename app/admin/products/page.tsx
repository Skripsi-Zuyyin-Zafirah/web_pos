'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { IconPlus, IconTrash, IconEdit, IconLoader2, IconSearch, IconFilter, IconPackage, IconTag, IconCurrencyDollar } from '@tabler/icons-react'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  unit: string
  image_url: string | null
  category_id: string | null
  created_at: string
  categories: { name: string } | null
}

type Category = {
  id: string
  name: string
}

type ProductUnit = {
  id?: string
  name: string
  multiplier: number
  price: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    unit: 'pcs',
    category_id: '',
    image: null as File | null,
  })
  const [productUnits, setProductUnits] = useState<ProductUnit[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Gagal mengambil produk')
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name')
    setCategories(data || [])
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let image_url = editingProduct?.image_url || null

    if (formData.image) {
      const fileExt = formData.image.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, formData.image)

      if (uploadError) {
        toast.error('Unggah gambar gagal')
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName)
      
      image_url = publicUrl
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      stock: formData.stock,
      unit: formData.unit,
      category_id: formData.category_id || null,
      image_url,
    }

    let error
    if (editingProduct) {
      const { error: updateError } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingProduct.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert([payload])
      error = insertError
    }

    if (error) {
      toast.error(error.message)
    } else {
      // Save product units
      const productId = editingProduct ? editingProduct.id : (await supabase.from('products').select('id').eq('name', payload.name).order('created_at', { ascending: false }).limit(1).single()).data?.id
      
      if (productId) {
        // Simple strategy: delete and re-insert units
        await supabase.from('product_units').delete().eq('product_id', productId)
        if (productUnits.length > 0) {
          const unitsToInsert = productUnits.map(u => ({
            product_id: productId,
            name: u.name,
            multiplier: u.multiplier,
            price: u.price
          }))
          await supabase.from('product_units').insert(unitsToInsert)
        }
      }

      toast.success(editingProduct ? 'Produk diperbarui' : 'Produk ditambahkan')
      setIsDialogOpen(false)
      resetForm()
      fetchProducts()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return

    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Produk dihapus')
      fetchProducts()
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      unit: 'pcs',
      category_id: '',
      image: null,
    })
    setProductUnits([])
    setEditingProduct(null)
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase">Inventaris Produk</h1>
          <p className="text-muted-foreground font-medium">Kelola katalog grosir dan tingkat stok Anda.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)} className="h-12 px-6 font-bold rounded-xl shadow-lg">
              <IconPlus className="mr-2 h-5 w-5" /> Tambah Produk Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
            <form onSubmit={handleSave} className="flex flex-col max-h-[90vh]">
              <DialogHeader className="p-6 pb-4 border-b">
                <DialogTitle className="text-2xl font-black">{editingProduct ? 'Perbarui Produk' : 'Buat Produk'}</DialogTitle>
                <DialogDescription className="font-medium">
                  Masukkan detail produk grosir Anda di sini.
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="flex-1 max-h-[60vh]">
                <div className="p-6 space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="font-bold">Nama Produk</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Beras Premium 25kg"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="category" className="font-bold">Kategori</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price" className="font-bold">Harga (Rp)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={isNaN(formData.price) ? '' : formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        required
                        className="h-11 rounded-xl px-3"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="stock" className="font-bold">Stok</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={isNaN(formData.stock) ? '' : formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                        required
                        className="h-11 rounded-xl px-3"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unit" className="font-bold">Satuan</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) => setFormData({ ...formData, unit: value })}
                      >
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="pcs">pcs</SelectItem>
                          <SelectItem value="karton">karton</SelectItem>
                          <SelectItem value="slop">slop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description" className="font-bold">Deskripsi</Label>
                    <Textarea
                      id="description"
                      placeholder="Deskripsi singkat produk..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="rounded-xl min-h-[80px]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="image" className="font-bold">Gambar Produk</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                      className="cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:text-white file:font-bold h-auto py-2"
                    />
                  </div>

                  {/* Multi-Unit Section */}
                  <div className="space-y-4 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-black">Satuan Grosir</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setProductUnits([...productUnits, { name: '', multiplier: 1, price: 0 }])}
                        className="h-8 rounded-lg border-2 font-bold"
                      >
                        <IconPlus className="mr-1 h-4 w-4" /> Tambah
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {productUnits.map((unit, index) => (
                        <div key={index} className="grid grid-cols-[1fr_70px_1fr_40px] gap-2 items-end bg-muted/30 p-3 rounded-xl border">
                          <div className="grid gap-1">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Unit</Label>
                            <Input 
                              placeholder="Dus" 
                              value={unit.name} 
                              onChange={(e) => {
                                const newUnits = [...productUnits]
                                newUnits[index].name = e.target.value
                                setProductUnits(newUnits)
                              }}
                              className="h-9 rounded-lg"
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Isi</Label>
                            <Input 
                              type="number" 
                              value={isNaN(unit.multiplier) ? '' : unit.multiplier} 
                              onChange={(e) => {
                                const newUnits = [...productUnits]
                                newUnits[index].multiplier = parseInt(e.target.value) || 0
                                setProductUnits(newUnits)
                              }}
                              className="h-9 rounded-lg"
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Harga</Label>
                            <Input 
                              type="number" 
                              value={isNaN(unit.price) ? '' : unit.price} 
                              onChange={(e) => {
                                const newUnits = [...productUnits]
                                newUnits[index].price = parseFloat(e.target.value) || 0
                                setProductUnits(newUnits)
                              }}
                              className="h-9 rounded-lg"
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setProductUnits(productUnits.filter((_, i) => i !== index))}
                            className="h-9 w-9 text-rose-500 hover:bg-rose-500/10"
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="p-6 border-t">
                <Button type="submit" disabled={loading} className="w-full h-12 font-bold rounded-xl shadow-md">
                  {loading ? <IconLoader2 className="animate-spin" /> : editingProduct ? 'Perbarui Produk' : 'Simpan Produk'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-sm bg-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-600">Total Produk</CardTitle>
            <IconPackage className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{products.length} Barang</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-600">Kategori</CardTitle>
            <IconTag className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{categories.length} Jenis</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-amber-600">Nilai Stok</CardTitle>
            <IconCurrencyDollar className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">Rp {products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/30 pb-6 pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black tracking-tight">Inventaris Aktif</CardTitle>
              <CardDescription className="font-medium text-xs uppercase tracking-widest">Data produk waktu nyata</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-80">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter produk..."
                  className="pl-10 h-11 rounded-xl bg-background border-none shadow-inner"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="h-11 rounded-xl border-2 font-bold">
                <IconFilter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px] font-bold py-4">Gambar</TableHead>
                <TableHead className="font-bold py-4">Nama</TableHead>
                <TableHead className="font-bold py-4">Kategori</TableHead>
                <TableHead className="font-bold py-4">Harga</TableHead>
                <TableHead className="font-bold py-4">Stok</TableHead>
                <TableHead className="text-right font-bold py-4 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <IconLoader2 className="mx-auto h-10 w-10 animate-spin text-primary opacity-20" />
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 opacity-50 font-medium">
                      <IconPackage size={48} />
                      <p>Tidak ada produk ditemukan di inventaris Anda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="py-4">
                      {product.image_url ? (
                        <div className="h-12 w-12 rounded-xl overflow-hidden border-2 border-muted shadow-sm">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                          N/A
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-base py-4">{product.name}</TableCell>
                    <TableCell className="py-4">
                      <Badge variant="secondary" className="font-medium rounded-lg">
                        {product.categories?.name || 'Tanpa Kategori'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-black text-primary py-4">
                      Rp {product.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge 
                        variant={product.stock <= 5 ? "destructive" : "outline"} 
                        className={`font-bold ${product.stock > 5 ? 'border-2' : ''} rounded-lg`}
                      >
                        {product.stock} {product.unit || 'pcs'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-4 pr-6 space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-xl hover:bg-blue-500/10 text-blue-500"
                        onClick={async () => {
                          setEditingProduct(product)
                          setFormData({
                            name: product.name,
                            description: product.description || '',
                            price: product.price,
                            stock: product.stock,
                            unit: product.unit || 'pcs',
                            category_id: product.category_id || '',
                            image: null,
                          })
                          
                          // Fetch product units
                          const { data: units } = await supabase
                            .from('product_units')
                            .select('*')
                            .eq('product_id', product.id)
                          
                          setProductUnits(units || [])
                          setIsDialogOpen(true)
                        }}
                      >
                        <IconEdit className="h-5 w-5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <IconTrash className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
