import { AnimatePresence, motion } from 'framer-motion'
import { Radio } from 'lucide-react'
import { useStore, type Activity } from '../store/useStore'
import StatusBadge from './ui/StatusBadge'
import ChannelIcon from './ui/ChannelIcon'
import { timeAgo, initials } from '../lib/utils'

const AVATAR_COLORS = ['#00d4ff', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899']

function colorFor(name: string): string {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

function ActivityRow({ activity }: { activity: Activity }) {
  const color = colorFor(activity.memberName)
  const isConverted = activity.status === 'CONVERTED'

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      layout
      className="flex items-center gap-3 py-3 border-b border-dark-100/50 last:border-0"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        {initials(activity.memberName)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {activity.memberName}
          {isConverted && ' 🎯'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <ChannelIcon channel={activity.channel} size={11} showLabel />
          <StatusBadge status={activity.status} />
        </div>
      </div>
      <span className="text-xs text-gray-600 flex-shrink-0">
        {timeAgo(activity.timestamp)}
      </span>
    </motion.div>
  )
}

export default function LiveFeed() {
  const activities = useStore((s) => s.activities)

  return (
    <div className="card flex flex-col h-full">
      <div className="flex items-center justify-between p-5 border-b border-dark-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Live Feed</span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-DEFAULT/10 text-cyan-DEFAULT text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-DEFAULT animate-pulse" />
            LIVE
          </span>
        </div>
        {activities.length > 0 && (
          <span className="text-xs text-gray-600">{activities.length} events</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <AnimatePresence initial={false}>
          {activities.length > 0 ? (
            activities.map((a) => <ActivityRow key={a.id} activity={a} />)
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-48 gap-3 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-dark-200 flex items-center justify-center">
                <Radio size={20} className="text-gray-600" />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Launch a campaign to see<br />live delivery updates here
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
