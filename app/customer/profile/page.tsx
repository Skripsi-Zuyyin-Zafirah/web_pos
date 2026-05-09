'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconUser, IconMail, IconShield, IconDeviceFloppy } from '@tabler/icons-react'
import { toast } from 'sonner'

type Profile = {
  id: string
  full_name: string | null
  role: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [fullName, setFullName] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      setEmail(user.email || '')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setProfile(data as Profile)
        setFullName(data.full_name || '')
      }
    }
    setLoading(false)
  }

  const handleUpdate = async () => {
    if (!profile) return

    setUpdating(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq('id', profile.id)

    if (error) {
      toast.error('Gagal memperbarui profil: ' + error.message)
    } else {
      toast.success('Profil berhasil diperbarui!')
      setProfile({ ...profile, full_name: fullName })
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 rounded-lg w-1/4"></div>
          <div className="h-64 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">

      <div className="grid gap-6">
        {/* Profile Card */}
        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <IconUser size={20} className="text-[#2FA4AF]" />
              Informasi Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">Nama Lengkap</Label>
              <div className="relative">
                <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 h-11 border-slate-200 focus:border-[#2FA4AF] focus:ring-[#2FA4AF]/20"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Alamat Email</Label>
              <div className="relative">
                <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  value={email}
                  readOnly
                  className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-400">Email tidak dapat diubah.</p>
            </div>

            {/* Role (Readonly) */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-slate-700">Peran Akun</Label>
              <div className="relative">
                <IconShield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="role"
                  value={profile?.role || 'Pelanggan'}
                  readOnly
                  className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-500 capitalize cursor-not-allowed"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleUpdate}
                disabled={updating}
                className="bg-[#2FA4AF] hover:bg-[#258a94] text-white font-bold px-6 h-11 rounded-full shadow-lg shadow-[#2FA4AF]/20 transition-all"
              >
                {updating ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <IconDeviceFloppy size={18} />
                    Simpan Perubahan
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
