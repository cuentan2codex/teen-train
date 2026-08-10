import { motion } from 'framer-motion';

interface Props {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  gradientFrom?: string;
  gradientTo?: string;
  glowColor?: string;
  children?: React.ReactNode;
}

// Círculo de progreso con gradiente neón y glow + jelly idle.
// SVG con stroke gradient + drop-shadow filter para el halo luminoso.
export function ActivityRing({
  value,
  size = 160,
  stroke = 14,
  gradientFrom = '#FF3D8D',
  gradientTo = '#9B5CFF',
  glowColor = 'rgba(255, 61, 141, 0.6)',
  children,
}: Props) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  const gid = `ring-grad-${gradientFrom.replace('#', '')}-${gradientTo.replace('#', '')}`;

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={{
        scale: [1, 1.02, 0.98, 1.01, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        repeatDelay: 2,
      }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
          <filter id={`glow-${gid}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter={`url(#glow-${gid})`}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </motion.div>
  );
}
