import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, X, ChevronRight, Rocket, Sparkles,
  Check, Megaphone, Users,
} from 'lucide-react'
import { getCampaigns, getSegments, createCampaign, launchCampaign, getCampaignById, draftMessage } from '../lib/api'
import type { Campaign, Segment, CommunicationLog } from '../types'
import StatusBadge from '../components/ui/StatusBadge'
import ChannelIcon from '../components/ui/ChannelIcon'
import SkeletonCard from '../components/ui/SkeletonCard'
import { timeAgo, cn } from '../lib/utils'

// ─── Funnel ────────────────────────────────────────────────────────────────
  function FunnelBar({
  label, value, total, color,
}: { label: string; value: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((value / total) * 100))
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs text-gray-500 text-right">{label}</span>
      <div className="flex-1 h-2 bg-dark-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-semibold text-white w-10 text-right">{value}</span>
      <span className="text-xs text-gray-600 w-8">{pct}%</span>
    </div>
  )
}

const FUNNEL_STEPS: Array<{ key: keyof Campaign; label: string; color: string }> = [
  { key: 'totalSent',      label: 'Sent',       color: '#3b82f6' },
  { key: 'totalDelivered', label: 'Delivered',  color: '#00d4ff' },
  { key: 'totalOpened',    label: 'Opened',     color: '#8b5cf6' },
  { key: 'totalClicked',   label: 'Clicked',    color: '#f59e0b' },
  { key: 'totalConverted', label: 'Converted',  color: '#0ea5e9' },
  { key: 'totalFailed',    label: 'Failed',     color: '#ef4444' },
]

// ─── Campaign Card ──────────────────────────────────────────────────────────
function CampaignCard({ campaign, onClick }: { campaign: Campaign; onClick: () => void }) {
  const deliveryRate = campaign.totalSent === 0 ? 0 : Math.round((campaign.totalDelivered / campaign.totalSent) * 100)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -3 }}
      className="card p-5 flex flex-col gap-4 cursor-pointer hover:border-cyan-DEFAULT/30 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{campaign.name}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <ChannelIcon channel={campaign.channel} size={13} showLabel />
            <StatusBadge status={campaign.status} />
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-600 mt-0.5 flex-shrink-0" />
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{campaign.message}</p>

      {campaign.totalSent > 0 && (
        <div className="flex flex-col gap-2">
          {FUNNEL_STEPS.slice(0, 3).map(({ key, label, color }) => (
            <FunnelBar key={key} label={label} value={campaign[key] as number} total={campaign.totalSent} color={color} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-dark-100">
        <span className="text-xs text-gray-600">{timeAgo(new Date(campaign.createdAt))}</span>
        {campaign.totalSent > 0 && (
          <span className="text-xs font-semibold text-cyan-DEFAULT">{deliveryRate}% delivery</span>
        )}
        {campaign.status === 'DRAFT' && (
          <span className="text-xs text-amber-400">Draft — not launched</span>
        )}
      </div>
    </motion.div>
  )
}

// ─── Campaign Detail Modal ──────────────────────────────────────────────────
function CampaignDetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => getCampaignById(id).then((r) => r.data as Campaign),
  })

  const launch = useMutation({
    mutationFn: () => launchCampaign(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      void queryClient.invalidateQueries({ queryKey: ['campaign', id] })
    },
  })

  if (isLoading || !campaign) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-DEFAULT/30 border-t-cyan-DEFAULT rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between p-6 border-b border-dark-100">
        <div>
          <h2 className="text-lg font-bold text-white">{campaign.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <ChannelIcon channel={campaign.channel} size={13} showLabel />
            <StatusBadge status={campaign.status} />
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-xl bg-dark-200 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Message */}
        <div className="bg-dark-200 rounded-xl p-4 border-l-[3px] border-violet-DEFAULT">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">Message</p>
          <p className="text-sm text-gray-200 leading-7">{campaign.message}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Sent', value: campaign.totalSent, color: 'text-blue-400' },
            { label: 'Delivered', value: campaign.totalDelivered, color: 'text-cyan-DEFAULT' },
            { label: 'Opened', value: campaign.totalOpened, color: 'text-violet-DEFAULT' },
            { label: 'Clicked', value: campaign.totalClicked, color: 'text-amber-400' },
            { label: 'Converted', value: campaign.totalConverted, color: 'text-cyan-DEFAULT' },
            { label: 'Failed', value: campaign.totalFailed, color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-dark-200 rounded-xl p-3 text-center">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Funnel */}
        {campaign.totalSent > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Delivery Funnel</p>
            {FUNNEL_STEPS.map(({ key, label, color }) => (
              <FunnelBar key={key} label={label} value={campaign[key] as number} total={campaign.totalSent} color={color} />
            ))}
          </div>
        )}

        {/* Member logs */}
        {campaign.logs && campaign.logs.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Member Activity</p>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {campaign.logs.slice(0, 20).map((log: CommunicationLog) => (
                <div key={log.id} className="flex items-center justify-between bg-dark-200 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-violet-DEFAULT/20 flex items-center justify-center text-[9px] font-bold text-violet-DEFAULT">
                      {log.member?.name?.slice(0, 2).toUpperCase() ?? '??'}
                    </div>
                    <span className="text-xs text-white">{log.member?.name ?? 'Unknown'}</span>
                  </div>
                  <StatusBadge status={log.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Launch button */}
        {campaign.status === 'DRAFT' && (
          <button
            onClick={() => launch.mutate()}
            disabled={launch.isPending}
            className="flex items-center justify-center gap-2 w-full py-3 gradient-cyan glow-cyan text-black font-bold text-sm rounded-xl disabled:opacity-60 transition-all"
          >
            {launch.isPending ? (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Rocket size={15} />
            )}
            {launch.isPending ? 'Launching…' : 'Launch Campaign'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── New Campaign Modal (4 steps) ──────────────────────────────────────────
const CHANNELS = ['WHATSAPP', 'SMS', 'EMAIL', 'PUSH'] as const
const TONES = ['Motivational', 'Friendly', 'Urgent', 'Professional', 'Casual']

const STEP_LABELS = ['Segment', 'Channel', 'Message', 'Review']

function NewCampaignModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)
  const [channel, setChannel] = useState<typeof CHANNELS[number]>('WHATSAPP')
  const [message, setMessage] = useState('')
  const [tone, setTone] = useState(TONES[0])
  const [isDrafting, setIsDrafting] = useState(false)

  const { data: segments, isLoading: segsLoading } = useQuery({
    queryKey: ['segments'],
    queryFn: () => getSegments().then((r) => r.data as Segment[]),
  })

  const create = useMutation({
    mutationFn: () =>
      createCampaign({ name, segmentId: selectedSegment!.id, message, channel }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      onClose()
    },
  })

  const handleDraft = async () => {
    if (!selectedSegment) return
    setIsDrafting(true)
    try {
      const res = await draftMessage({
        segmentName: selectedSegment.name,
        channel,
        tone,
        memberCount: selectedSegment.memberCount,
      })
      setMessage(res.data.message as string)
    } finally {
      setIsDrafting(false)
    }
  }

  const canNext = [
    !!name.trim() && !!selectedSegment,
    true,
    !!message.trim(),
    true,
  ][step]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-dark-300 border border-dark-100 rounded-2xl w-full max-w-lg flex flex-col"
        style={{ maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-dark-100">
          <h3 className="text-base font-bold text-white">New Campaign</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-xl bg-dark-200 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-0 px-6 py-3 border-b border-dark-100">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className={cn(
                'flex items-center gap-1.5 text-xs font-medium',
                i < step ? 'text-cyan-DEFAULT' : i === step ? 'text-white' : 'text-gray-600',
              )}>
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                  i < step ? 'bg-cyan-DEFAULT text-black' :
                  i === step ? 'bg-violet-DEFAULT text-white' :
                  'bg-dark-200 text-gray-600',
                )}>
                  {i < step ? <Check size={10} /> : i + 1}
                </div>
                {label}
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-cyan-DEFAULT' : 'bg-dark-100'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 block">Campaign Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. July Re-engagement"
                    className="w-full px-4 py-2.5 bg-dark-200 border border-dark-100 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-DEFAULT/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 block">Select Segment</label>
                  {segsLoading ? (
                    <div className="flex flex-col gap-2">
                      {[1, 2, 3].map((i) => <SkeletonCard key={i} height="h-14" lines={1} />)}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {segments?.map((seg) => (
                        <button
                          key={seg.id}
                          onClick={() => setSelectedSegment(seg)}
                          className={cn(
                            'flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all',
                            selectedSegment?.id === seg.id
                              ? 'border-cyan-DEFAULT bg-cyan-DEFAULT/5 text-white'
                              : 'border-dark-100 bg-dark-200 text-gray-400 hover:text-white hover:border-dark-50',
                          )}
                        >
                          <div>
                            <p className="text-sm font-medium">{seg.name}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{seg.description}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0 ml-3">
                            <Users size={12} />
                            {seg.memberCount}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-3">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    className={cn(
                      'flex flex-col items-center gap-3 p-5 rounded-xl border transition-all',
                      channel === ch
                        ? 'border-cyan-DEFAULT bg-cyan-DEFAULT/5'
                        : 'border-dark-100 bg-dark-200 hover:border-dark-50',
                    )}
                  >
                    <ChannelIcon channel={ch} size={22} />
                    <span className={cn('text-sm font-medium', channel === ch ? 'text-white' : 'text-gray-500')}>
                      {ch}
                    </span>
                    {channel === ch && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-DEFAULT text-black font-bold">
                        Selected
                      </span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">Tone:</span>
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                        tone === t
                          ? 'border-violet-DEFAULT bg-violet-DEFAULT/15 text-violet-DEFAULT'
                          : 'border-dark-100 bg-dark-200 text-gray-500 hover:text-white',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => void handleDraft()}
                  disabled={isDrafting}
                  className="flex items-center justify-center gap-2 py-2.5 border border-violet-DEFAULT/40 rounded-xl text-violet-DEFAULT text-sm font-medium hover:bg-violet-DEFAULT/10 disabled:opacity-60 transition-all"
                >
                  {isDrafting ? (
                    <span className="w-4 h-4 border-2 border-violet-DEFAULT/30 border-t-violet-DEFAULT rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  {isDrafting ? 'Drafting with AI…' : 'Draft with AI'}
                </button>
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 block">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    placeholder="Write your message or use AI draft above…"
                    className="w-full px-4 py-3 bg-dark-200 border border-dark-100 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-DEFAULT/50 resize-none transition-colors"
                  />
                  <p className="text-xs text-gray-600 mt-1 text-right">{message.length} chars</p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                <div className="bg-dark-200 rounded-xl p-4 flex flex-col gap-3">
                  <Row label="Name" value={name} />
                  <Row label="Segment" value={`${selectedSegment?.name ?? ''} (${selectedSegment?.memberCount} members)`} />
                  <Row label="Channel" value={channel} />
                  <Row label="Tone" value={tone} />
                </div>
                <div className="bg-dark-200 rounded-xl p-4 border-l-[3px] border-violet-DEFAULT">
                  <p className="text-xs text-gray-500 mb-2">Message preview</p>
                  <p className="text-sm text-gray-200 leading-7">{message}</p>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-sm">⚡</span>
                  <p className="text-xs text-amber-300">Campaign will be created as a draft. Launch it from the detail view.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-dark-100">
          <button
            onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
            className="px-5 py-2 rounded-xl border border-dark-100 text-gray-400 hover:text-white text-sm transition-colors"
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="px-6 py-2 gradient-cyan text-black text-sm font-bold rounded-xl disabled:opacity-40 transition-all"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => create.mutate()}
              disabled={create.isPending}
              className="flex items-center gap-2 px-6 py-2 gradient-cyan glow-cyan text-black text-sm font-bold rounded-xl disabled:opacity-60 transition-all"
            >
              {create.isPending ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <Check size={15} />
              )}
              Create Campaign
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-600 w-20 flex-shrink-0">{label}</span>
      <span className="text-xs text-white text-right">{value}</span>
    </div>
  )
}

// ─── AI Insight card ────────────────────────────────────────────────────────
function AIInsightCard({ campaigns }: { campaigns: Campaign[] }) {
  const completed = campaigns.filter((c) => c.status === 'COMPLETED')
  const bestChannel = (() => {
    const rates: Record<string, number[]> = {}
    completed.forEach((c) => {
      if (!rates[c.channel]) rates[c.channel] = []
      if (c.totalSent > 0) rates[c.channel].push(c.totalDelivered / c.totalSent)
    })
    const best = Object.entries(rates).sort(
      ([, a], [, b]) => (b.reduce((s, v) => s + v, 0) / b.length) - (a.reduce((s, v) => s + v, 0) / a.length),
    )[0]
    return best ? best[0] : null
  })()

  return (
    <div className="card p-4 border-l-[3px] border-violet-DEFAULT flex items-start gap-3">
      <Sparkles size={16} className="text-violet-DEFAULT mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-semibold text-white mb-1">AI Insight</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          {campaigns.length === 0
            ? 'Create your first campaign to get AI-powered insights on performance and audience targeting.'
            : bestChannel
            ? `Your best-performing channel is ${bestChannel}. Consider prioritising it for high-value segments to maximise delivery rates.`
            : 'Launch campaigns and AI will analyse performance patterns to recommend optimisations.'}
        </p>
      </div>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function Campaigns() {
  const [showNew, setShowNew] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'RUNNING' | 'COMPLETED'>('ALL')

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => getCampaigns().then((r) => r.data as Campaign[]),
    refetchInterval: 3000,
  })

  const filtered = campaigns?.filter((c) => filter === 'ALL' || c.status === filter) ?? []

  const filterLabels = {
    ALL: `All (${campaigns?.length ?? 0})`,
    DRAFT: 'Draft',
    RUNNING: 'Running',
    COMPLETED: 'Completed',
  } as const

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Campaigns</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-dark-200 text-gray-400 text-xs font-medium">
            {campaigns?.length ?? '—'}
          </span>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 gradient-cyan glow-cyan text-black text-sm font-bold rounded-xl hover:-translate-y-0.5 transition-all"
        >
          <Plus size={15} />
          New Campaign
        </button>
      </div>

      {/* AI Insight */}
      {campaigns && <AIInsightCard campaigns={campaigns} />}

      {/* Filter chips */}
      <div className="flex gap-2">
        {(['ALL', 'DRAFT', 'RUNNING', 'COMPLETED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              filter === f ? 'bg-cyan-DEFAULT text-black' : 'bg-dark-200 text-gray-500 hover:text-white',
            )}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} height="h-56" lines={4} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-dark-200 flex items-center justify-center">
            <Megaphone size={28} className="text-gray-600" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold mb-1">No campaigns yet</p>
            <p className="text-sm text-gray-600">Create your first campaign to start reaching members</p>
          </div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-5 py-2.5 gradient-cyan text-black text-sm font-bold rounded-xl">
            <Plus size={14} />
            Create Campaign
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((c) => (
              <CampaignCard key={c.id} campaign={c} onClick={() => setDetailId(c.id)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {detailId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40" onClick={() => setDetailId(null)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-[440px] bg-dark-300 border-l border-dark-100 z-50 overflow-hidden flex flex-col"
            >
              <CampaignDetailModal id={detailId} onClose={() => setDetailId(null)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* New campaign modal */}
      <AnimatePresence>
        {showNew && (
          <NewCampaignModal onClose={() => setShowNew(false)} />
        )}
      </AnimatePresence>

    </div>
  )
}
