'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { IconLoader2, IconUserShield, IconUser, IconTruck, IconUsers, IconMail } from '@tabler/icons-react'

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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="destructive" className="font-bold rounded-lg px-3 py-1 gap-2">
            <IconUserShield size={14} /> Admin
          </Badge>
        )
      case 'cashier':
        return (
          <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 font-bold rounded-lg px-3 py-1 gap-2 border-none">
            <IconTruck size={14} /> Cashier
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="font-bold rounded-lg px-3 py-1 gap-2">
            <IconUser size={14} /> Customer
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter uppercase">User Access Control</h1>
          <p className="text-muted-foreground font-medium">Manage permissions and roles for your team and customers.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-red-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-red-600">Admins</CardTitle>
            <IconUserShield className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{profiles.filter(p => p.role === 'admin').length} Users</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-600">Cashiers</CardTitle>
            <IconTruck className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{profiles.filter(p => p.role === 'cashier').length} Users</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-slate-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600">Customers</CardTitle>
            <IconUser className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{profiles.filter(p => p.role === 'customer').length} Users</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/30 pb-6 pt-6 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black tracking-tight">System Profiles</CardTitle>
              <CardDescription className="font-medium text-xs uppercase tracking-widest">Database accounts</CardDescription>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <IconUsers size={20} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold py-4 pl-6">Profile</TableHead>
                <TableHead className="font-bold py-4">Current Role</TableHead>
                <TableHead className="font-bold py-4">Last Activity</TableHead>
                <TableHead className="text-right font-bold py-4 pr-6">Change Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20">
                    <IconLoader2 className="mx-auto h-10 w-10 animate-spin text-primary opacity-20" />
                  </TableCell>
                </TableRow>
              ) : profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 opacity-50 font-medium">
                      <IconUsers size={48} />
                      <p>No user profiles found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => (
                  <TableRow key={profile.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase shadow-sm">
                          {profile.full_name?.charAt(0) || '?'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-base leading-tight">{profile.full_name || 'Anonymous User'}</span>
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider font-mono">ID: {profile.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {getRoleBadge(profile.role)}
                    </TableCell>
                    <TableCell className="py-4 font-medium text-sm text-muted-foreground">
                      {new Date(profile.updated_at).toLocaleDateString()} at {new Date(profile.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="text-right py-4 pr-6">
                      <Select
                        defaultValue={profile.role}
                        onValueChange={(value) => handleRoleChange(profile.id, value as any)}
                      >
                        <SelectTrigger className="w-[160px] ml-auto h-10 rounded-xl font-bold shadow-sm border-2">
                          <SelectValue placeholder="Change Role" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="admin" className="font-bold text-red-600">Admin Access</SelectItem>
                          <SelectItem value="cashier" className="font-bold text-blue-600">Cashier Access</SelectItem>
                          <SelectItem value="customer" className="font-bold">Customer Access</SelectItem>
                        </SelectContent>
                      </Select>
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
