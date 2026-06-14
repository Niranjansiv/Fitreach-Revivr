export default function LogoIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {/* Left weight plate */}
      <rect x="0.5" y="0" width="2.8" height="5.5" rx="0.8" fill={color} />
      {/* Right weight plate */}
      <rect x="20.7" y="0" width="2.8" height="5.5" rx="0.8" fill={color} />
      {/* Bar */}
      <line x1="3.3" y1="2.8" x2="20.7" y2="2.8" stroke={color} strokeWidth="2" strokeLinecap="round" />

      {/* Left arm — hand grips bar, goes down to left shoulder */}
      <line x1="3.8" y1="2.8" x2="8.5" y2="11.5" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
      {/* Right arm */}
      <line x1="20.2" y1="2.8" x2="15.5" y2="11.5" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
      {/* Shoulder line */}
      <line x1="8.5" y1="11.5" x2="15.5" y2="11.5" stroke={color} strokeWidth="2.8" strokeLinecap="round" />

      {/* Head — centered between the raised arms */}
      <circle cx="12" cy="8.2" r="2.3" fill={color} />

      {/* Torso */}
      <line x1="12" y1="11.5" x2="12" y2="17.5" stroke={color} strokeWidth="2.8" strokeLinecap="round" />

      {/* Left leg */}
      <line x1="12" y1="17.5" x2="8.5" y2="23.5" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
      {/* Right leg */}
      <line x1="12" y1="17.5" x2="15.5" y2="23.5" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  )
}
