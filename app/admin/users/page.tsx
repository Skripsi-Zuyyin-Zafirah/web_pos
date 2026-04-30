'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { IconLoader2, IconUserShield, IconUser, IconTruck } from '@tabler/icons-react'

type Profile = {
  id: string
  full_name: string | null
  role: 'admin' | 'cashier' | 'customer'
  updated_at: string
}

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true })

    if (error) {
      toast.error('Failed to fetch users')
    } else {
      setProfiles(data || [])
    }
    setLoading(false)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('User role updated')
      fetchProfiles()
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <IconUserShield className="h-4 w-4 text-red-500" />
      case 'cashier':
        return <IconTruck className="h-4 w-4 text-blue-500" />
      default:
        return <IconUser className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <IconLoader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">
                    {profile.full_name || 'N/A'}
                    <div className="text-xs text-muted-foreground font-normal">{profile.id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(profile.role)}
                      <span className="capitalize">{profile.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(profile.updated_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      defaultValue={profile.role}
                      onValueChange={(value) => handleRoleChange(profile.id, value)}
                    >
                      <SelectTrigger className="w-[140px] ml-auto">
                        <SelectValue placeholder="Change Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="cashier">Cashier</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
