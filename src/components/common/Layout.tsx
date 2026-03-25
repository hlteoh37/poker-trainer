import { ReactNode } from 'react';

interface LayoutProps { children: ReactNode; }

export function Layout({ children }: LayoutProps) {
  return <main className="flex-1 p-4 pb-20 md:pb-4 max-w-6xl mx-auto w-full">{children}</main>;
}
