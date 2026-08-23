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
  if (score >= 80) return 'var(--accent-evidence, #0D9488)'
  if (score >= 60) return 'var(--accent-gap, #D97706)'
  return 'var(--accent-danger, #DC2626)'
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
  const cx = size / 2
  const cy = size / 2
  const color = getColor(score)
  const filterId = `glow-${Math.round(score)}-${size}`

  const targetPathLength = score / 100

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
      >
        <defs>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feComposite in="blur" in2="SourceGraphic" operator="over" />
          </filter>
        </defs>

        {/* Background ring track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="var(--ring-track, rgba(18, 21, 26, 0.08))"
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
          }}
          animate={{ pathLength: targetPathLength, opacity: 1 }}
          initial={{ pathLength: 0, opacity: animated ? 0.7 : 1 }}
          transition={
            animated
              ? {
                  pathLength: {
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                  },
                  opacity: { duration: 0.2 },
                }
              : { duration: 0 }
          }
        />
      </svg>

      {showLabel && (
        <span
          className="font-mono font-bold"
          style={{
            color,
            fontSize: size * 0.28,
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
