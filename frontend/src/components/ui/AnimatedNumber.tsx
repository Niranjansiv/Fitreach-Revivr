import { useState, useEffect } from 'react'

interface Props {
  value: number
  duration?: number
  suffix?: string
}

export default function AnimatedNumber({ value, duration = 1500, suffix = '' }: Props) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const startTime = performance.now()
    let raf: number

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))
      if (progress < 1) raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <>{display.toLocaleString()}{suffix}</>
}
