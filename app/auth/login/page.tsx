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
import { IconArrowRight, IconLoader2, IconChevronLeft } from '@tabler/icons-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    const user = data.user

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      toast.success('Berhasil masuk!')
      
      if (profile?.role === 'admin') {
        window.location.href = '/admin'
      } else if (profile?.role === 'cashier') {
        window.location.href = '/cashier/pos'
      } else {
        window.location.href = '/customer/shop'
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md mb-4">
        <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-100 rounded-full" asChild>
          <Link href="/">
            <IconChevronLeft size={18} className="mr-2" /> Kembali ke Beranda
          </Link>
        </Button>
      </div>
      <Card className="w-full max-w-md border-slate-100 shadow-sm overflow-hidden">
        <CardHeader className="space-y-2 border-b border-slate-100 pb-6">
          <CardTitle className="text-3xl font-black tracking-tighter text-slate-900 text-center">Selamat Datang Kembali</CardTitle>
          <CardDescription className="text-center text-slate-500 text-sm">
            Masukkan kredensial Anda untuk mengakses akun
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-6">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Kata Sandi</Label>
              </div>
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
                  Masuk <IconArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            <p className="text-center text-sm text-slate-500">
              Belum punya akun?{' '}
              <Link href="/auth/register" className="text-[#2FA4AF] hover:text-[#258a94] hover:underline font-bold">
                Daftar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
