'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { DataTableToolbar } from '@/components/data-table/toolbar'
import { DataTablePagination } from '@/components/data-table/pagination'
import { DataTableBulkBar } from '@/components/data-table/bulk-bar'
import { DataTableSkeletonRows } from '@/components/data-table/skeleton-rows'
import { DataTableEmptyState } from '@/components/data-table/empty-state'
import { useDataTable } from '@/hooks/use-data-table'
import {
  IconPlus, IconTrash, IconEdit, IconLoader2,
  IconPackage, IconTag, IconCurrencyDollar, IconAlertTriangle,
  IconCamera, IconCameraOff,
} from '@tabler/icons-react'

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

type Category = { id: string; name: string }
type ProductUnit = { id?: string; name: string; multiplier: number; price: number }
type StockFilter = 'all' | 'low' | 'out'

const PRODUCT_COLUMNS = [
  { key: 'image', label: 'Gambar' },
  { key: 'category', label: 'Kategori' },
  { key: 'price', label: 'Harga' },
  { key: 'stock', label: 'Stok' },
]

const SKELETON_COLS = [
  { type: 'square' as const },
  { width: 'w-44' },
  { type: 'badge' as const, width: 'w-24' },
  { width: 'w-28' },
  { type: 'badge' as const, width: 'w-16' },
  { width: 'w-16', className: 'text-right' },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '', description: '', price: 0, stock: 0, unit: 'pcs', category_id: '', image: null as File | null,
  })
  const [productUnits, setProductUnits] = useState<ProductUnit[]>([])
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')
  const [columnVisibility, setColumnVisibility] = useState({ image: true, category: true, price: true, stock: true })
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Camera
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  const dt = useDataTable({ defaultSortField: 'created_at', defaultSortOrder: 'desc', defaultPageSize: 10 })
  const supabase = createClient()

  useEffect(() => { fetchProducts(); fetchCategories() }, [])
  useEffect(() => { dt.resetPage(); dt.clearSelection() }, [dt.search, selectedCategoryFilter, stockFilter])

  useEffect(() => {
    if (!isDialogOpen) { if (mediaStream) { mediaStream.getTracks().forEach((t) => t.stop()); setMediaStream(null) }; setIsCameraActive(false) }
  }, [isDialogOpen])

  useEffect(() => {
    if (!formData.image) { setImagePreviewUrl(null); return }
    const url = URL.createObjectURL(formData.image)
    setImagePreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [formData.image])

  useEffect(() => () => { if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop()) }, [mediaStream])

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false })
    if (error) toast.error('Gagal mengambil produk')
    else setProducts(data || [])
    setLoading(false)
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name')
    setCategories(data || [])
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setMediaStream(stream); setIsCameraActive(true)
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream }, 100)
    } catch { toast.error('Gagal mengakses kamera.') }
  }

  const stopCamera = () => {
    if (mediaStream) { mediaStream.getTracks().forEach((t) => t.stop()); setMediaStream(null) }
    setIsCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    const v = videoRef.current, c = document.createElement('canvas')
    c.width = v.videoWidth || 640; c.height = v.videoHeight || 480
    c.getContext('2d')?.drawImage(v, 0, 0, c.width, c.height)
    c.toBlob((blob) => {
      if (blob) { setFormData((p) => ({ ...p, image: new File([blob], `cap_${Date.now()}.jpg`, { type: 'image/jpeg' }) })); toast.success('Foto diambil!'); stopCamera() }
    }, 'image/jpeg')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    let image_url = editingProduct?.image_url || null
    if (formData.image) {
      const ext = formData.image.name.split('.').pop()
      const { error: upErr } = await supabase.storage.from('products').upload(`${Math.random()}.${ext}`, formData.image)
      if (upErr) { toast.error('Unggah gambar gagal'); setLoading(false); return }
      const fileName = `${Math.random()}.${ext}`
      image_url = supabase.storage.from('products').getPublicUrl(fileName).data.publicUrl
    }
    const payload = { name: formData.name, description: formData.description, price: formData.price, stock: formData.stock, unit: formData.unit, category_id: formData.category_id || null, image_url }
    let error
    if (editingProduct) { ({ error } = await supabase.from('products').update(payload).eq('id', editingProduct.id)) }
    else { ({ error } = await supabase.from('products').insert([payload])) }
    if (error) { toast.error(error.message) } else {
      const productId = editingProduct?.id ?? (await supabase.from('products').select('id').eq('name', payload.name).order('created_at', { ascending: false }).limit(1).single()).data?.id
      if (productId) {
        await supabase.from('product_units').delete().eq('product_id', productId)
        if (productUnits.length > 0) await supabase.from('product_units').insert(productUnits.map((u) => ({ product_id: productId, name: u.name, multiplier: u.multiplier, price: u.price })))
      }
      toast.success(editingProduct ? 'Produk diperbarui' : 'Produk ditambahkan')
      setIsDialogOpen(false); resetForm(); fetchProducts()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Produk dihapus'); fetchProducts() }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Hapus ${dt.selectedRows.size} produk?`)) return
    setIsBulkDeleting(true)
    const { error } = await supabase.from('products').delete().in('id', Array.from(dt.selectedRows))
    if (error) toast.error(error.message)
    else { toast.success(`${dt.selectedRows.size} produk dihapus`); dt.clearSelection(); fetchProducts() }
    setIsBulkDeleting(false)
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', price: 0, stock: 0, unit: 'pcs', category_id: '', image: null })
    setProductUnits([]); setEditingProduct(null); stopCamera()
  }

  const exportCSV = () => {
    const rows = [
      ['Nama', 'Kategori', 'Harga', 'Stok', 'Satuan', 'Dibuat'],
      ...processedProducts.map((p) => [p.name, p.categories?.name || 'Tanpa Kategori', p.price, p.stock, p.unit, new Date(p.created_at).toLocaleDateString('id-ID')]),
    ]
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    a.download = `produk_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    toast.success('Data diekspor')
  }

  const processedProducts = useMemo(() => {
    let r = products.filter((p) => !dt.search || p.name.toLowerCase().includes(dt.search.toLowerCase()))
    if (selectedCategoryFilter !== 'all') r = r.filter((p) => p.category_id === selectedCategoryFilter)
    if (stockFilter === 'out') r = r.filter((p) => p.stock === 0)
    else if (stockFilter === 'low') r = r.filter((p) => p.stock > 0 && p.stock <= 10)
    return dt.sortData(r, (item, field) => field === 'category' ? item.categories?.name : (item as any)[field])
  }, [products, dt.search, selectedCategoryFilter, stockFilter, dt.sortData])

  const paginatedProducts = useMemo(() => dt.paginateData(processedProducts), [processedProducts, dt.paginateData])
  const totalPages = dt.getTotalPages(processedProducts.length)
  const pageIds = paginatedProducts.map((p) => p.id)
  const hasActiveFilters = dt.search !== '' || selectedCategoryFilter !== 'all' || stockFilter !== 'all'

  const resetFilters = () => { dt.setSearch(''); setSelectedCategoryFilter('all'); setStockFilter('all') }

  const getStockBadge = (stock: number, unit: string) => {
    if (stock === 0) return <Badge className="font-bold rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 gap-1"><IconAlertTriangle size={11} /> Habis</Badge>
    if (stock <= 10) return <Badge className="font-bold rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">{stock} {unit}</Badge>
    return <Badge className="font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">{stock} {unit}</Badge>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Inventaris Produk</h1>
          <p className="text-muted-foreground dark:text-slate-400 font-medium">Kelola katalog grosir dan tingkat stok Anda.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 font-bold rounded-xl shadow-lg bg-[#2FA4AF] hover:bg-[#258a94] text-white border-none">
              <IconPlus className="mr-2 h-5 w-5" /> Tambah Produk Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-none dark:border dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
            <form onSubmit={handleSave} className="flex flex-col max-h-[90vh]">
              <DialogHeader className="p-6 pb-4 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">{editingProduct ? 'Perbarui Produk' : 'Buat Produk'}</DialogTitle>
                <DialogDescription className="font-medium text-slate-500 dark:text-slate-400">Masukkan detail produk grosir Anda di sini.</DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-1 max-h-[60vh] bg-white dark:bg-slate-900">
                <div className="p-6 space-y-6">
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Nama Produk</Label>
                    <Input placeholder="e.g. Beras Premium 25kg" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Kategori</Label>
                    <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                      <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                      <SelectContent className="rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                        {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label className="font-bold text-slate-700 dark:text-slate-300">Harga (Rp)</Label>
                      <Input type="number" value={isNaN(formData.price) ? '' : formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} required className="h-11 rounded-xl px-3 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-bold text-slate-700 dark:text-slate-300">Stok</Label>
                      <Input type="number" value={isNaN(formData.stock) ? '' : formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} required className="h-11 rounded-xl px-3 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-bold text-slate-700 dark:text-slate-300">Satuan</Label>
                      <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                          <SelectItem value="pcs">pcs</SelectItem>
                          <SelectItem value="karton">karton</SelectItem>
                          <SelectItem value="slop">slop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Deskripsi</Label>
                    <Textarea placeholder="Deskripsi singkat produk..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="rounded-xl min-h-[80px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" />
                  </div>
                  <div className="grid gap-3">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Gambar Produk</Label>
                    <div className="space-y-4">
                      {isCameraActive && (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-[#2FA4AF] bg-black aspect-video">
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                            <Button type="button" onClick={capturePhoto} className="bg-[#2FA4AF] hover:bg-[#258a94] text-white font-bold rounded-xl h-10 px-4 border-none"><IconCamera className="mr-2 h-4 w-4" /> Ambil Gambar</Button>
                            <Button type="button" onClick={stopCamera} variant="destructive" className="font-bold rounded-xl h-10 px-4 border-none"><IconCameraOff className="mr-2 h-4 w-4" /> Batal</Button>
                          </div>
                        </div>
                      )}
                      {!isCameraActive && (imagePreviewUrl || editingProduct?.image_url) && (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video">
                          <img src={imagePreviewUrl || editingProduct?.image_url || ''} alt="Preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { formData.image ? setFormData({ ...formData, image: null }) : editingProduct?.image_url && setEditingProduct({ ...editingProduct, image_url: null }) }} className="absolute top-2 right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-2 shadow-md transition-colors">
                            <IconTrash size={16} />
                          </button>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <Input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })} className="cursor-pointer file:rounded-lg file:border-0 file:bg-[#2FA4AF] file:text-white file:font-bold h-auto py-2 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white w-full" />
                        </div>
                        {!isCameraActive && (
                          <Button type="button" onClick={startCamera} variant="outline" className="h-11 px-4 rounded-xl border-2 font-bold dark:border-slate-700 whitespace-nowrap bg-white dark:bg-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950">
                            <IconCamera className="mr-2 h-5 w-5 text-[#2FA4AF]" /> Kamera
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 pt-6 border-t dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-black text-slate-900 dark:text-white">Satuan Grosir</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => setProductUnits([...productUnits, { name: '', multiplier: 1, price: 0 }])} className="h-8 rounded-lg border-2 font-bold dark:border-slate-700">
                        <IconPlus className="mr-1 h-4 w-4" /> Tambah
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {productUnits.map((unit, i) => (
                        <div key={i} className="grid grid-cols-[1fr_70px_1fr_40px] gap-2 items-end bg-muted/30 dark:bg-slate-950/40 p-3 rounded-xl border dark:border-slate-800">
                          <div className="grid gap-1"><Label className="text-[10px] font-bold uppercase text-muted-foreground">Unit</Label><Input placeholder="Dus" value={unit.name} onChange={(e) => { const u = [...productUnits]; u[i].name = e.target.value; setProductUnits(u) }} className="h-9 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" /></div>
                          <div className="grid gap-1"><Label className="text-[10px] font-bold uppercase text-muted-foreground">Isi</Label><Input type="number" value={isNaN(unit.multiplier) ? '' : unit.multiplier} onChange={(e) => { const u = [...productUnits]; u[i].multiplier = parseInt(e.target.value) || 0; setProductUnits(u) }} className="h-9 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" /></div>
                          <div className="grid gap-1"><Label className="text-[10px] font-bold uppercase text-muted-foreground">Harga</Label><Input type="number" value={isNaN(unit.price) ? '' : unit.price} onChange={(e) => { const u = [...productUnits]; u[i].price = parseFloat(e.target.value) || 0; setProductUnits(u) }} className="h-9 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" /></div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => setProductUnits(productUnits.filter((_, j) => j !== i))} className="h-9 w-9 text-rose-500 hover:bg-rose-500/10"><IconTrash className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="p-6 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                <Button type="submit" disabled={loading} className="w-full h-12 font-bold rounded-xl shadow-md bg-[#2FA4AF] hover:bg-[#258a94] text-white border-none">
                  {loading ? <IconLoader2 className="animate-spin" /> : editingProduct ? 'Perbarui Produk' : 'Simpan Produk'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-blue-100/50 dark:border-blue-950/30 shadow-sm bg-blue-500/5 dark:bg-blue-950/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Total Produk</CardTitle><IconPackage className="h-5 w-5 text-blue-500" /></CardHeader>
          <CardContent><div className="text-2xl font-black text-slate-900 dark:text-white">{products.length} Barang</div></CardContent>
        </Card>
        <Card className="border border-emerald-100/50 dark:border-emerald-950/30 shadow-sm bg-emerald-500/5 dark:bg-emerald-950/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Kategori</CardTitle><IconTag className="h-5 w-5 text-emerald-500" /></CardHeader>
          <CardContent><div className="text-2xl font-black text-slate-900 dark:text-white">{categories.length} Jenis</div></CardContent>
        </Card>
        <Card className="border border-amber-100/50 dark:border-amber-950/30 shadow-sm bg-amber-500/5 dark:bg-amber-950/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Stok Rendah</CardTitle><IconAlertTriangle className="h-5 w-5 text-amber-500" /></CardHeader>
          <CardContent><div className="text-2xl font-black text-slate-900 dark:text-white">{products.filter((p) => p.stock > 0 && p.stock <= 10).length} Produk</div></CardContent>
        </Card>
        <Card className="border border-rose-100/50 dark:border-rose-950/30 shadow-sm bg-rose-500/5 dark:bg-rose-950/10 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Nilai Stok</CardTitle><IconCurrencyDollar className="h-5 w-5 text-rose-500" /></CardHeader>
          <CardContent><div className="text-2xl font-black text-slate-900 dark:text-white">Rp {products.reduce((a, p) => a + p.price * p.stock, 0).toLocaleString('id-ID')}</div></CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="border-none shadow-xl dark:shadow-none rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border dark:border-slate-800">
        <CardHeader className="bg-muted/30 dark:bg-slate-950/20 pb-4 pt-5 border-b dark:border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-0.5">
              <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Inventaris Aktif</CardTitle>
              <CardDescription className="font-medium text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Data produk waktu nyata</CardDescription>
            </div>
            <DataTableToolbar
              search={{ value: dt.search, onChange: (v: string) => { dt.setSearch(v); dt.resetPage() }, placeholder: 'Cari nama produk...' }}
              filters={[
                { value: selectedCategoryFilter, onChange: (v: string) => { setSelectedCategoryFilter(v); dt.resetPage() }, placeholder: 'Semua Kategori', options: [{ value: 'all', label: 'Semua Kategori' }, ...categories.map((c) => ({ value: c.id, label: c.name }))] },
                { value: stockFilter, onChange: (v: string) => { setStockFilter(v as StockFilter); dt.resetPage() }, placeholder: 'Semua Stok', options: [{ value: 'all', label: 'Semua Stok' }, { value: 'low', label: 'Stok Rendah (≤10)' }, { value: 'out', label: 'Stok Habis' }], width: 'w-44' },
              ]}
              onRefresh={fetchProducts}
              onExport={exportCSV}
              columnVisibility={{ config: PRODUCT_COLUMNS, state: columnVisibility, onChange: (k: string, v: boolean) => setColumnVisibility((prev) => ({ ...prev, [k]: v })) }}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={resetFilters}
            />
          </div>
        </CardHeader>

        <DataTableBulkBar selectedCount={dt.selectedRows.size} onClear={dt.clearSelection}>
          <Button size="sm" onClick={handleBulkDelete} disabled={isBulkDeleting} className="h-8 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold border-none text-xs gap-1">
            {isBulkDeleting ? <IconLoader2 size={12} className="animate-spin" /> : <IconTrash size={12} />} Hapus {dt.selectedRows.size} Produk
          </Button>
        </DataTableBulkBar>

        <CardContent className="p-0 bg-white dark:bg-slate-900">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-950/50 border-b dark:border-slate-800">
              <TableRow className="hover:bg-transparent border-b dark:border-slate-800">
                <TableHead className="w-12 pl-5">
                  <Checkbox
                    checked={dt.isAllOnPageSelected(pageIds)}
                    ref={(el) => { if (el) (el as any).indeterminate = dt.isIndeterminate(pageIds) }}
                    onCheckedChange={() => dt.toggleAllOnPage(pageIds)}
                    aria-label="Pilih semua"
                    className="border-slate-300 dark:border-slate-600"
                  />
                </TableHead>
                {columnVisibility.image && <TableHead className="w-[72px] font-bold py-3.5 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Foto</TableHead>}
                <DataTableColumnHeader label="Nama" field="name" sortBy={dt.sortBy} sortOrder={dt.sortOrder} onSort={dt.handleSort} />
                {columnVisibility.category && <DataTableColumnHeader label="Kategori" field="category" sortBy={dt.sortBy} sortOrder={dt.sortOrder} onSort={dt.handleSort} />}
                {columnVisibility.price && <DataTableColumnHeader label="Harga" field="price" sortBy={dt.sortBy} sortOrder={dt.sortOrder} onSort={dt.handleSort} />}
                {columnVisibility.stock && <DataTableColumnHeader label="Stok" field="stock" sortBy={dt.sortBy} sortOrder={dt.sortOrder} onSort={dt.handleSort} />}
                <TableHead className="text-right font-bold py-3.5 pr-5 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <DataTableSkeletonRows rows={5} columns={SKELETON_COLS} hasCheckbox />
              ) : paginatedProducts.length === 0 ? (
                <DataTableEmptyState colSpan={7} icon={IconPackage} emptyDescription='Klik "Tambah Produk Baru" untuk memulai.' hasActiveFilters={hasActiveFilters} onResetFilters={resetFilters} />
              ) : paginatedProducts.map((product, idx) => (
                <TableRow key={product.id} className={`group border-b dark:border-slate-800/50 transition-colors ${dt.selectedRows.has(product.id) ? 'bg-[#2FA4AF]/5 dark:bg-[#2FA4AF]/10' : idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-950/20'} hover:bg-[#2FA4AF]/5 dark:hover:bg-[#2FA4AF]/10`}>
                  <TableCell className="pl-5">
                    <Checkbox checked={dt.selectedRows.has(product.id)} onCheckedChange={() => dt.toggleRow(product.id)} className="border-slate-300 dark:border-slate-600" />
                  </TableCell>
                  {columnVisibility.image && (
                    <TableCell className="py-3">
                      {product.image_url
                        ? <div className="h-11 w-11 rounded-xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm"><img src={product.image_url} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" /></div>
                        : <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-bold">N/A</div>}
                    </TableCell>
                  )}
                  <TableCell className="font-bold text-sm py-3 text-slate-900 dark:text-white max-w-[200px]">
                    <div className="truncate">{product.name}</div>
                    {product.description && <div className="text-xs font-normal text-slate-400 truncate mt-0.5">{product.description}</div>}
                  </TableCell>
                  {columnVisibility.category && <TableCell className="py-3"><Badge variant="secondary" className="font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none text-xs">{product.categories?.name || 'Tanpa Kategori'}</Badge></TableCell>}
                  {columnVisibility.price && <TableCell className="font-black text-[#2FA4AF] py-3 text-sm">Rp {product.price.toLocaleString('id-ID')}</TableCell>}
                  {columnVisibility.stock && <TableCell className="py-3">{getStockBadge(product.stock, product.unit || 'pcs')}</TableCell>}
                  <TableCell className="text-right py-3 pr-5">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors"
                        onClick={async () => {
                          setEditingProduct(product)
                          setFormData({ name: product.name, description: product.description || '', price: product.price, stock: product.stock, unit: product.unit || 'pcs', category_id: product.category_id || '', image: null })
                          const { data: units } = await supabase.from('product_units').select('*').eq('product_id', product.id)
                          setProductUnits(units || []); setIsDialogOpen(true)
                        }}>
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors" onClick={() => handleDelete(product.id)}>
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        {!loading && processedProducts.length > 0 && (
          <DataTablePagination
            currentPage={dt.currentPage}
            totalPages={totalPages}
            pageSize={dt.pageSize}
            total={processedProducts.length}
            onPageChange={dt.setCurrentPage}
            onPageSizeChange={(s: number) => { dt.setPageSize(s); dt.resetPage() }}
          />
        )}
      </Card>
    </div>
  )
}
