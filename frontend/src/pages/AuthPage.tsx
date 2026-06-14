import { useState } from 'react'
import type { ReactNode, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Zap, Mail, Lock, Eye, EyeOff, User, Building2, CheckCircle,
} from 'lucide-react'

const USER_KEY = 'fitreach_user'

interface StoredUser {
  name: string
  email: string
  studioName: string
  loggedIn: boolean
}

// ── Orb background (left panel) ──────────────────────────────────────────────
function LeftOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <motion.div
        className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,255,135,0.1) 0%, transparent 70%)' }}
        animate={{ x: [0, 20, -15, 0], y: [0, -20, 15, 0], scale: [1, 1.05, 0.95, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-10 -right-10 w-[350px] h-[350px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)' }}
        animate={{ x: [0, -20, 15, 0], y: [0, 15, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// ── Left panel ───────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="relative w-1/2 flex flex-col items-center justify-center p-12 overflow-hidden" style={{ background: '#0a0a0a' }}>
      <LeftOrbs />
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center gap-6 max-w-sm"
      >
        {/* Logo mark */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,255,135,0.12)', border: '1px solid rgba(0,255,135,0.2)' }}>
          <Zap size={28} className="text-[#00ff87]" />
        </div>

        <div>
          <p className="text-gray-500 text-sm mb-2">Welcome back to</p>
          <h1
            className="text-4xl font-black"
            style={{
              background: 'linear-gradient(135deg, #00ff87, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            FitReach Revivr
          </h1>
          <p className="text-gray-500 text-sm mt-2">Your AI member retention engine</p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-col gap-3 w-full">
          {[
            'AI-powered segments',
            'Real-time delivery tracking',
            'Multi-channel campaigns',
          ].map((f) => (
            <div
              key={f}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <CheckCircle size={15} className="text-[#00ff87] flex-shrink-0" />
              <span className="text-sm text-gray-400">{f}</span>
            </div>
          ))}
        </div>

        {/* Animated stats */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-2 px-5 py-3 rounded-xl text-center"
          style={{ background: 'rgba(0,255,135,0.06)', border: '1px solid rgba(0,255,135,0.15)' }}
        >
          <p className="text-sm font-semibold text-[#00ff87]">50 members · 3 segments · 2 campaigns</p>
          <p className="text-xs text-gray-600 mt-0.5">ready in your dashboard</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

// ── Input field ───────────────────────────────────────────────────────────────
function Field({
  label, type = 'text', placeholder, value, onChange, icon: Icon, rightEl,
}: {
  label: string
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  icon: typeof Mail
  rightEl?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none transition-colors"
          style={{
            background: '#161616',
            border: '1px solid #1f1f1f',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#00ff87' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#1f1f1f' }}
        />
        {rightEl && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
    </div>
  )
}

// ── Login form ────────────────────────────────────────────────────────────────
function LoginForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    const user: StoredUser = {
      name: email.split('@')[0] ?? 'User',
      email,
      studioName: 'My Fitness Studio',
      loggedIn: true,
    }
    if (remember) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    navigate('/dashboard')
  }

  const handleDemo = () => {
    const user: StoredUser = { name: 'Demo User', email: 'demo@fitreach.ai', studioName: 'FitReach Demo Studio', loggedIn: true }
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    navigate('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-white">Sign in to your account</h2>
        <p className="text-sm text-gray-500 mt-1">Demo mode — any credentials work</p>
      </div>

      <Field label="Email address" type="email" placeholder="you@fitnessstudio.com" value={email} onChange={setEmail} icon={Mail} />
      <Field
        label="Password" type={showPw ? 'text' : 'password'} placeholder="••••••••"
        value={password} onChange={setPassword} icon={Lock}
        rightEl={
          <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-600 hover:text-gray-300 transition-colors">
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded accent-[#00ff87] cursor-pointer"
          />
          <span className="text-xs text-gray-500">Remember me</span>
        </label>
        <button type="button" className="text-xs text-[#00ff87] hover:text-[#00cc6a] transition-colors">
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-black text-sm transition-all disabled:opacity-70 hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(135deg, #00ff87, #00cc6a)',
          boxShadow: loading ? 'none' : '0 0 20px rgba(0,255,135,0.25)',
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Signing in…
          </span>
        ) : (
          'Sign In →'
        )}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#1f1f1f]" />
        <span className="text-xs text-gray-600">or continue with</span>
        <div className="flex-1 h-px bg-[#1f1f1f]" />
      </div>

      <button
        type="button"
        onClick={handleDemo}
        className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-[1.02]"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 0 20px rgba(124,58,237,0.2)' }}
      >
        <span className="flex items-center justify-center gap-2">
          <Zap size={15} />
          Enter Demo Mode
        </span>
      </button>
      <p className="text-center text-xs text-gray-600">Skip login, explore immediately</p>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <button type="button" onClick={onDone} className="text-[#00ff87] hover:text-[#00cc6a] transition-colors font-medium">
          Register →
        </button>
      </p>
    </form>
  )
}

// ── Register form ─────────────────────────────────────────────────────────────
function RegisterForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [studio, setStudio] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    const user: StoredUser = { name, email, studioName: studio, loggedIn: true }
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    navigate('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-white">Create your account</h2>
        <p className="text-sm text-gray-500 mt-1">Join thousands of fitness businesses</p>
      </div>

      <Field label="Full Name" placeholder="Arjun Sharma" value={name} onChange={setName} icon={User} />
      <Field label="Email address" type="email" placeholder="you@fitnessstudio.com" value={email} onChange={setEmail} icon={Mail} />
      <Field label="Studio Name" placeholder="Power Fitness Studio" value={studio} onChange={setStudio} icon={Building2} />
      <Field
        label="Password" type={showPw ? 'text' : 'password'} placeholder="••••••••"
        value={password} onChange={setPassword} icon={Lock}
        rightEl={
          <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-600 hover:text-gray-300 transition-colors">
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-black text-sm transition-all disabled:opacity-70 hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(135deg, #00ff87, #00cc6a)',
          boxShadow: loading ? 'none' : '0 0 20px rgba(0,255,135,0.25)',
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Creating account…
          </span>
        ) : (
          'Create Account →'
        )}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <button type="button" onClick={onDone} className="text-[#00ff87] hover:text-[#00cc6a] transition-colors font-medium">
          Sign in →
        </button>
      </p>
    </form>
  )
}

// ── Right panel ───────────────────────────────────────────────────────────────
function RightPanel() {
  const [tab, setTab] = useState<'login' | 'register'>('login')

  return (
    <div
      className="w-1/2 flex items-center justify-center p-12"
      style={{ background: '#111111', borderLeft: '1px solid #1f1f1f' }}
    >
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="w-full max-w-sm flex flex-col gap-7"
      >
        {/* Tabs */}
        <div className="flex rounded-xl p-1" style={{ background: '#161616', border: '1px solid #1f1f1f' }}>
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all relative"
              style={{ color: tab === t ? '#fff' : '#555' }}
            >
              {tab === t && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: '#1f1f1f' }}
                  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                />
              )}
              <span className="relative z-10">
                {t === 'login' ? 'Login' : 'Register'}
              </span>
              {tab === t && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                  style={{ background: '#00ff87' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          {tab === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <LoginForm onDone={() => setTab('register')} />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <RegisterForm onDone={() => setTab('login')} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AuthPage() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      <LeftPanel />
      <RightPanel />
    </div>
  )
}
