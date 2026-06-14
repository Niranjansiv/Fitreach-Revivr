import { MessageCircle, MessageSquare, Mail, Bell } from 'lucide-react'

interface Props {
  channel: string
  size?: number
  showLabel?: boolean
}

const CHANNEL = {
  WHATSAPP: { icon: MessageCircle, color: 'text-cyan-DEFAULT', bg: 'bg-cyan-DEFAULT/15', label: 'WhatsApp' },
  SMS:      { icon: MessageSquare, color: 'text-blue-400',       bg: 'bg-blue-400/15',       label: 'SMS' },
  EMAIL:    { icon: Mail,          color: 'text-violet-DEFAULT', bg: 'bg-violet-DEFAULT/15', label: 'Email' },
  PUSH:     { icon: Bell,          color: 'text-amber-400',      bg: 'bg-amber-400/15',      label: 'Push' },
}

export default function ChannelIcon({ channel, size = 16, showLabel = false }: Props) {
  const cfg = CHANNEL[channel as keyof typeof CHANNEL] ?? CHANNEL.EMAIL
  const Icon = cfg.icon

  if (showLabel) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.color}`}>
        <Icon size={size} />
        {cfg.label}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${cfg.bg}`}>
      <Icon size={size} className={cfg.color} />
    </span>
  )
}
