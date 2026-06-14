import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard, Users, Megaphone, BarChart3,
  Bell, X, CheckCircle, AlertCircle, Info,
} from 'lucide-react'
import LogoIcon from './ui/LogoIcon'
import { useSocket } from '../lib/socket'
import { useStore, type ToastItem } from '../store/useStore'

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/dashboard' },
  { icon: Users,           label: 'Members',    path: '/members' },
  { icon: Megaphone,       label: 'Campaigns',  path: '/campaigns' },
  { icon: BarChart3,       label: 'Analytics',  path: '/analytics' },
]

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/members':    'Members',
  '/campaigns':  'Campaigns',
  '/analytics':  'Analytics',
}

function ToastBanner({ toast, onRemove }: { toast: ToastItem; onRemove: () => void }) {
  useEffect(() => {
    const t = setTimeout(onRemove, 4000)
    return () => clearTimeout(t)
  }, [onRemove])

  const styles = {
    success: { icon: CheckCircle, border: 'border-cyan-DEFAULT/30', text: 'text-cyan-DEFAULT' },
    error:   { icon: AlertCircle, border: 'border-red-500/30',        text: 'text-red-400' },
    info:    { icon: Info,        border: 'border-blue-500/30',       text: 'text-blue-400' },
  }[toast.type]
  const Icon = styles.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      className={`flex items-center gap-3 bg-dark-300 border ${styles.border} rounded-xl px-4 py-3 shadow-xl max-w-xs`}
    >
      <Icon size={16} className={styles.text} />
      <p className="text-sm text-white flex-1">{toast.message}</p>
      <button onClick={onRemove} className="text-gray-600 hover:text-white transition-colors">
        <X size={14} />
      </button>
    </motion.div>
  )
}

export default function Layout() {
  useSocket()
  const location = useLocation()
  const { toasts, removeToast } = useStore()
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'FitReach Revivr'

  return (
    <div className="flex h-screen overflow-hidden bg-dark-500">
      {/* ── Sidebar ── */}
      <aside className="w-[260px] bg-dark-400 border-r border-dark-100 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-dark-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-DEFAULT/15 flex items-center justify-center animate-pulse-cyan">
              <LogoIcon size={20} color="#00d4ff" />
            </div>
            <div>
              <div className="text-base font-bold leading-none">
                <span className="text-white">FitReach</span>
                <span className="text-cyan-DEFAULT"> Revivr</span>
              </div>
              <span className="text-[10px] font-semibold text-violet-DEFAULT/80 tracking-widest uppercase mt-0.5 block">
                AI CRM
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
                  isActive
                    ? 'text-white bg-cyan-DEFAULT/5 border-l-[3px] border-cyan-DEFAULT pl-[9px]'
                    : 'text-gray-500 hover:text-white hover:bg-white/[0.03] border-l-[3px] border-transparent pl-[9px]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-cyan-DEFAULT' : 'text-gray-500 group-hover:text-gray-300 transition-colors'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Service status */}
        <div className="px-5 py-4 border-t border-dark-100">
          <div className="space-y-2">
            {[
              { label: 'Backend', emoji: '⚡' },
              { label: 'Channel Service', emoji: '📡' },
            ].map(({ label, emoji }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-xs">{emoji}</span>
                <span className="text-xs text-gray-600">{label}</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-DEFAULT animate-pulse" />
              </div>
            ))}
            <p className="text-[10px] text-gray-700 mt-1">All systems operational</p>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-dark-400 border-b border-dark-100 flex items-center px-6 gap-4 flex-shrink-0">
          <h1 className="text-lg font-bold text-white tracking-tight flex-1">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-xl bg-dark-300 flex items-center justify-center text-gray-500 hover:text-white transition-colors border border-dark-100">
              <Bell size={15} />
            </button>
            <div className="w-px h-5 bg-dark-100" />
            <span className="text-xs text-gray-600 font-medium">FitReach Revivr</span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute inset-0 overflow-y-auto"
            >
              <div className="p-6 min-h-full">
                <Outlet />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Toast stack ── */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastBanner key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
