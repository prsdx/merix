'use client'

import { motion } from 'framer-motion'

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  animated?: boolean
  className?: string
  showLabel?: boolean
}

function getColor(score: number): string {
  if (score >= 80) return '#22C55E'
  if (score >= 60) return '#F59E0B'
  return '#F97316'
}

export function ScoreRing({
  score,
  size = 72,
  strokeWidth = 6,
  animated = true,
  className,
  showLabel = true,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2
  const color = getColor(score)
  const filterId = `glow-${Math.round(score)}-${size}`

  const targetPathLength = score / 100

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
      >
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feComposite in="blur" in2="SourceGraphic" operator="over" result="glow" />
            <feBlend in="SourceGraphic" in2="glow" mode="normal" />
          </filter>
        </defs>

        {/* Background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Animated progress ring */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{
            pathLength: 0,
            filter: `url(#${filterId})`,
            opacity: 0.5,
          }}
          animate={
            animated
              ? { pathLength: targetPathLength, opacity: 1 }
              : { pathLength: targetPathLength, opacity: 1 }
          }
          initial={{ pathLength: 0, opacity: animated ? 0.5 : 1 }}
          transition={
            animated
              ? {
                  pathLength: {
                    duration: 1.1,
                    ease: [0.22, 1, 0.36, 1],
                  },
                  opacity: { duration: 0.2 },
                }
              : { duration: 0 }
          }
        />

        {/* Glow layer (duplicate circle, lower opacity) */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth + 2}
          fill="none"
          strokeLinecap="round"
          style={{ filter: `url(#${filterId})`, opacity: 0 }}
          animate={
            animated
              ? { pathLength: targetPathLength, opacity: 0.3 }
              : { pathLength: targetPathLength, opacity: 0.3 }
          }
          initial={{ pathLength: 0, opacity: 0 }}
          transition={
            animated
              ? {
                  pathLength: {
                    duration: 1.1,
                    ease: [0.22, 1, 0.36, 1],
                  },
                  opacity: { duration: 0.4 },
                }
              : { duration: 0 }
          }
        />
      </svg>

      {showLabel && (
        <span
          className="font-mono"
          style={{
            color,
            fontWeight: 700,
            fontSize: size * 0.26,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            userSelect: 'none',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {Math.round(score)}
        </span>
      )}
    </div>
  )
}
