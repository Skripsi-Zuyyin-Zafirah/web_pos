'use client'

import { StaffMember } from '@/hooks/use-staff'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IconUser, IconChefHat, IconCircleCheck, IconClock } from '@tabler/icons-react'

// --- StaffStatusGrid ---
export function StaffStatusGrid({ staff, loading }: { staff: StaffMember[], loading: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {loading ? (
        Array(4).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse bg-muted/50 border-none h-32 rounded-3xl" />
        ))
      ) : (
        staff.map((member) => (
          <Card 
            key={member.id} 
            className={`border-none shadow-sm rounded-3xl overflow-hidden transition-all duration-300 ${
              member.status === 'busy' ? 'bg-amber-500/10 ring-2 ring-amber-500/20' : 'bg-emerald-500/10 ring-2 ring-emerald-500/20'
            }`}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                member.status === 'busy' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
              }`}>
                {member.status === 'busy' ? <IconChefHat size={24} /> : <IconUser size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm uppercase tracking-tighter truncate">{member.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-none ${
                      member.status === 'busy' ? 'bg-amber-500/20 text-amber-700' : 'bg-emerald-500/20 text-emerald-700'
                    }`}
                  >
                    {member.status}
                  </Badge>
                  {member.status === 'busy' && (
                    <span className="text-[9px] font-bold text-amber-600 animate-pulse truncate">
                      Processing...
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

// --- QueueStatsCounter ---
export function QueueStatsCounter({ 
  waiting, 
  processing, 
  done 
}: { 
  waiting: number, 
  processing: number, 
  done: number 
}) {
  const stats = [
    { label: 'Waiting in Heap', value: waiting, icon: IconClock, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { label: 'Processing', value: processing, icon: IconChefHat, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { label: 'Completed Today', value: done, icon: IconCircleCheck, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden bg-background">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
            </div>
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
