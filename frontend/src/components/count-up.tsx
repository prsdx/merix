'use client'

import { useEffect, useRef } from 'react'
import { useMotionValue, useTransform, animate, useInView } from 'framer-motion'

interface CountUpProps {
  to: number
  from?: number
  duration?: number
  delay?: number
  separator?: string
  className?: string
  suffix?: string
  prefix?: string
}

function formatNumber(value: number, separator: string): string {
  if (!separator) return String(value)
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)
}

export function CountUp({
  to,
  from = 0,
  duration = 1.5,
  delay = 0,
  separator = '',
  className,
  suffix = '',
  prefix = '',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  const motionValue = useMotionValue(from)
  const rounded = useTransform(motionValue, (latest) => Math.round(latest))

  useEffect(() => {
    if (!isInView) return

    const controls = animate(motionValue, to, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
    })

    return () => controls.stop()
  }, [isInView, motionValue, to, duration, delay])

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${formatNumber(latest, separator)}${suffix}`
      }
    })
    return unsubscribe
  }, [rounded, separator, suffix, prefix])

  return (
    <span
      ref={ref}
      className={className}
    >
      {`${prefix}${formatNumber(Math.round(from), separator)}${suffix}`}
    </span>
  )
}
