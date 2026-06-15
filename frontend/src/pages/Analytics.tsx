import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Megaphone, TrendingUp, Award, Lightbulb,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { getCampaigns, getMembers } from '../lib/api'
import type { Campaign, Member } from '../types'
import SkeletonCard from '../components/ui/SkeletonCard'
import AnimatedNumber from '../components/ui/AnimatedNumber'

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: '#0c0c1d',
    border: '1px solid rgba(0, 212, 255, 0.08)',
    borderRadius: 10,
    color: '#fff',
    fontSize: 12,
  },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay } },
})

// ─── Header stat card ───────────────────────────────────────────────────────
function StatCard({
  icon: Icon, iconBg, iconColor, borderColor, label, value, suffix, sub, delay,
}: {
  icon: typeof Megaphone; iconBg: string; iconColor: string; borderColor: string
  label: string; value: number; suffix?: string; sub: string; delay: number
}) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className="card p-5 relative overflow-hidden flex flex-col gap-3"
      style={{ borderColor }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">
          <AnimatedNumber value={value} />{suffix}
        </p>
        <p className="text-xs text-gray-600 mt-1">{sub}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(to right, ${borderColor}, transparent)` }} />
    </motion.div>
  )
}

// ─── Channel performance bar chart ─────────────────────────────────────────
function ChannelChart({ campaigns }: { campaigns: Campaign[] }) {
  const data = useMemo(() => {
    const acc: Record<string, { sent: number; delivered: number; opened: number; converted: number }> = {}
    campaigns.forEach((c) => {
      if (!acc[c.channel]) acc[c.channel] = { sent: 0, delivered: 0, opened: 0, converted: 0 }
      acc[c.channel].sent += c.totalSent
      acc[c.channel].delivered += c.totalDelivered
      acc[c.channel].opened += c.totalOpened
      acc[c.channel].converted += c.totalConverted
    })
    return Object.entries(acc).map(([channel, v]) => ({
      channel,
      'Delivery %': v.sent ? Math.round((v.delivered / v.sent) * 100) : 0,
      'Open %': v.sent ? Math.round((v.opened / v.sent) * 100) : 0,
      'Conversion %': v.sent ? Math.round((v.converted / v.sent) * 100) : 0,
    }))
  }, [campaigns])

  if (data.length === 0) return <EmptyState text="No campaign data" />

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
        <XAxis dataKey="channel" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
        <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v: any) => `${v}%`} />
        <Legend wrapperStyle={{ color: '#666', fontSize: 12 }} />
        <Bar dataKey="Delivery %" fill="#00d4ff" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Open %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Conversion %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Campaign timeline line chart ───────────────────────────────────────────
function TimelineChart({ campaigns }: { campaigns: Campaign[] }) {
  const data = useMemo(() => {
    const sorted = [...campaigns]
      .filter((c) => c.totalSent > 0)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, 10)
      .map((c) => ({
        name: c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name,
        Sent: c.totalSent,
        Delivered: c.totalDelivered,
        Converted: c.totalConverted,
      }))
    return sorted
  }, [campaigns])

  if (data.length === 0) return <EmptyState text="No launched campaigns yet" />

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...CHART_TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ color: '#666', fontSize: 12 }} />
        <Line type="monotone" dataKey="Sent" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
        <Line type="monotone" dataKey="Delivered" stroke="#00d4ff" strokeWidth={2} dot={{ r: 3, fill: '#00d4ff' }} />
        <Line type="monotone" dataKey="Converted" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── Risk distribution pie ──────────────────────────────────────────────────
const RISK_COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#00d4ff' } as const

function RiskPie({ members }: { members: Member[] }) {
  const data = useMemo(() => {
    const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 }
    members.forEach((m) => counts[m.churnRisk]++)
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [members])

  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <EmptyState text="No member data" />

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={78}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map(({ name }) => (
              <Cell key={name} fill={RISK_COLORS[name as keyof typeof RISK_COLORS]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#0c0c1d', border: '1px solid rgba(0,212,255,0.08)', borderRadius: 10, color: '#fff', fontSize: 12 }}
            formatter={(value: any, name: any) => [`${value} members (${Math.round((value / total) * 100)}%)`, name]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom legend */}
      <div className="flex items-center justify-center gap-6">
        {data.map(({ name, value }) => {
          const color = RISK_COLORS[name as keyof typeof RISK_COLORS]
          const pct = Math.round((value / total) * 100)
          return (
            <div key={name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
              <span className="text-xs text-gray-400">{name}</span>
              <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
              <span className="text-xs text-gray-600">({value})</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── AI insights ────────────────────────────────────────────────────────────
function AIInsights({ campaigns, members }: { campaigns: Campaign[]; members: Member[] }) {
  const insights = useMemo(() => {
    const list: { icon: string; text: string }[] = []

    const highRisk = members.filter((m) => m.churnRisk === 'HIGH').length
    if (highRisk > 0) {
      list.push({ icon: '🔴', text: `${highRisk} members are at high churn risk. Consider launching a re-engagement campaign with personalised messages.` })
    }

    const completed = campaigns.filter((c) => c.status === 'COMPLETED' && c.totalSent > 0)
    if (completed.length > 0) {
      const bestCampaign = completed.reduce((a, b) =>
        b.totalDelivered / b.totalSent > a.totalDelivered / a.totalSent ? b : a,
      )
      list.push({
        icon: '🏆',
        text: `"${bestCampaign.name}" was your best campaign with ${Math.round((bestCampaign.totalDelivered / bestCampaign.totalSent) * 100)}% delivery rate via ${bestCampaign.channel}.`,
      })
    }

    const emailCampaigns = completed.filter((c) => c.channel === 'EMAIL')
    const whatsappCampaigns = completed.filter((c) => c.channel === 'WHATSAPP')
    if (emailCampaigns.length > 0 && whatsappCampaigns.length > 0) {
      const emailRate = emailCampaigns.reduce((s, c) => s + c.totalDelivered / c.totalSent, 0) / emailCampaigns.length
      const waRate = whatsappCampaigns.reduce((s, c) => s + c.totalDelivered / c.totalSent, 0) / whatsappCampaigns.length
      list.push({
        icon: waRate > emailRate ? '💬' : '📧',
        text: `${waRate > emailRate ? 'WhatsApp' : 'Email'} outperforms other channels with a ${Math.round(Math.max(emailRate, waRate) * 100)}% avg delivery rate.`,
      })
    }

    const goldMembers = members.filter((m) => m.membershipType === 'GOLD' && m.churnRisk === 'HIGH').length
    if (goldMembers > 0) {
      list.push({ icon: '👑', text: `${goldMembers} Gold members are at high risk. Prioritise VIP outreach to protect revenue.` })
    }

    if (list.length === 0) {
      list.push({ icon: '📊', text: 'Run campaigns and collect data to unlock AI-powered insights about your member retention.' })
    }

    return list.slice(0, 4)
  }, [campaigns, members])

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Lightbulb size={16} className="text-violet-DEFAULT" />
        <span className="text-sm font-semibold text-white">AI Insights</span>
      </div>
      <div className="flex flex-col gap-3">
        {insights.map(({ icon, text }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0, transition: { delay: 0.6 + i * 0.1 } }}
            className="flex items-start gap-3 p-3 rounded-xl bg-dark-200 border border-dark-100"
          >
            <span className="text-base flex-shrink-0">{icon}</span>
            <p className="text-xs text-gray-400 leading-relaxed">{text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-48 text-gray-600 text-sm">{text}</div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function Analytics() {
  const { data: campaigns, isLoading: campsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => getCampaigns().then((r) => r.data as Campaign[]),
  })

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['members-all'],
    queryFn: () => getMembers().then((r) => r.data as Member[]),
  })

  const stats = useMemo(() => {
    if (!campaigns) return null
    const total = campaigns.length
    const totalSent = campaigns.reduce((s, c) => s + c.totalSent, 0)
    const totalDelivered = campaigns.reduce((s, c) => s + c.totalDelivered, 0)
    const deliveryRate = totalSent === 0 ? 0 : Math.round((totalDelivered / totalSent) * 100)

    const channelRates: Record<string, number[]> = {}
    campaigns.forEach((c) => {
      if (c.totalSent === 0) return
      if (!channelRates[c.channel]) channelRates[c.channel] = []
      channelRates[c.channel].push(c.totalDelivered / c.totalSent)
    })
    const bestChannel = Object.entries(channelRates).sort(
      ([, a], [, b]) =>
        b.reduce((s, v) => s + v, 0) / b.length - a.reduce((s, v) => s + v, 0) / a.length,
    )[0]?.[0] ?? '—'

    return { total, deliveryRate, bestChannel }
  }, [campaigns])

  const isLoading = campsLoading || membersLoading

  const headerStats = [
    {
      icon: Megaphone, iconBg: 'bg-violet-DEFAULT/20', iconColor: 'text-violet-DEFAULT',
      borderColor: 'rgba(139,92,246,0.3)', label: 'Total Campaigns',
      value: stats?.total ?? 0, sub: 'All time', delay: 0,
    },
    {
      icon: TrendingUp, iconBg: 'bg-cyan-DEFAULT/20', iconColor: 'text-cyan-DEFAULT',
      borderColor: 'rgba(0,212,255,0.2)', label: 'Avg Delivery Rate',
      value: stats?.deliveryRate ?? 0, suffix: '%', sub: 'Across all channels', delay: 0.1,
    },
    {
      icon: Award, iconBg: 'bg-amber-500/20', iconColor: 'text-amber-400',
      borderColor: 'rgba(245,158,11,0.3)', label: 'Best Channel',
      value: 0, sub: stats?.bestChannel ?? 'No data yet', delay: 0.2,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} height="h-36" lines={2} />)
          : headerStats.map((s, i) =>
              s.label === 'Best Channel' ? (
                <motion.div
                  key={s.label}
                  {...fadeUp(s.delay)}
                  className="card p-5 relative overflow-hidden flex flex-col gap-3"
                  style={{ borderColor: s.borderColor }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                    <s.icon size={18} className={s.iconColor} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">{s.label}</p>
                    <p className="text-3xl font-bold text-white">{stats?.bestChannel ?? '—'}</p>
                    <p className="text-xs text-gray-600 mt-1">Highest delivery rate</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(to right, ${s.borderColor}, transparent)` }} />
                </motion.div>
              ) : (
                <StatCard key={i} {...s} />
              ),
            )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Channel performance */}
        <motion.div {...fadeUp(0.3)} className="card p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-white">Channel Performance</p>
          {isLoading ? (
            <div className="h-[220px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-cyan-DEFAULT/30 border-t-cyan-DEFAULT rounded-full animate-spin" />
            </div>
          ) : (
            <ChannelChart campaigns={campaigns ?? []} />
          )}
        </motion.div>

        {/* Risk distribution */}
        <motion.div {...fadeUp(0.35)} className="card p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-white">Churn Risk Distribution</p>
          {isLoading ? (
            <div className="h-[220px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-cyan-DEFAULT/30 border-t-cyan-DEFAULT rounded-full animate-spin" />
            </div>
          ) : (
            <RiskPie members={members ?? []} />
          )}
        </motion.div>
      </div>

      {/* Timeline */}
      <motion.div {...fadeUp(0.4)} className="card p-5 flex flex-col gap-4">
        <p className="text-sm font-semibold text-white">Campaign Timeline</p>
        {isLoading ? (
          <div className="h-[220px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-cyan-DEFAULT/30 border-t-cyan-DEFAULT rounded-full animate-spin" />
          </div>
        ) : (
          <TimelineChart campaigns={campaigns ?? []} />
        )}
      </motion.div>

      {/* AI Insights */}
      {!isLoading && (
        <motion.div {...fadeUp(0.5)}>
          <AIInsights campaigns={campaigns ?? []} members={members ?? []} />
        </motion.div>
      )}
    </div>
  )
}
