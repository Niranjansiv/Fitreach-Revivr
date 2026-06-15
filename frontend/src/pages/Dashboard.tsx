import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Bot, Send, Users, AlertTriangle, TrendingUp, Crown,
  Heart, MessageSquare, BarChart2, Wand2,
} from 'lucide-react'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import SkeletonCard from '../components/ui/SkeletonCard'
import { getDashboardStats, getCampaigns, getMembers, sendAIChat } from '../lib/api'
import type { DashboardStats, Campaign, Member } from '../types'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  { label: 'Who are my highest churn risk members?',            icon: AlertTriangle },
  { label: 'Draft a win-back message for inactive members',     icon: Wand2 },
  { label: "What's my current member engagement rate?",        icon: BarChart2 },
  { label: 'Segment gold members who haven\'t visited in 30 days', icon: Crown },
]

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-cyan-DEFAULT"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => getDashboardStats().then((r) => r.data as DashboardStats),
  })
  const { data: members } = useQuery({
    queryKey: ['members-all'],
    queryFn: () => getMembers().then((r) => r.data as Member[]),
  })
  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => getCampaigns().then((r) => r.data as Campaign[]),
  })

  const riskCounts = useMemo(
    () => ({
      HIGH:   members?.filter((m) => m.churnRisk === 'HIGH').length   ?? 0,
      MEDIUM: members?.filter((m) => m.churnRisk === 'MEDIUM').length ?? 0,
      LOW:    members?.filter((m) => m.churnRisk === 'LOW').length    ?? 0,
    }),
    [members],
  )
  const total = Math.max(riskCounts.HIGH + riskCounts.MEDIUM + riskCounts.LOW, 1)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }))
      const res = await sendAIChat(trimmed, history)
      const reply = (res.data?.message ?? res.data?.response ?? '') as string
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: reply },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please check that the backend server is running.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const metrics = [
    { icon: Users,         label: 'Total Members',  value: stats?.totalMembers  ?? 0, suffix: '',  color: 'text-blue-400',    bar: 'from-blue-500 to-blue-400' },
    { icon: AlertTriangle, label: 'At Risk',         value: stats?.atRisk        ?? 0, suffix: '',  color: 'text-red-400',     bar: 'from-red-500 to-red-400',  pulse: true },
    { icon: TrendingUp,    label: 'Avg Engagement',  value: stats?.avgEngagement ?? 0, suffix: '%', color: 'text-cyan-DEFAULT', bar: 'from-cyan-DEFAULT to-cyan-dark' },
    { icon: Crown,         label: 'Gold Members',    value: stats?.goldMembers   ?? 0, suffix: '',  color: 'text-amber-400',   bar: 'from-amber-500 to-amber-400' },
  ]

  const riskRows = [
    { key: 'HIGH',   label: 'High Risk',   bar: 'bg-red-500',       dot: 'bg-red-400',       badge: 'bg-red-500/15 text-red-400',            sub: 'Immediate action needed', subColor: 'text-red-400',        anim: true },
    { key: 'MEDIUM', label: 'Medium Risk', bar: 'bg-amber-500',     dot: 'bg-amber-400',     badge: 'bg-amber-500/15 text-amber-400',         sub: 'Monitor closely',         subColor: 'text-amber-400',      anim: false },
    { key: 'LOW',    label: 'Healthy',     bar: 'bg-green-400',     dot: 'bg-green-400',     badge: 'bg-green-400/15 text-green-400',        sub: 'Great retention',         subColor: 'text-green-400',      anim: true },
  ] as const

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">

      {/* ── Left: AI Chat ── */}
      <div className="flex-[3] flex flex-col bg-dark-400 rounded-2xl border border-dark-100 overflow-hidden min-w-0">

        {/* Chat header */}
        <div className="px-5 py-4 border-b border-dark-100 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-violet-DEFAULT/15 flex items-center justify-center">
            <Bot size={18} className="text-violet-DEFAULT" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">AI Assistant</p>
            <p className="text-[11px] text-gray-500">Powered by Claude</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-DEFAULT animate-pulse" />
            <span className="text-xs text-cyan-DEFAULT font-medium">Ready</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-DEFAULT/20 to-cyan-DEFAULT/20 border border-violet-DEFAULT/20 flex items-center justify-center">
                <Bot size={28} className="text-violet-DEFAULT" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white mb-1">How can I help?</p>
                <p className="text-sm text-gray-500">
                  Ask me anything about your members, campaigns, or churn risk.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTIONS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => handleSend(label)}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-dark-300 border border-dark-100 hover:border-cyan-DEFAULT/30 hover:bg-cyan-DEFAULT/5 text-left transition-all duration-150 group"
                  >
                    <Icon size={14} className="text-cyan-DEFAULT mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors leading-relaxed">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-violet-DEFAULT/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot size={13} className="text-violet-DEFAULT" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-cyan-DEFAULT/10 text-white border border-cyan-DEFAULT/20 rounded-tr-sm'
                          : 'bg-dark-300 text-gray-200 border border-dark-100 rounded-tl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-DEFAULT/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={13} className="text-violet-DEFAULT" />
                  </div>
                  <div className="bg-dark-300 border border-dark-100 rounded-2xl rounded-tl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-5 py-4 border-t border-dark-100 flex-shrink-0">
          <div className="flex items-end gap-3 bg-dark-300 rounded-xl border border-dark-100 focus-within:border-cyan-DEFAULT/40 transition-colors px-4 py-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about members, campaigns, churn risk…"
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 resize-none outline-none leading-relaxed"
              style={{ maxHeight: 120 }}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 flex-shrink-0 disabled:opacity-40"
            >
              <Send size={15} className={input.trim() && !isLoading ? 'text-cyan-DEFAULT' : 'text-gray-600'} />
            </button>
          </div>
          <p className="text-[10px] text-gray-700 mt-2 text-center">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* ── Right: Stats Panel ── */}
      <div className="flex-[2] flex flex-col gap-4 overflow-y-auto min-w-0">

        {/* 2×2 metric cards */}
        <div className="grid grid-cols-2 gap-3">
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} height="h-24" lines={1} />)
            : metrics.map(({ icon: Icon, label, value, suffix, color, bar, pulse }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={15} className={color} />
                    {pulse && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
                  </div>
                  <p className="text-2xl font-bold text-white leading-none">
                    <AnimatedNumber value={value} />{suffix}
                  </p>
                  <p className="text-[11px] text-gray-600 mt-1">{label}</p>
                  <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${bar}`} />
                </motion.div>
              ))}
        </div>

        {/* Member Health */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Heart size={14} className="text-red-400" />
            <span className="text-sm font-semibold text-white">Member Health</span>
          </div>
          <div className="flex flex-col gap-4">
            {riskRows.map(({ key, label, bar, dot, badge, sub, subColor, anim }) => {
              const count = riskCounts[key as keyof typeof riskCounts]
              const pct = Math.round((count / total) * 100)
              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${anim ? 'animate-pulse' : ''}`} />
                      <span className="text-sm text-gray-300">{label}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge}`}>{count}</span>
                  </div>
                  <div className="h-1.5 bg-dark-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                  <p className={`text-[11px] ${subColor}`}>{sub}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-violet-DEFAULT" />
            <span className="text-sm font-semibold text-white">Recent Campaigns</span>
          </div>
          {!campaigns || campaigns.length === 0 ? (
            <p className="text-sm text-gray-600 py-2">No campaigns yet</p>
          ) : (
            <div className="flex flex-col gap-0">
              {campaigns.slice(0, 5).map((c: Campaign) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 py-2.5 border-b border-dark-100 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{c.name}</p>
                    <p className="text-[11px] text-gray-600">
                      {c.channel} · {c.totalSent ?? 0} sent
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      c.status === 'COMPLETED'
                        ? 'bg-cyan-DEFAULT/10 text-cyan-DEFAULT'
                        : c.status === 'DRAFT'
                        ? 'bg-gray-500/10 text-gray-500'
                        : 'bg-violet-DEFAULT/10 text-violet-DEFAULT'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
