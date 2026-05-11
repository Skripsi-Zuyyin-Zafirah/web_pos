'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  IconUser, 
  IconMail, 
  IconShield, 
  IconDeviceFloppy, 
  IconPhone, 
  IconMapPin, 
  IconLock,
  IconKey,
  IconCircleCheck,
  IconAlertCircle
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

type Profile = {
  id: string
  full_name: string | null
  role: string
  phone_number: string | null
  address: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  // Profile form state
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')

  // Password form state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordUpdating, setPasswordUpdating] = useState(false)

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
        setPhoneNumber(data.phone_number || '')
        setAddress(data.address || '')
      }
    }
    setLoading(false)
  }

  const handleUpdateProfile = async () => {
    if (!profile) return

    setUpdating(true)
    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: fullName, 
        phone_number: phoneNumber,
        address: address,
        updated_at: new Date().toISOString() 
      })
      .eq('id', profile.id)

    if (error) {
      toast.error('Gagal memperbarui profil: ' + error.message)
    } else {
      toast.success('Profil berhasil diperbarui!')
      setProfile({ ...profile, full_name: fullName, phone_number: phoneNumber, address: address })
    }
    setUpdating(false)
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi kata sandi tidak cocok')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Kata sandi minimal 6 karakter')
      return
    }

    setPasswordUpdating(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      toast.error('Gagal mengubah kata sandi: ' + error.message)
    } else {
      toast.success('Kata sandi berhasil diubah!')
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordUpdating(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 rounded-lg w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-96 bg-slate-100 rounded-3xl"></div>
            <div className="h-96 bg-slate-100 rounded-3xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">Pengaturan Akun</h1>
        <p className="text-slate-500 font-medium">Kelola informasi profil dan keamanan akun Anda.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden overflow-visible relative">
              <div className="absolute -top-4 -right-4 h-24 w-24 bg-[#2FA4AF]/5 rounded-full blur-2xl -z-10" />
              <CardHeader className="border-b border-slate-50 bg-slate-50/30 pb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#2FA4AF]/10 flex items-center justify-center text-[#2FA4AF]">
                    <IconUser size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight text-slate-900">Informasi Pribadi</CardTitle>
                    <CardDescription className="font-medium text-slate-500 text-xs uppercase tracking-wider">Detail profil Anda</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Nama Lengkap</Label>
                    <div className="relative group">
                      <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#2FA4AF] transition-colors" />
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 h-12 border-slate-200 rounded-xl focus:ring-4 focus:ring-[#2FA4AF]/10 focus:border-[#2FA4AF] transition-all font-medium"
                        placeholder="Nama lengkap"
                      />
                    </div>
                  </div>

                  {/* Email (Readonly) */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Alamat Email</Label>
                    <div className="relative">
                      <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="email"
                        value={email}
                        readOnly
                        className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Nomor Telepon</Label>
                    <div className="relative group">
                      <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#2FA4AF] transition-colors" />
                      <Input
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-10 h-12 border-slate-200 rounded-xl focus:ring-4 focus:ring-[#2FA4AF]/10 focus:border-[#2FA4AF] transition-all font-medium"
                        placeholder="0812xxxx"
                      />
                    </div>
                  </div>

                  {/* Role (Readonly) */}
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Peran Akun</Label>
                    <div className="relative">
                      <IconShield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="role"
                        value={profile?.role || 'Pelanggan'}
                        readOnly
                        className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl text-slate-500 capitalize cursor-not-allowed font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Alamat Lengkap</Label>
                  <div className="relative group">
                    <IconMapPin className="absolute left-3 top-4 h-5 w-5 text-slate-400 group-focus-within:text-[#2FA4AF] transition-colors" />
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10 min-h-[100px] border-slate-200 rounded-xl focus:ring-4 focus:ring-[#2FA4AF]/10 focus:border-[#2FA4AF] transition-all font-medium resize-none"
                      placeholder="Masukkan alamat lengkap Anda..."
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={updating}
                    className="bg-[#2FA4AF] hover:bg-[#258a94] text-white font-black px-8 h-12 rounded-2xl shadow-xl shadow-[#2FA4AF]/20 transition-all active:scale-95"
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
          </motion.div>
        </div>

        {/* Security / Password */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-slate-900 text-white relative">
              <div className="absolute top-0 right-0 h-32 w-32 bg-white/5 rounded-full blur-3xl -z-0" />
              <CardHeader className="border-b border-white/10 pb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                    <IconLock size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight">Keamanan</CardTitle>
                    <CardDescription className="font-medium text-slate-400 text-xs uppercase tracking-wider">Ubah kata sandi akun</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Kata Sandi Baru</Label>
                    <div className="relative">
                      <IconKey className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-4 focus:ring-white/10 focus:border-white/20 transition-all font-medium text-white placeholder:text-slate-600"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Konfirmasi Sandi</Label>
                    <div className="relative">
                      <IconCircleCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-4 focus:ring-white/10 focus:border-white/20 transition-all font-medium text-white placeholder:text-slate-600"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleChangePassword}
                    disabled={passwordUpdating || !newPassword}
                    className="w-full bg-white hover:bg-slate-100 text-slate-900 font-black h-12 rounded-2xl shadow-xl shadow-black/20 transition-all active:scale-95"
                  >
                    {passwordUpdating ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        Memproses...
                      </span>
                    ) : (
                      'Perbarui Kata Sandi'
                    )}
                  </Button>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex gap-3">
                  <IconAlertCircle className="shrink-0 text-amber-400" size={20} />
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Kata sandi harus terdiri dari minimal 6 karakter. Pastikan Anda mengingat kata sandi baru Anda.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
