import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useUnreadCount } from '@/features/notifications/useNotifications';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const pageTitle: Record<string, string> = {
  '/': 'Home',
  '/explore': 'Explore',
  '/hadith': 'Daily Hadith',
  '/saved': 'Saved',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/community': 'Community',
  '/login': 'Sign In',
};

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setMobileNavOpen, setCommandPaletteOpen } = useUIStore();
  const { user, isAuthenticated } = useAuthStore();

  const title = pageTitle[location.pathname] || 'DeenVerse';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-8 w-8"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title */}
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search shortcut */}
      <Button
        variant="outline"
        size="sm"
        className={cn(
          'hidden md:inline-flex gap-2 text-muted-foreground h-8 px-3',
          'hover:text-foreground'
        )}
        onClick={() => setCommandPaletteOpen(true)}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs">Search</span>
        <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          Ctrl+K
        </kbd>
      </Button>

      {/* Notifications */}
      {isAuthenticated && <NotificationBell />}

      {/* Mobile avatar */}
      {isAuthenticated && user ? (
        <Avatar
          src={user.avatar}
          fallback={user.name?.[0] || '?'}
          size="sm"
          className="md:hidden cursor-pointer"
          onClick={() => navigate('/profile')}
        />
      ) : (
        <Button
          variant="default"
          size="sm"
          className="md:hidden h-8"
          onClick={() => navigate('/login')}
        >
          Sign In
        </Button>
      )}
    </header>
  );
}

function NotificationBell() {
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;

  return (
    <Link to="/notifications" className="relative">
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Bell className="h-4 w-4" />
      </Button>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
