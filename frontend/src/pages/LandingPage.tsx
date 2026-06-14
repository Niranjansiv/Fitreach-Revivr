import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Zap, Brain, BarChart3, Target, MessageCircle, Bot, Users, TrendingUp } from 'lucide-react'
import LogoIcon from '../components/ui/LogoIcon'

// ── Animated orb background ──────────────────────────────────────────────────
function OrbBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.015) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <motion.div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)' }}
        animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.05, 0.96, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -top-20 -right-32 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)' }}
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -30, 0], scale: [1, 0.96, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-[800px] h-[300px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.03) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const navigate = useNavigate()
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(6,6,17,0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,212,255,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(0,212,255,0.12)' }}
          >
            <LogoIcon size={17} color="#00d4ff" />
          </div>
          <span className="text-base font-bold text-white">
            FitReach<span style={{ color: '#00d4ff' }}> Revivr</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            {['Features', 'Solutions', 'Analytics', 'Pricing'].map((item) => (
              <span key={item} className="text-sm text-slate-400 hover:text-white cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 rounded-xl text-sm font-bold text-black transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
              boxShadow: '0 0 20px rgba(0,212,255,0.25)',
            }}
          >
            Enter App →
          </button>
        </div>
      </div>
    </nav>
  )
}

// ── Live activity cards ───────────────────────────────────────────────────────
const LIVE_CARDS = [
  {
    icon: '🔴',
    dot: '#ef4444',
    label: 'Churn Alert',
    value: '18 members flagged at risk',
    floatY: [0, -12, 0],
    delay: 0,
  },
  {
    icon: '⚡',
    dot: '#00d4ff',
    label: 'Campaign Live',
    value: '94% delivery · 31 opened',
    floatY: [0, -8, 0],
    delay: 0.6,
  },
  {
    icon: '📈',
    dot: '#8b5cf6',
    label: 'Re-engaged',
    value: 'Engagement up 3× this month',
    floatY: [0, -14, 0],
    delay: 1.1,
  },
]

function LiveCards() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
        <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#475569' }}>
          Live Activity
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {LIVE_CARDS.map(({ icon, dot, label, value, floatY, delay }) => (
          <motion.div
            key={label}
            animate={{ y: floatY }}
            transition={{ duration: 3 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: 'rgba(12,12,29,0.85)',
              border: `1px solid ${dot}22`,
              backdropFilter: 'blur(12px)',
              boxShadow: `0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
          >
            <span className="text-base">{icon}</span>
            <div>
              <p className="text-xs font-semibold text-white leading-none mb-0.5">{label}</p>
              <p className="text-[10px]" style={{ color: '#64748b' }}>{value}</p>
            </div>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: dot }} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Hero section ──────────────────────────────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.14 } } } as const
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } } as const

function HeroSection() {
  const navigate = useNavigate()
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-24 px-6 overflow-hidden"
      style={{ background: '#060611' }}
    >
      <OrbBackground />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center text-center gap-8 w-full max-w-4xl mx-auto"
      >
        {/* Badge */}
        <motion.div variants={fadeUp}>
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.25)',
              color: '#00d4ff',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
            ✨ AI-Powered Member Retention
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-1">
          <h1 className="font-black leading-none tracking-tight text-white" style={{ fontSize: 84 }}>
            Turn Churn
          </h1>
          <h1 className="font-black leading-none tracking-tight text-white" style={{ fontSize: 84 }}>
            Into Loyalty
          </h1>
          <h1
            className="font-serif-accent leading-none tracking-tight"
            style={{
              fontSize: 84,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 50%, #00d4ff 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 4s linear infinite',
            }}
          >
            On Autopilot.
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p variants={fadeUp} className="text-lg leading-relaxed max-w-[520px]" style={{ color: '#64748b' }}>
          FitReach Revivr predicts which members are about to leave, crafts personalized outreach, and automatically re-engages them — before you lose them.
        </motion.p>

        {/* Single CTA */}
        <motion.div variants={fadeUp}>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-14 py-4 rounded-2xl font-bold text-black text-lg transition-all hover:scale-105 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
              boxShadow: '0 0 40px rgba(0,212,255,0.4), 0 0 80px rgba(0,212,255,0.15)',
            }}
          >
            <span className="relative z-10">🚀 Open Dashboard</span>
          </button>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={fadeUp} className="flex items-center gap-10">
          {[
            { num: '34%', label: 'Avg Churn Reduced' },
            { num: '89%', label: 'Message Open Rate' },
            { num: '3×', label: 'Re-engagement ROI' },
          ].map(({ num, label }, i) => (
            <div key={label} className="flex items-center gap-10">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: '#00d4ff' }}>{num}</p>
                <p className="text-sm mt-0.5" style={{ color: '#475569' }}>{label}</p>
              </div>
              {i < 2 && <div className="w-px h-10" style={{ background: '#161630' }} />}
            </div>
          ))}
        </motion.div>

        {/* Live activity cards */}
        <motion.div variants={fadeUp} className="w-full mt-2">
          <LiveCards />
        </motion.div>
      </motion.div>

      {/* Gradient fade bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #060611)' }}
      />
    </section>
  )
}

// ── Features section ──────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Brain,         color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)', title: 'AI Segment Builder',      desc: 'Natural language to member segments in seconds' },
  { icon: Zap,           color: '#00d4ff', bg: 'rgba(0,212,255,0.08)',  title: 'Live Delivery Tracking',  desc: 'Real-time callbacks for every message sent' },
  { icon: BarChart3,     color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', title: 'Smart Analytics',         desc: 'AI insights surfaced after every campaign' },
  { icon: Target,        color: '#ef4444', bg: 'rgba(239,68,68,0.10)',  title: 'Churn Prediction',         desc: "Know who's leaving before they do" },
  { icon: MessageCircle, color: '#00d4ff', bg: 'rgba(0,212,255,0.08)',  title: 'Multi-Channel',            desc: 'WhatsApp, SMS, Email, Push — all in one' },
  { icon: Bot,           color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)', title: 'AI Assistant',             desc: 'Your 24/7 retention co-pilot' },
]

function FeaturesSection() {
  return (
    <section className="py-28 px-6" style={{ background: '#060611' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#00d4ff' }}>
            Everything in one platform
          </p>
          <h2 className="font-black text-white" style={{ fontSize: 52 }}>Everything you need</h2>
          <h2
            className="font-serif-accent"
            style={{
              fontSize: 52,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            to retain every member
          </h2>
        </motion.div>

        <div className="grid grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, color, bg, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="flex flex-col gap-4 p-6 rounded-2xl group cursor-default"
              style={{
                background: '#0c0c1d',
                border: '1px solid rgba(0,212,255,0.08)',
                borderTop: `2px solid ${color}`,
              }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: bg }}>
                <Icon size={22} style={{ color }} />
              </div>
              <h3 className="font-bold text-white text-base">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── How it works ──────────────────────────────────────────────────────────────
const STEPS = [
  { num: '1', icon: Users,       color: '#00d4ff', bg: 'rgba(0,212,255,0.12)', title: 'Identify',  desc: 'AI spots at-risk members daily using engagement data' },
  { num: '2', icon: MessageCircle, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', title: 'Engage', desc: 'AI crafts hyper-personalized messages per member' },
  { num: '3', icon: TrendingUp,  color: '#00d4ff', bg: 'rgba(0,212,255,0.12)', title: 'Retain',   desc: 'Track re-engagement and conversions in real-time' },
]

function HowItWorksSection() {
  return (
    <section className="py-28 px-6 relative overflow-hidden" style={{ background: '#07071a' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 100%, rgba(0,212,255,0.03) 0%, transparent 80%)' }}
      />
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#8b5cf6' }}>
            Simple by design
          </p>
          <h2 className="font-black text-white" style={{ fontSize: 48 }}>How it works</h2>
          <p className="text-lg mt-3" style={{ color: '#475569' }}>From insight to action in under 60 seconds</p>
        </motion.div>

        <div className="flex items-start">
          {STEPS.map(({ num, icon: Icon, color, bg, title, desc }, i) => (
            <div key={title} className="flex items-start flex-1">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.18 }}
                className="flex flex-col items-center text-center gap-5 flex-1"
              >
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
                    style={{ background: bg, color }}
                  >
                    {num}
                  </div>
                  <div
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: '#07071a', border: `1px solid ${color}` }}
                  >
                    <Icon size={13} style={{ color }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-1.5">{title}</h3>
                  <p className="text-sm leading-relaxed max-w-[160px]" style={{ color: '#64748b' }}>{desc}</p>
                </div>
              </motion.div>

              {i < 2 && (
                <div className="flex-shrink-0 mt-8 px-3">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.18 + 0.35, ease: 'easeOut' }}
                    style={{
                      transformOrigin: 'left',
                      background: 'linear-gradient(90deg, #00d4ff, #8b5cf6)',
                      height: 2,
                      width: 72,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Social proof strip ────────────────────────────────────────────────────────
const PROOF = [
  { value: '10,000+', label: 'Gyms using Revivr' },
  { value: '2.4M', label: 'Members retained' },
  { value: '$42M+', label: 'Revenue recovered' },
  { value: '4.9 ★', label: 'Average rating' },
]

function ProofStrip() {
  return (
    <section className="py-12 px-6" style={{ background: '#060611', borderTop: '1px solid rgba(0,212,255,0.06)', borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-12">
        {PROOF.map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-3xl font-black" style={{ color: '#00d4ff' }}>{value}</p>
            <p className="text-sm mt-1" style={{ color: '#475569' }}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Final CTA ─────────────────────────────────────────────────────────────────
function CTASection() {
  const navigate = useNavigate()
  return (
    <section className="py-32 px-6 relative overflow-hidden" style={{ background: '#060611' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,212,255,0.06) 0%, rgba(139,92,246,0.06) 50%, transparent 100%)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center gap-6"
      >
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium"
          style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" /> Ready to start
        </span>
        <h2 className="font-black text-white" style={{ fontSize: 52 }}>
          Retain every member,
        </h2>
        <h2
          className="font-serif-accent -mt-4"
          style={{
            fontSize: 52,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          starting today.
        </h2>
        <p className="text-base" style={{ color: '#64748b' }}>
          Open the dashboard and let AI handle the rest.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-2 px-14 py-4 rounded-2xl font-bold text-black text-lg transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
            boxShadow: '0 0 48px rgba(0,212,255,0.4)',
          }}
        >
          Enter Dashboard →
        </button>
      </motion.div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      className="py-10 px-6"
      style={{ background: '#060611', borderTop: '1px solid rgba(0,212,255,0.06)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <LogoIcon size={15} color="#00d4ff" />
          <span className="font-bold text-white text-sm">
            FitReach<span style={{ color: '#00d4ff' }}> Revivr</span>
          </span>
        </div>
        <p className="text-sm" style={{ color: '#475569' }}>
          Predict. Engage. Retain.
        </p>
        <p className="text-xs" style={{ color: '#334155' }}>© 2026 FitReach Revivr</p>
      </div>
    </footer>
  )
}

// ── Gradient animation keyframe (injected once) ───────────────────────────────
const gradientStyle = `
  @keyframes gradientShift {
    0%   { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
`

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ background: '#060611', fontFamily: 'Outfit, sans-serif' }}>
      <style>{gradientStyle}</style>
      <Navbar />
      <HeroSection />
      <ProofStrip />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  )
}
