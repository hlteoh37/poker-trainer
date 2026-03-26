import { ReactNode } from 'react';

interface LayoutProps { children: ReactNode; showSupport?: boolean; }

export function Layout({ children }: LayoutProps) {
  // pb-28: bottom nav (48px) + coach banner (~48px) + breathing room
  return <main className="flex-1 p-4 pb-28 md:pb-4 max-w-6xl mx-auto w-full">{children}</main>;
}
