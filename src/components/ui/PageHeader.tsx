import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, icon, action }: Props) {
  return (
    <div className="mb-5 flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        {icon && (
          <motion.div
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-neon-purple"
            style={{
              background: 'rgba(155,92,255,0.12)',
              border: '1px solid rgba(155,92,255,0.25)',
              boxShadow: '0 0 16px rgba(155,92,255,0.3), inset 0 1px 1px rgba(255,255,255,0.1)',
            }}
            animate={{
              scale: [1, 1.06, 0.95, 1.03, 1],
              rotate: [0, 2, -2, 1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 2,
            }}
          >
            {icon}
          </motion.div>
        )}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-white/50">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
