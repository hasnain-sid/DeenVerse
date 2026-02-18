import { NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Bookmark,
  Home,
  Search,
  Settings,
  User,
  Users,
  LogOut,
  LogIn,
  ChevronLeft,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useUIStore } from '@/stores/uiStore';
import api from '@/lib/api';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Explore', href: '/explore', icon: Search },
  { name: 'Hadith', href: '/hadith', icon: BookOpen },
  { name: 'Saved', href: '/saved', icon: Bookmark },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Profile', href: '/profile', icon: User },
];

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const themeLabels = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export function Sidebar() {
  const location = useLocation();
  const { user, isAuthenticated, logout: logoutStore } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  const handleLogout = async () => {
    try {
      await api.post('/user/logout');
    } catch {
      // Logout locally even if API fails
    }
    logoutStore();
  };

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIdx = themes.indexOf(theme);
    setTheme(themes[(currentIdx + 1) % themes.length]);
  };

  const ThemeIcon = themeIcons[theme];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-[var(--sidebar-width-collapsed)]' : 'w-[var(--sidebar-width)]',
        'max-md:hidden'
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
              D
            </div>
            <span className="text-sm font-semibold tracking-tight">DeenVerse</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebarCollapsed}
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              sidebarCollapsed && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const link = (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!sidebarCollapsed && (
                <span className="animate-fade-in">{item.name}</span>
              )}
            </NavLink>
          );

          return sidebarCollapsed ? (
            <Tooltip key={item.name} content={item.name} side="right">
              {link}
            </Tooltip>
          ) : (
            link
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-3 space-y-1">
        {/* Theme Toggle */}
        <Tooltip content={`Theme: ${themeLabels[theme]}`} side="right">
          <button
            onClick={cycleTheme}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <ThemeIcon className="h-[18px] w-[18px] shrink-0" />
            {!sidebarCollapsed && <span>Theme</span>}
          </button>
        </Tooltip>

        {/* Settings */}
        <Tooltip content="Settings" side="right">
          <NavLink
            to="/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Settings className="h-[18px] w-[18px] shrink-0" />
            {!sidebarCollapsed && <span>Settings</span>}
          </NavLink>
        </Tooltip>

        {/* User / Auth */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 rounded-md px-3 py-2">
            <Avatar
              fallback={user.name}
              src={user.avatar}
              size="sm"
            />
            {!sidebarCollapsed && (
              <div className="flex flex-1 items-center justify-between animate-fade-in">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <NavLink
            to="/login"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <LogIn className="h-[18px] w-[18px] shrink-0" />
            {!sidebarCollapsed && <span>Sign In</span>}
          </NavLink>
        )}
      </div>
    </aside>
  );
}
