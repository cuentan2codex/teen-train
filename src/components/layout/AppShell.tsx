import { type ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { clsx } from 'clsx';

interface Props {
  children: ReactNode;
  showNav?: boolean;
  className?: string;
}

export function AppShell({ children, showNav = true, className }: Props) {
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col">
      <main className={clsx('flex-1 px-4 pt-4', showNav && 'pb-24', className)}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
