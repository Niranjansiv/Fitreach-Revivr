import { useState, useEffect, useMemo } from 'react'
import type { CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Search, X, Calendar, Dumbbell, Activity,
  Users, Mail, Phone, Send,
} from 'lucide-react'
import { getMembers, getMemberById } from '../lib/api'
import type { Member } from '../types'
import StatusBadge from '../components/ui/StatusBadge'
import SkeletonCard from '../components/ui/SkeletonCard'
import { daysAgo, initials, cn } from '../lib/utils'

function useDebounce<T>(value: T, delay: number): T {
  const [deb, setDeb] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return deb
}

function engagementColor(score: number): string {
  if (score >= 70) return 'bg-cyan-DEFAULT'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

function lastVisitColor(days: number): string {
  if (days > 21) return 'text-red-400'
  if (days > 10) return 'text-amber-400'
  return 'text-cyan-DEFAULT'
}

function MemberCard({ member, onClick }: { member: Member; onClick: () => void }) {
  const days = member.lastVisit ? daysAgo(member.lastVisit) : 999
  const score = member.engagementScore

  return (
    <div
      onClick={onClick}
      className="card cursor-pointer overflow-hidden group transition-all duration-200 hover:-translate-y-1"
      style={{ '--hover-border': member.avatarColor } as CSSProperties}
    >
      <div className="h-1" style={{ backgroundColor: member.avatarColor }} />
      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-black flex-shrink-0"
            style={{ backgroundColor: member.avatarColor }}
          >
            {initials(member.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{member.name}</p>
            <StatusBadge status={member.membershipType} />
          </div>
        </div>

        {/* Engagement */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Engagement Score</span>
            <span className="text-white font-semibold">{score}</span>
          </div>
          <div className="h-1.5 bg-dark-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${engagementColor(score)}`}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Churn risk */}
        <StatusBadge status={member.churnRisk} size="md" />

        {/* Last visit */}
        <div className={`flex items-center gap-1.5 text-xs ${lastVisitColor(days)}`}>
          <Calendar size={12} />
          {days === 999 ? 'No visits yet' : `${days} days ago`}
        </div>

        {/* Bottom */}
        <div className="flex items-center justify-between pt-1 border-t border-dark-100">
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <Dumbbell size={11} />
            {member.favoriteClass ?? '—'}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <Activity size={11} />
            {member.totalVisits} visits
          </span>
        </div>
      </div>
    </div>
  )
}

function Heatmap({ member }: { member: Member }) {
  const visitDates = useMemo(
    () => new Set(member.visits?.map((v) => new Date(v.date).toDateString()) ?? []),
    [member.visits],
  )

  return (
    <div className="flex gap-1">
      {Array.from({ length: 12 }, (_, wk) => (
        <div key={wk} className="flex flex-col gap-1">
          {Array.from({ length: 7 }, (_, d) => {
            const date = new Date()
            date.setDate(date.getDate() - 83 + wk * 7 + d)
            const hasVisit = visitDates.has(date.toDateString())
            return (
              <div
                key={d}
                className="w-2.5 h-2.5 rounded-sm transition-all"
                style={{ backgroundColor: hasVisit ? member.avatarColor : '#161630' }}
                title={date.toLocaleDateString()}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

function MemberDetailPanel({ member, onClose }: { member: Member; onClose: () => void }) {
  const days = member.lastVisit ? daysAgo(member.lastVisit) : 999

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-dark-100">
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-black"
            style={{ backgroundColor: member.avatarColor }}
          >
            {initials(member.name)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{member.name}</h2>
            <StatusBadge status={member.membershipType} size="md" />
            <StatusBadge status={member.churnRisk} size="md" />
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-dark-200 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        {/* Contact */}
        <div className="flex flex-col gap-2">
          <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <Mail size={14} className="text-gray-600" />{member.email}
          </a>
          <span className="flex items-center gap-2 text-sm text-gray-400">
            <Phone size={14} className="text-gray-600" />{member.phone}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Visits', value: member.totalVisits },
            { label: 'Engagement', value: `${member.engagementScore}%` },
            { label: 'Member Since', value: new Date(member.joinDate).getFullYear().toString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-dark-200 rounded-xl p-3 text-center">
              <p className="text-base font-bold text-white">{value}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Churn indicator */}
        <div className={cn(
          'rounded-xl p-3 border text-sm',
          member.churnRisk === 'HIGH'   ? 'bg-red-500/10 border-red-500/30 text-red-300'   :
          member.churnRisk === 'MEDIUM' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                                          'bg-cyan-DEFAULT/10 border-cyan-DEFAULT/20 text-cyan-DEFAULT',
        )}>
          {member.churnRisk === 'HIGH'   ? `⚠️ High churn risk — last visit ${days} days ago. Immediate outreach recommended.` :
           member.churnRisk === 'MEDIUM' ? `🟡 Moderate risk — visited ${days} days ago. A gentle nudge could help.` :
                                           `✅ Healthy engagement — visited ${days} days ago. Keep the momentum going.`}
        </div>

        {/* Heatmap */}
        {member.visits && member.visits.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Attendance — Last 12 Weeks</p>
            <Heatmap member={member} />
          </div>
        )}

        {/* Recent visits */}
        {member.visits && member.visits.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Recent Visits</p>
            <div className="flex flex-col gap-2">
              {member.visits.slice(0, 5).map((v) => (
                <div key={v.id} className="flex items-center justify-between bg-dark-200 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-white">{v.classType}</p>
                    <p className="text-[10px] text-gray-600">{v.trainer}</p>
                  </div>
                  <p className="text-[10px] text-gray-600">
                    {new Date(v.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Send message */}
        <button className="flex items-center justify-center gap-2 w-full py-3 gradient-cyan text-black font-bold text-sm rounded-xl hover:glow-cyan transition-all mt-auto">
          <Send size={15} />
          Send Message
        </button>
      </div>
    </div>
  )
}

type Membership = 'ALL' | 'GOLD' | 'SILVER' | 'BASIC'
type Risk = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'

export default function Members() {
  const [search, setSearch] = useState('')
  const [membershipFilter, setMembershipFilter] = useState<Membership>('ALL')
  const [riskFilter, setRiskFilter] = useState<Risk>('ALL')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', debouncedSearch, membershipFilter, riskFilter],
    queryFn: () =>
      getMembers({
        search: debouncedSearch || undefined,
        membershipType: membershipFilter === 'ALL' ? undefined : membershipFilter,
        churnRisk: riskFilter === 'ALL' ? undefined : riskFilter,
      }).then((r) => r.data as Member[]),
  })

  const { data: selectedMember } = useQuery({
    queryKey: ['member', selectedId],
    queryFn: () => getMemberById(selectedId!).then((r) => r.data as Member),
    enabled: !!selectedId,
  })

  const chips = <T extends string>(
    values: T[],
    current: T,
    set: (v: T) => void,
    labels?: Record<T, string>,
  ) =>
    values.map((v) => (
      <button
        key={v}
        onClick={() => set(v)}
        className={cn(
          'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
          current === v
            ? 'bg-cyan-DEFAULT text-black'
            : 'bg-dark-200 text-gray-500 hover:text-white',
        )}
      >
        {labels ? labels[v] : v}
      </button>
    ))

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Members</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-dark-200 text-gray-400 text-xs font-medium">
            {members?.length ?? '—'}
          </span>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members…"
            className="pl-9 pr-4 py-2 rounded-xl bg-dark-300 border border-dark-100 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-DEFAULT/50 transition-colors w-64"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          {chips<Membership>(
            ['ALL', 'GOLD', 'SILVER', 'BASIC'],
            membershipFilter,
            setMembershipFilter,
          )}
        </div>
        <div className="w-px bg-dark-100" />
        <div className="flex items-center gap-2">
          {chips<Risk>(
            ['ALL', 'HIGH', 'MEDIUM', 'LOW'],
            riskFilter,
            setRiskFilter,
            { ALL: 'All Risk', HIGH: '🔴 High', MEDIUM: '🟡 Medium', LOW: '🟢 Low' } as Record<Risk, string>,
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} height="h-56" />)}
        </div>
      ) : members?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-dark-200 flex items-center justify-center">
            <Users size={24} className="text-gray-600" />
          </div>
          <p className="text-gray-600">No members match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <AnimatePresence>
            {members?.map((m, i) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.03 } }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <MemberCard member={m} onClick={() => setSelectedId(m.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {selectedId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setSelectedId(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-[420px] bg-dark-300 border-l border-dark-100 z-50 overflow-hidden flex flex-col"
            >
              {selectedMember ? (
                <MemberDetailPanel member={selectedMember} onClose={() => setSelectedId(null)} />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-cyan-DEFAULT/30 border-t-cyan-DEFAULT rounded-full animate-spin" />
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
