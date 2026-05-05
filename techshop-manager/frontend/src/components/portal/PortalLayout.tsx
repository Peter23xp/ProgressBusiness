import type { ReactNode } from 'react';
import { PortalHeader } from './PortalHeader';
import { PortalNav } from './PortalNav';

interface PortalLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function PortalLayout({
  children,
  title,
  showBackButton = false,
  onBack,
}: PortalLayoutProps) {
  return (
    <>
      {/* Mobile: full width white. Desktop: centered card */}
      <div className="min-h-screen bg-neutral-100 md:flex md:items-start md:justify-center md:pt-8">
        <div className="flex flex-col bg-white w-full md:max-w-sm md:min-h-[calc(100vh-64px)] md:rounded-2xl md:shadow-xl md:overflow-hidden">
          <PortalHeader title={title} showBack={showBackButton} onBack={onBack} />
          <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 16 }}>
            {children}
          </main>
          <PortalNav />
        </div>
      </div>
    </>
  );
}
