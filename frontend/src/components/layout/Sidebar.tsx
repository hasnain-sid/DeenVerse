import { NavLink, useLocation } from 'react-router-dom';
import {
  BookHeart,
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
  Newspaper,
  Bell,
  MessageCircle,
  Radio,
  GraduationCap,
  Sparkles,
  Globe,
  BadgeCheck,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  CalendarDays,
  ScrollText,
  Video,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useUIStore } from '@/stores/uiStore';
import api from '@/lib/api';
import { useUnreadCount } from '@/features/notifications/useNotifications';
import { useChatUnreadCount } from '@/features/messages/useChat';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Feed', href: '/feed', icon: Newspaper },
  { name: 'Explore', href: '/explore', icon: Search },
  { name: 'Learn Quran', href: '/learn-quran', icon: GraduationCap },
  { name: 'Quran by Topic', href: '/quran-topics', icon: BookHeart },
  { name: 'Iman Boost', href: '/iman-boost', icon: Sparkles },
  { name: 'Ruhani Space', href: '/ruhani', icon: Moon },
  { name: 'Hadith', href: '/hadith', icon: BookOpen },
  { name: 'Seerah', href: '/seerah', icon: ScrollText },
  { name: 'Classrooms', href: '/classrooms', icon: CalendarDays },
  { name: 'Global Courses', href: '/global-courses', icon: Globe },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Streams', href: '/streams', icon: Radio },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Messages', href: '/messages', icon: MessageCircle },
  { name: 'Saved', href: '/saved', icon: Bookmark },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Subscription', href: '/subscription', icon: CreditCard },
];

const navigationGroups = [
  {
    title: 'Main',
    items: ['Home', 'Feed', 'Explore'],
  },
  {
    title: 'Learning',
    items: ['Learn Quran', 'Quran by Topic', 'Iman Boost', 'Ruhani Space', 'Hadith', 'Seerah', 'Classrooms', 'Global Courses', 'Courses'],
  },
  {
    title: 'Community',
    items: ['Streams', 'Notifications', 'Messages', 'Saved', 'Community', 'Profile', 'Subscription'],
  },
] as const;

/** Notifications and Messages are the only rows that carry a count. */
export function badgeFor(name: string, unread: number, chatUnread: number) {
  if (name === 'Notifications') return unread;
  if (name === 'Messages') return chatUnread;
  return 0;
}

/**
 * One navigation row, shared by the collapsed and expanded sidebar so the two
 * cannot drift apart — the badge markup used to be written out three times.
 */
function NavItem({
  item,
  isActive,
  collapsed = false,
  badge = 0,
}: {
  item: { name: string; href: string; icon: LucideIcon };
  isActive: boolean;
  collapsed?: boolean;
  badge?: number;
}) {
  return (
    <NavLink
      to={item.href}
      className={cn(
        'relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-secondary font-medium text-foreground'
          : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
      )}
    >
      {/* A left accent marks the active row without tinting the whole thing */}
      {isActive && (
        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <span className="relative shrink-0">
        <item.icon className="h-[18px] w-[18px]" />
        {badge > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      {!collapsed && <span className="truncate">{item.name}</span>}
    </NavLink>
  );
}

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
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;
  const { data: chatUnreadData } = useChatUnreadCount();
  const chatUnreadCount = chatUnreadData?.count ?? 0;

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
      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {sidebarCollapsed ? (
          <div className="space-y-0.5">
            {navigation.map((item) => (
              <Tooltip key={item.name} content={item.name} side="right">
                <NavItem
                  item={item}
                  isActive={location.pathname === item.href}
                  collapsed
                  badge={badgeFor(item.name, unreadCount, chatUnreadCount)}
                />
              </Tooltip>
            ))}
          </div>
        ) : (
          /*
            Flat sections rather than collapsible cards. Every destination stays
            visible, so finding one is reading rather than opening: no nested
            borders, no per-group chrome, and no expand state to get wrong — which
            is what hid `Seerah` when it was added to `navigation` but not to a
            group's `items`.
          */
          <div className="space-y-5">
            {navigationGroups.map((group) => {
              const groupItems = navigation.filter((item) =>
                (group.items as readonly string[]).includes(item.name)
              );

              return (
                <div key={group.title}>
                  <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                    {group.title}
                  </p>
                  <div className="space-y-0.5">
                    {groupItems.map((item) => (
                      <NavItem
                        key={item.name}
                        item={item}
                        isActive={location.pathname === item.href}
                        badge={badgeFor(item.name, unreadCount, chatUnreadCount)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
        {/* Admin Panel — only for admins */}
        {isAuthenticated && user?.role === 'admin' && (
          <>
            <Tooltip content="Admin: Scholar Review" side="right">
              <NavLink
                to="/admin/scholars"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors font-medium',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30',
                  )
                }
              >
                <ShieldCheck className="h-[18px] w-[18px] shrink-0" />
                {!sidebarCollapsed && <span>Admin: Scholars</span>}
              </NavLink>
            </Tooltip>
            <Tooltip content="Admin: Course Review" side="right">
              <NavLink
                to="/admin/courses"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors font-medium',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30',
                  )
                }
              >
                <GraduationCap className="h-[18px] w-[18px] shrink-0" />
                {!sidebarCollapsed && <span>Admin: Courses</span>}
              </NavLink>
            </Tooltip>
          </>
        )}

        {/* Upgrade Plan CTA — for free users */}
        {isAuthenticated && user && !user.subscription?.plan && (
          <Tooltip content="Upgrade Plan" side="right">
            <NavLink
              to="/subscription"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-primary hover:bg-primary/10 transition-colors font-medium"
            >
              <CreditCard className="h-[18px] w-[18px] shrink-0" />
              {!sidebarCollapsed && <span>Upgrade Plan</span>}
            </NavLink>
          </Tooltip>
        )}

        {isAuthenticated && user && (
          <Tooltip content="My Sessions" side="right">
            <NavLink
              to="/my-sessions"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-secondary text-secondary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )
              }
            >
              <CalendarDays className="h-[18px] w-[18px] shrink-0" />
              {!sidebarCollapsed && <span>My Sessions</span>}
            </NavLink>
          </Tooltip>
        )}

        {/* Earnings link — scholar only */}
        {isAuthenticated && user && (user.role === 'scholar' || user.role === 'admin') && (
          <Tooltip content="Earnings" side="right">
            <NavLink
              to="/scholar/earnings"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-secondary text-secondary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )
              }
            >
              <TrendingUp className="h-[18px] w-[18px] shrink-0" />
              {!sidebarCollapsed && <span>Earnings</span>}
            </NavLink>
          </Tooltip>
        )}

        {/* My Sessions link — scholar only */}
        {isAuthenticated && user && (user.role === 'scholar' || user.role === 'admin') && (
          <Tooltip content="My Sessions" side="right">
            <NavLink
              to="/scholar/classrooms"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-secondary text-secondary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )
              }
            >
              <Video className="h-[18px] w-[18px] shrink-0" />
              {!sidebarCollapsed && <span>My Sessions</span>}
            </NavLink>
          </Tooltip>
        )}

        {/* My Teaching link — scholar only */}
        {isAuthenticated && user && (user.role === 'scholar' || user.role === 'admin') && (
          <Tooltip content="My Teaching" side="right">
            <NavLink
              to="/scholar/courses"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-secondary text-secondary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )
              }
            >
              <GraduationCap className="h-[18px] w-[18px] shrink-0" />
              {!sidebarCollapsed && <span>My Teaching</span>}
            </NavLink>
          </Tooltip>
        )}

        {/* Become a Scholar CTA — only for regular users */}
        {isAuthenticated && user && user.role === 'user' && (
          <Tooltip content="Become a Scholar" side="right">
            <NavLink
              to="/scholar/apply"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors font-medium"
            >
              <BadgeCheck className="h-[18px] w-[18px] shrink-0" />
              {!sidebarCollapsed && <span>Become a Scholar</span>}
            </NavLink>
          </Tooltip>
        )}

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
