'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  IconShoppingCart, 
  IconClock2, 
  IconChecklist, 
  IconGift,
  IconArrowRight
} from '@tabler/icons-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CustomerDashboard() {
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">Selamat datang kembali, Zuyyin!</p>
        </div>
        <Link href="/customer/shop">
          <Button className="bg-[#2FA4AF] hover:bg-[#258a94] text-white rounded-full font-bold shadow-lg shadow-[#2FA4AF]/20">
            Mulai Belanja <IconShoppingCart size={18} className="ml-2" />
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Pesanan Aktif', value: '1', icon: IconClock2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { title: 'Total Belanja', value: '12', icon: IconChecklist, color: 'text-[#2FA4AF]', bg: 'bg-[#2FA4AF]/10' },
          { title: 'Poin Loyalitas', value: '450', icon: IconGift, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { title: 'Estimasi Tunggu', value: '5 mnt', icon: IconClock2, color: 'text-violet-500', bg: 'bg-violet-500/10' },
        ].map((stat, index) => (
          <Card key={index} className="border-slate-100 shadow-sm">
            <CardContent className="p-6 flex flex-col gap-2">
              <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <p className="text-xs font-medium text-slate-500 mt-2">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Order Status - Large Widget */}
        <Card className="lg:col-span-2 border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-bold">Status Pesanan Aktif</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Queue Circle */}
              <div className="relative h-32 w-32 flex-shrink-0">
                <div className="absolute inset-0 bg-slate-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-[#2FA4AF] rounded-full border-t-transparent animate-spin-slow" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-[#2FA4AF]">#3</span>
                  <span className="text-xs font-medium text-slate-500">Antrean</span>
                </div>
              </div>

              {/* Order Details */}
              <div className="flex-1 space-y-4 w-full">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900">Pesanan #ORD-9928</h4>
                    <p className="text-xs text-slate-500">5 item • Rp 150.000</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                    Sedang Diproses
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Progres</span>
                    <span>60%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2FA4AF] rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Pesanan Anda diprioritaskan karena memiliki jumlah item yang lebih sedikit (Algoritma Min-Heap).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links / Promo */}
        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-[#2FA4AF] to-[#258a94] text-white">
          <CardContent className="p-6 flex flex-col h-full justify-between gap-6">
            <div>
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-white mb-4">
                <IconGift size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Tukarkan Poin Anda!</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Anda memiliki 450 poin. Tukarkan dengan diskon belanja atau merchandise menarik.
              </p>
            </div>
            <Button variant="secondary" className="w-full bg-white text-[#2FA4AF] hover:bg-slate-50 font-bold rounded-full mt-auto">
              Tukarkan Sekarang <IconArrowRight size={16} className="ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-bold">Riwayat Pesanan Terakhir</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">ID Pesanan</th>
                  <th scope="col" className="px-6 py-4 font-bold">Tanggal</th>
                  <th scope="col" className="px-6 py-4 font-bold">Total</th>
                  <th scope="col" className="px-6 py-4 font-bold">Status</th>
                  <th scope="col" className="px-6 py-4 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: '#ORD-9920', date: '09 Mei 2026', total: 'Rp 250.000', status: 'Selesai', statusBg: 'bg-emerald-100 text-emerald-700' },
                  { id: '#ORD-9915', date: '08 Mei 2026', total: 'Rp 450.000', status: 'Selesai', statusBg: 'bg-emerald-100 text-emerald-700' },
                  { id: '#ORD-9902', date: '05 Mei 2026', total: 'Rp 120.000', status: 'Dibatalkan', statusBg: 'bg-rose-100 text-rose-700' },
                ].map((order, index) => (
                  <tr key={index} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <th scope="row" className="px-6 py-4 font-bold text-slate-900">{order.id}</th>
                    <td className="px-6 py-4">{order.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{order.total}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${order.statusBg}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" className="text-[#2FA4AF] hover:text-[#258a94] hover:bg-[#2FA4AF]/5 font-bold">
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
