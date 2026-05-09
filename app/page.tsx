'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  IconShoppingCart, 
  IconTrendingUp, 
  IconUsers, 
  IconArrowRight, 
  IconLayoutDashboard,
  IconClock2
} from '@tabler/icons-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
      {/* Navbar */}
      <header className="h-20 border-b border-slate-200 flex items-center justify-between px-6 md:px-20 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-[#2FA4AF] to-[#258a94] p-2 rounded-xl shadow-lg shadow-[#2FA4AF]/20">
            <IconTrendingUp className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900">
            WHOLESALE POS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold">
              Masuk
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="font-bold rounded-full px-6 bg-[#2FA4AF] hover:bg-[#258a94] border-none shadow-lg shadow-[#2FA4AF]/30 text-white">
              Daftar
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 px-6 md:px-20 overflow-hidden bg-white">
          {/* Background Glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2FA4AF]/10 blur-[100px] rounded-full -z-10" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#2FA4AF]/5 blur-[100px] rounded-full -z-10" />

          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2FA4AF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2FA4AF]"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2FA4AF]">Sistem POS Generasi Baru</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none text-slate-900">
                Sistem Kasir Pintar untuk Perdagangan Grosir
              </h1>
              
              <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
                Maksimalkan efisiensi dengan antrean prioritas <span className="text-[#2FA4AF] font-bold">Min-Heap</span> otomatis. Pesanan terkecil diproses lebih dulu, menjaga kepuasan pelanggan dan produktivitas staf Anda.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/menu">
                  <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-full bg-[#2FA4AF] hover:bg-[#258a94] border-none shadow-xl shadow-[#2FA4AF]/20 text-white">
                    Lihat Menu <IconArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/queue">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-full border-slate-300 hover:bg-slate-100 text-slate-700">
                    Pantau Antrean <IconClock2 className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div 
              className="relative lg:h-[500px] flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#2FA4AF]/10 to-transparent blur-3xl rounded-3xl" />
              <div className="relative rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/50 overflow-hidden w-full max-w-md lg:max-w-none">
                <Image 
                  src="/pos_dashboard_light.png" 
                  alt="POS Dashboard Mockup" 
                  width={800} 
                  height={600} 
                  className="rounded-xl w-full h-auto object-cover"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section: Cara Kerja (Min-Heap) */}
        <section className="py-24 px-6 md:px-20 bg-slate-50 border-t border-b border-slate-200 relative">
          <div className="max-w-5xl mx-auto text-center space-y-4 mb-16">
            <span className="text-[#2FA4AF] font-bold uppercase tracking-wider text-sm">Algoritma Cerdas</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">Bagaimana Min-Heap Membantu Anda?</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Kami memecahkan masalah antrean panjang akibat transaksi grosir besar dengan algoritma prioritas.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Pesanan Masuk',
                desc: 'Setiap pesanan dihitung berdasarkan jumlah item dan estimasi waktu proses.',
                icon: <IconShoppingCart className="h-8 w-8" />
              },
              {
                step: '02',
                title: 'Min-Heap Sorting',
                desc: 'Sistem secara otomatis menempatkan pesanan dengan item lebih sedikit di depan antrean.',
                icon: <IconClock2 className="h-8 w-8" />
              },
              {
                step: '03',
                title: 'Efisiensi Maksimal',
                desc: 'Pelanggan kecil tidak perlu menunggu lama, dan transaksi besar tetap terproses efisien.',
                icon: <IconTrendingUp className="h-8 w-8" />
              }
            ].map((item, index) => (
              <div key={index} className="relative p-8 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:border-[#2FA4AF]/50 transition-all duration-300">
                <div className="absolute top-4 right-4 text-5xl font-black text-slate-100 group-hover:text-[#2FA4AF]/10 transition-colors">
                  {item.step}
                </div>
                <div className="h-14 w-14 rounded-2xl bg-[#2FA4AF]/10 flex items-center justify-center text-[#2FA4AF] mb-6 group-hover:bg-[#2FA4AF] group-hover:text-white transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 px-6 md:px-20 max-w-7xl mx-auto bg-white">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[#2FA4AF] font-bold uppercase tracking-wider text-sm">Fitur Unggulan</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">Dirancang untuk Skala Besar</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-slate-100 bg-slate-50 rounded-3xl overflow-hidden group hover:border-[#2FA4AF]/50 transition-all duration-300">
              <CardContent className="p-10 space-y-4 flex flex-col h-full justify-between">
                <div>
                  <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                    <IconTrendingUp size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Antrean Prioritas</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Algoritma kami secara otomatis memprioritaskan pesanan kecil, mengurangi hambatan dari transaksi grosir yang besar.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 bg-slate-50 rounded-3xl overflow-hidden group hover:border-[#2FA4AF]/50 transition-all duration-300">
              <CardContent className="p-10 space-y-4 flex flex-col h-full justify-between">
                <div>
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                    <IconShoppingCart size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Kasir Grosir</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Manajemen pesanan dalam jumlah besar dengan pelacakan stok real-time dan perhitungan EWP otomatis untuk setiap transaksi.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 bg-slate-50 rounded-3xl overflow-hidden group hover:border-[#2FA4AF]/50 transition-all duration-300">
              <CardContent className="p-10 space-y-4 flex flex-col h-full justify-between">
                <div>
                  <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                    <IconLayoutDashboard size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Wawasan Admin</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Pantau performa bisnis Anda dengan analitik yang menawan, tren penjualan, dan metrik produktivitas staf.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section: Testimoni / Social Proof */}
        <section className="py-24 px-6 md:px-20 bg-slate-50 border-t border-b border-slate-200">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <span className="text-[#2FA4AF] font-bold uppercase tracking-wider text-sm">Testimoni</span>
              <h2 className="text-4xl font-black tracking-tighter text-slate-900">Apa Kata Mereka?</h2>
              <p className="text-slate-600 text-sm">
                Dipercaya oleh pemilik bisnis grosir untuk meningkatkan efisiensi harian mereka.
              </p>
            </div>
            
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
              {[
                {
                  quote: "Sistem Min-Heap benar-benar mengubah cara kami melayani pelanggan. Antrean menjadi jauh lebih teratur.",
                  author: "Andi Pratama",
                  role: "Pemilik Toko Grosir Jaya"
                },
                {
                  quote: "Dashboard analitiknya sangat membantu saya melihat produk mana yang paling laku setiap bulannya.",
                  author: "Siti Rahma",
                  role: "Manager Operasional"
                }
              ].map((testi, index) => (
                <div key={index} className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
                  <p className="text-slate-600 text-sm leading-relaxed italic">"{testi.quote}"</p>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{testi.author}</h4>
                    <p className="text-xs text-slate-500">{testi.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links / CTA */}
        <section className="py-24 px-6 md:px-20 relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#2FA4AF]/5 -z-10" />
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">
              Siap untuk mengoptimalkan staf Anda?
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <Link href="/admin">
                <div className="p-8 bg-white rounded-3xl shadow-lg border border-slate-200 hover:border-[#2FA4AF]/50 transition-all group cursor-pointer">
                  <IconUsers size={40} className="mx-auto mb-4 text-slate-400 group-hover:text-[#2FA4AF] transition-colors" />
                  <h4 className="text-xl font-bold text-slate-900">Portal Admin</h4>
                  <p className="text-sm text-slate-600 mt-2">Kelola produk, pengguna, dan lihat analitik.</p>
                </div>
              </Link>
              <Link href="/cashier/pos">
                <div className="p-8 bg-white rounded-3xl shadow-lg border border-slate-200 hover:border-[#2FA4AF]/50 transition-all group cursor-pointer">
                  <IconShoppingCart size={40} className="mx-auto mb-4 text-slate-400 group-hover:text-[#2FA4AF] transition-colors" />
                  <h4 className="text-xl font-bold text-slate-900">Antarmuka Kasir</h4>
                  <p className="text-sm text-slate-600 mt-2">Input transaksi cepat dan manajemen antrean.</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200 text-center text-slate-500 text-sm font-medium bg-white">
        <p>&copy; 2026 Sistem Kasir Grosir. Dibangun untuk kecepatan dan efisiensi.</p>
      </footer>
    </div>
  )
}
