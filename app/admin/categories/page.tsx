'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { IconPlus, IconTrash, IconEdit, IconLoader2 } from '@tabler/icons-react'

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
      toast.error('Failed to fetch categories')
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
      toast.success('Category added')
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
      toast.success('Category updated')
      setEditingId(null)
      fetchCategories()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Category deleted')
      fetchCategories()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex gap-4">
            <Input
              placeholder="Category name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit">
              <IconPlus className="mr-2 h-4 w-4" /> Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <IconLoader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {editingId === category.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8"
                          autoFocus
                        />
                      ) : (
                        category.name
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(category.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {editingId === category.id ? (
                        <>
                          <Button size="sm" onClick={() => handleUpdate(category.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(category.id)
                              setEditName(category.name)
                            }}
                          >
                            <IconEdit className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(category.id)}>
                            <IconTrash className="h-4 w-4 text-destructive" />
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
  )
}
