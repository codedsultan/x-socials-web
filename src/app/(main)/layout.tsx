import { Sidebar } from '@/shared/components/sidebar';
import { MobileNav } from '@/shared/components/mobile-nav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-60 pb-16 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
