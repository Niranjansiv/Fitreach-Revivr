import { useState, useEffect, useRef } from 'react'
import type { KeyboardEvent, ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, ArrowUp, Sparkles, Users, MessageSquare, Rocket, Lightbulb } from 'lucide-react'
import { sendAIChat, buildAISegment, draftMessage } from '../lib/api'
import ChannelIcon from '../components/ui/ChannelIcon'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isNew?: boolean
}

interface SegmentPreview {
  filters: { churnRisk: string | null; membershipType: string | null }
  insight: string
}

interface MessagePreview {
  message: string
  channel: string
  tone: string
}

type RightPanel = 'default' | 'segment' | 'message'

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-7 h-7 rounded-xl bg-violet-DEFAULT/20 flex items-center justify-center flex-shrink-0">
        <Bot size={14} className="text-violet-DEFAULT" />
      </div>
      <div className="bg-dark-200 border-l-2 border-violet-DEFAULT rounded-2xl rounded-tl-none px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 0.15, 0.3].map((delay) => (
            <motion.span
              key={delay}
              className="w-2 h-2 rounded-full bg-cyan-DEFAULT"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, delay, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function AIBubble({ msg, isLatest }: { msg: ChatMessage; isLatest: boolean }) {
  const [visible, setVisible] = useState(isLatest && msg.isNew ? 0 : msg.content.length)

  useEffect(() => {
    if (!isLatest || !msg.isNew) return
    setVisible(0)
    let i = 0
    const t = setInterval(() => {
      i += 2
      setVisible(i)
      if (i >= msg.content.length) clearInterval(t)
    }, 8)
    return () => clearInterval(t)
  }, [msg.content, msg.id, isLatest, msg.isNew])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 mb-4"
    >
      <div className="w-7 h-7 rounded-xl bg-violet-DEFAULT/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot size={14} className="text-violet-DEFAULT" />
      </div>
      <div className="max-w-[80%]">
        <div className="bg-dark-200 border-l-[3px] border-violet-DEFAULT rounded-2xl rounded-tl-none px-4 py-3">
          <p className="text-sm text-gray-200 leading-7 whitespace-pre-wrap">
            {msg.content.slice(0, visible)}
            {visible < msg.content.length && <span className="animate-pulse text-cyan-DEFAULT">|</span>}
          </p>
        </div>
        <p className="text-[10px] text-gray-700 mt-1 ml-1">
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  )
}

// User Bubble
function UserBubble({ msg }: { msg: ChatMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-end mb-4"
    >
      <div className="max-w-[80%]">
        <div className="bg-violet-DEFAULT/20 border border-violet-DEFAULT/30 rounded-2xl rounded-tr-none px-4 py-3">
          <p className="text-sm text-white leading-6">{msg.content}</p>
        </div>
        <p className="text-[10px] text-gray-700 mt-1 text-right mr-1">
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  )
}

const CHIPS = [
  '👥 Who\'s at risk?',
  '🔄 Re-engage lapsed members',
  '📊 How are campaigns doing?',
  '💪 Draft a motivational message',
  '🎯 Best time to send campaigns?',
]

const SUGGESTIONS = [
  { icon: '🔴', text: 'Who\'s at high churn risk?' },
  { icon: '✍️', text: 'Draft a re-engagement campaign' },
  { icon: '📊', text: 'Which channel performs best?' },
  { icon: '👑', text: 'Show me inactive gold members' },
  { icon: '⏰', text: 'Best send time for my members' },
  { icon: '📋', text: 'Summarize last campaigns' },
]

function DefaultRight() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center p-8">
      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
        <Sparkles size={40} className="text-cyan-DEFAULT" />
      </motion.div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Action Preview</h3>
        <p className="text-sm text-gray-600">AI responses and actions will appear here</p>
      </div>
      <div className="flex flex-col gap-3 w-full">
        {[
          { icon: '🎯', title: 'Smart Segments', desc: 'AI builds audience from natural language' },
          { icon: '✍️', title: 'Message Drafts', desc: 'Personalized messages for your segment' },
          { icon: '🚀', title: 'One-Click Launch', desc: 'Send campaigns directly from chat' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3 bg-dark-200 rounded-xl p-3 text-left">
            <span className="text-xl">{icon}</span>
            <div>
              <p className="text-xs font-semibold text-white">{title}</p>
              <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SegmentRight({ data, memberCount }: { data: SegmentPreview; memberCount: number }) {
  const COLORS = ['#00d4ff', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6']
  return (
    <div className="p-5">
      <div className="card border-t-2 border-cyan-DEFAULT p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-cyan-DEFAULT" />
          <span className="text-sm font-semibold text-white">Segment Preview</span>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-cyan-DEFAULT">{memberCount}</p>
          <p className="text-xs text-gray-500 mt-1">Members matched</p>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{data.insight}</p>
        <div className="flex -space-x-2">
          {COLORS.map((c, i) => (
            <div key={i} className="w-7 h-7 rounded-full border-2 border-dark-300 flex items-center justify-center text-[9px] font-bold text-black" style={{ backgroundColor: c }}>
              {String.fromCharCode(65 + i)}
            </div>
          ))}
          {memberCount > 5 && (
            <div className="w-7 h-7 rounded-full border-2 border-dark-300 bg-dark-200 flex items-center justify-center text-[9px] text-gray-400">
              +{memberCount - 5}
            </div>
          )}
        </div>
        <button className="w-full py-2.5 gradient-cyan text-black text-sm font-bold rounded-xl hover:glow-cyan transition-all">
          Create Segment
        </button>
        <button className="w-full py-2.5 border border-dark-50 text-gray-400 hover:text-white text-sm rounded-xl transition-colors">
          Refine with AI
        </button>
      </div>
    </div>
  )
}

function MessageRight({ data }: { data: MessagePreview }) {
  return (
    <div className="p-5">
      <div className="card border-t-2 border-violet-DEFAULT p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-violet-DEFAULT" />
          <ChannelIcon channel={data.channel} size={14} showLabel />
        </div>
        <div className="bg-dark-200 rounded-xl p-4 relative">
          <div className="absolute -top-1.5 left-4 w-3 h-3 bg-dark-200 rotate-45" />
          <p className="text-sm text-gray-200 leading-7">{data.message}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Tone:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-violet-DEFAULT/15 text-violet-DEFAULT text-xs font-medium">
            {data.tone}
          </span>
        </div>
        <button className="w-full py-2.5 gradient-cyan glow-cyan text-black text-sm font-bold rounded-xl">
          <Rocket size={14} className="inline mr-1.5" />
          Launch Campaign
        </button>
        <button className="w-full py-2.5 border border-dark-50 text-gray-400 hover:text-white text-sm rounded-xl transition-colors">
          Edit Message
        </button>
      </div>
    </div>
  )
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rightPanel, setRightPanel] = useState<RightPanel>('default')
  const [segmentData, setSegmentData] = useState<SegmentPreview | null>(null)
  const [messageData, setMessageData] = useState<MessagePreview | null>(null)
  const [segmentMemberCount, setSegmentMemberCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    const history = messages.map((m) => ({ role: m.role, content: m.content }))
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setIsLoading(true)

    try {
      const res = await sendAIChat(trimmed, history)
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.response as string,
        timestamp: new Date(),
        isNew: true,
      }
      setMessages((prev) => [...prev, aiMsg])

      const isSegmentIntent = /\b(who|which|find|list|show|risk|churn|segment|members|inactive|lapsed)\b/i.test(trimmed)
      const isDraftIntent = /\b(draft|write|create|compose|message|campaign|re.?engage)\b/i.test(trimmed)

      if (isSegmentIntent) {
        const segRes = await buildAISegment(trimmed)
        const data = segRes.data as SegmentPreview
        setSegmentData(data)
        setSegmentMemberCount(Math.floor(Math.random() * 20) + 5)
        setRightPanel('segment')
      } else if (isDraftIntent) {
        const draftRes = await draftMessage({
          segmentName: 'Target Segment',
          channel: 'WHATSAPP',
          tone: 'Motivational',
          memberCount: 18,
        })
        setMessageData({ message: draftRes.data.message as string, channel: 'WHATSAPP', tone: 'Motivational' })
        setRightPanel('message')
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm having trouble connecting right now. Make sure the backend is running and try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend(input)
    }
  }

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem-3rem)] rounded-2xl overflow-hidden border border-dark-100 -m-6">
      {/* ── Left: Chat ── */}
      <div className="flex flex-col w-[58%] bg-dark-400 border-r border-dark-100">
        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-DEFAULT/20 flex items-center justify-center">
              <Bot size={18} className="text-violet-DEFAULT" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AI Assistant</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-DEFAULT/15 text-violet-DEFAULT font-medium">
                Powered by Claude Opus 4.8
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-DEFAULT">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-DEFAULT animate-pulse" />
            Ready
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center gap-6 pt-8">
              <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 3, repeat: Infinity }}>
                <div className="w-16 h-16 rounded-2xl bg-violet-DEFAULT/20 flex items-center justify-center">
                  <Bot size={32} className="text-violet-DEFAULT" />
                </div>
              </motion.div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-DEFAULT to-violet-DEFAULT bg-clip-text text-transparent">
                  Hello! I'm your FitReach AI
                </h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Ask me about your members, campaigns,<br />or what to do next.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                {SUGGESTIONS.map(({ icon, text }) => (
                  <button
                    key={text}
                    onClick={() => void handleSend(text)}
                    className="flex items-start gap-2 p-3 rounded-xl bg-dark-300 border border-dark-100 hover:border-cyan-DEFAULT/40 hover:bg-cyan-DEFAULT/5 text-left transition-all group"
                  >
                    <span className="text-base">{icon}</span>
                    <span className="text-xs text-gray-500 group-hover:text-gray-300 leading-relaxed transition-colors">{text}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((m, i) =>
                m.role === 'assistant' ? (
                  <AIBubble key={m.id} msg={m} isLatest={i === messages.length - 1} />
                ) : (
                  <UserBubble key={m.id} msg={m} />
                ),
              )}
            </AnimatePresence>
          )}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick chips */}
        <div className="px-5 py-2 border-t border-dark-100/50 flex gap-2 overflow-x-auto">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => void handleSend(chip.replace(/^[^\s]+\s/, ''))}
              className="flex-shrink-0 px-3 py-1.5 rounded-full border border-dark-100 bg-dark-300 text-gray-500 text-xs hover:border-cyan-DEFAULT/50 hover:text-cyan-DEFAULT transition-all"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-dark-100 bg-dark-400">
          <div className={`flex items-end gap-3 bg-dark-300 rounded-2xl border transition-colors px-4 py-3 ${input ? 'border-cyan-DEFAULT/40' : 'border-dark-100'}`}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything…"
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 resize-none focus:outline-none"
              style={{ maxHeight: 96 }}
            />
            <button
              onClick={() => void handleSend(input)}
              disabled={!input.trim() || isLoading}
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 ${
                input.trim() && !isLoading
                  ? 'bg-cyan-DEFAULT text-black hover:bg-cyan-dark'
                  : 'bg-dark-200 text-gray-700 cursor-not-allowed'
              }`}
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: Action panel ── */}
      <div className="flex-1 bg-dark-300 overflow-y-auto">
        <AnimatePresence mode="wait">
          {rightPanel === 'segment' && segmentData ? (
            <motion.div key="segment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SegmentRight data={segmentData} memberCount={segmentMemberCount} />
            </motion.div>
          ) : rightPanel === 'message' && messageData ? (
            <motion.div key="message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MessageRight data={messageData} />
            </motion.div>
          ) : (
            <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <DefaultRight />
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI insights bottom hint */}
        {rightPanel !== 'default' && (
          <div className="p-5 border-t border-dark-100">
            <div className="flex items-start gap-2 p-3 rounded-xl border border-violet-DEFAULT/20 bg-violet-DEFAULT/5">
              <Lightbulb size={14} className="text-violet-DEFAULT mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">
                Continue the conversation to refine this result or ask the AI to adjust parameters.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
