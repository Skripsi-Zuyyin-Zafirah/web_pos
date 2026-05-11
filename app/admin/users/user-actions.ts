'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string

  if (!email || !password || !fullName || !role) {
    return { error: 'Semua field harus diisi' }
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: 'Konfigurasi server tidak lengkap (Service Role Key hilang)' }
  }

  const supabase = await createAdminClient()

  // 1. Create user in Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  })

  if (authError) {
    return { error: 'Gagal membuat akun: ' + authError.message }
  }

  const userId = authData.user.id

  // 2. Update profile (Trigger might have already created it, but we want to ensure role is set)
  // We'll use upsert to be safe
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: fullName,
      role: role
    })

  if (profileError) {
    return { error: 'Gagal membuat profil: ' + profileError.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
