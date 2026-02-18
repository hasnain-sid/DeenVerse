import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          'flex flex-col transition-all duration-300 ease-in-out',
          'md:ml-[var(--sidebar-width)]',
          sidebarCollapsed && 'md:ml-[var(--sidebar-width-collapsed)]'
        )}
      >
        <TopBar />

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8 pb-20 md:pb-6">
          <div className="mx-auto max-w-4xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile navigation */}
      <MobileNav />
    </div>
  );
}
