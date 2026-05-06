'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { IconPlus, IconTrash, IconEdit, IconLoader2, IconCategory, IconCalendar } from '@tabler/icons-react'

type Category = {
  id: string
  name: string
  created_at: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      toast.error('Gagal mengambil kategori')
    } else {
      setCategories(data || [])
    }
    setLoading(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    const { error } = await supabase
      .from('categories')
      .insert([{ name: newName }])

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Kategori ditambahkan')
      setNewName('')
      fetchCategories()
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return

    const { error } = await supabase
      .from('categories')
      .update({ name: editName })
      .eq('id', id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Kategori diperbarui')
      setEditingId(null)
      fetchCategories()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Kategori dihapus')
      fetchCategories()
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="space-y-1 text-center md:text-left">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Kategori</h1>
        <p className="text-muted-foreground font-medium">Atur produk Anda ke dalam kelompok yang logis.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-4">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 pb-6">
              <CardTitle className="text-xl font-black">Tambah Baru</CardTitle>
              <CardDescription className="font-medium text-xs uppercase tracking-widest">Buat kelompok baru</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Nama Kategori</label>
                  <Input
                    placeholder="e.g. Staple Foods"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-11 rounded-xl shadow-inner border-none bg-muted/50"
                  />
                </div>
                <Button type="submit" className="w-full h-11 font-bold rounded-xl shadow-lg">
                  <IconPlus className="mr-2 h-5 w-5" /> Tambah Kategori
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6 pt-6 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black tracking-tight">Kategori yang Ada</CardTitle>
                  <CardDescription className="font-medium text-xs uppercase tracking-widest">Kelola taksonomi Anda</CardDescription>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <IconCategory size={20} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold py-4 pl-6">Nama</TableHead>
                    <TableHead className="font-bold py-4">Dibuat Pada</TableHead>
                    <TableHead className="text-right font-bold py-4 pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-20">
                        <IconLoader2 className="mx-auto h-10 w-10 animate-spin text-primary opacity-20" />
                      </TableCell>
                    </TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-20 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2 opacity-50 font-medium">
                          <IconCategory size={48} />
                          <p>Kategori tidak ditemukan.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="py-4 pl-6">
                          {editingId === category.id ? (
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-10 rounded-lg shadow-inner"
                              autoFocus
                            />
                          ) : (
                            <span className="font-bold text-base">{category.name}</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                            <IconCalendar size={14} />
                            {new Date(category.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-4 pr-6 space-x-1">
                          {editingId === category.id ? (
                            <>
                              <Button 
                                size="sm" 
                                className="rounded-lg h-9 font-bold px-4 shadow-sm"
                                onClick={() => handleUpdate(category.id)}
                              >
                                Simpan
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="rounded-lg h-9 font-medium"
                                onClick={() => setEditingId(null)}
                              >
                                Batal
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 rounded-xl hover:bg-blue-500/10 text-blue-500"
                                onClick={() => {
                                  setEditingId(category.id)
                                  setEditName(category.name)
                                }}
                              >
                                <IconEdit className="h-5 w-5" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-destructive"
                                onClick={() => handleDelete(category.id)}
                              >
                                <IconTrash className="h-5 w-5" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
