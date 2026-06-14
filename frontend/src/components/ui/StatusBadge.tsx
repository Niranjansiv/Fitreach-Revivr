interface Props {
  status: string
  size?: 'sm' | 'md'
}

const CONFIG: Record<string, { bg: string; text: string; dot?: string; label?: string }> = {
  DELIVERED:  { bg: 'bg-blue-500/15',   text: 'text-blue-400',  dot: 'bg-blue-400' },
  OPENED:     { bg: 'bg-amber-500/15',  text: 'text-amber-400', dot: 'bg-amber-400' },
  CLICKED:    { bg: 'bg-violet-500/15', text: 'text-violet-400', dot: 'bg-violet-400' },
  CONVERTED:  { bg: 'bg-cyan-DEFAULT/15', text: 'text-cyan-DEFAULT', dot: 'bg-cyan-DEFAULT' },
  FAILED:     { bg: 'bg-red-500/15',   text: 'text-red-400',   dot: 'bg-red-400' },
  SENT:       { bg: 'bg-dark-50/60',   text: 'text-gray-400',  dot: 'bg-gray-500' },
  RUNNING:    { bg: 'bg-cyan-DEFAULT/15', text: 'text-cyan-DEFAULT', dot: 'bg-cyan-DEFAULT' },
  COMPLETED:  { bg: 'bg-dark-50/60',   text: 'text-gray-400',  dot: 'bg-gray-500' },
  DRAFT:      { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  HIGH:       { bg: 'bg-red-500/15',   text: 'text-red-400',   label: 'High Risk' },
  MEDIUM:     { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Medium Risk' },
  LOW:        { bg: 'bg-cyan-DEFAULT/10', text: 'text-cyan-DEFAULT', label: 'Low Risk' },
  GOLD:       { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  SILVER:     { bg: 'bg-gray-500/20',  text: 'text-gray-300' },
  BASIC:      { bg: 'bg-blue-500/15',  text: 'text-blue-400' },
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const cfg = CONFIG[status] ?? { bg: 'bg-dark-50', text: 'text-gray-400' }
  const label = cfg.label ?? status.charAt(0) + status.slice(1).toLowerCase()
  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${px} ${cfg.bg} ${cfg.text}`}>
      {cfg.dot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'RUNNING' ? 'animate-pulse' : ''}`} />}
      {label}
    </span>
  )
}
