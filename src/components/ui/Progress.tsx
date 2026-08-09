import { type ReactNode } from 'react';
import { clsx } from 'clsx';

interface Props {
  value: number;
  max: number;
  label?: string;
  color?: string;
  className?: string;
  children?: ReactNode;
}

export function Progress({ value, max, label, color = 'bg-brand-500', className, children }: Props) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={className}>
      {(label || children) && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
          {children ?? <span className="text-slate-500">{pct}%</span>}
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
