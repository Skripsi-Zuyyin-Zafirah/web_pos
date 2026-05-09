'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { IconLoader2, IconUserPlus } from '@tabler/icons-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi.')
    router.push('/auth/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-100 shadow-sm overflow-hidden">
        <CardHeader className="space-y-2 border-b border-slate-100 pb-6">
          <CardTitle className="text-3xl font-black tracking-tighter text-slate-900 text-center">Buat Akun</CardTitle>
          <CardDescription className="text-center text-slate-500 text-sm">
            Masukkan detail Anda untuk mendaftar sebagai pelanggan baru
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">Nama Lengkap</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-white border-slate-200 focus-visible:ring-[#2FA4AF]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-slate-200 focus-visible:ring-[#2FA4AF]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Kata Sandi</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white border-slate-200 focus-visible:ring-[#2FA4AF]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-2">
            <Button type="submit" className="w-full h-11 bg-[#2FA4AF] hover:bg-[#258a94] text-white rounded-full font-bold shadow-lg shadow-[#2FA4AF]/20 transition-colors" disabled={loading}>
              {loading ? (
                <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  <IconUserPlus className="mr-2 h-5 w-5" /> Daftar
                </>
              )}
            </Button>
            <p className="text-center text-sm text-slate-500">
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="text-[#2FA4AF] hover:text-[#258a94] hover:underline font-bold">
                Masuk
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
