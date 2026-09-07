import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Bookmark, Users, Newspaper, Bell, Radio, BookOpen, BookHeart, MessageCircle, User, GraduationCap, Moon, Sparkles, Globe, ShieldCheck, CalendarDays, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { useUnreadCount } from '@/features/notifications/useNotifications';
import { useChatUnreadCount } from '@/features/messages/useChat';
import { badgeFor } from './Sidebar';
import { useAuthStore } from '@/stores/authStore';

// Bottom nav is restricted to core items
const bottomNav = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Explore', href: '/explore', icon: Search },
  { name: 'Saved', href: '/saved', icon: Bookmark },
  { name: 'Community', href: '/community', icon: Users },
];

// Extended nav for the hamburger menu slide out
const extendedNav = [
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
];

const extendedNavGroups = [
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
    items: ['Streams', 'Notifications', 'Messages', 'Saved', 'Community', 'Profile'],
  },
] as const;

export function MobileNav() {
  const location = useLocation();
  const { mobileNavOpen, setMobileNavOpen } = useUIStore();
  const { user, isAuthenticated } = useAuthStore();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;
  const { data: chatUnreadData } = useChatUnreadCount();
  const chatUnreadCount = chatUnreadData?.count ?? 0;

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm md:hidden pb-safe">
        <div className="max-w-md mx-auto h-16 flex items-center justify-around px-2">
          {bottomNav.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className="flex flex-col items-center justify-center w-full h-full relative"
              >
                <item.icon
                  className={cn(
                    'h-6 w-6 mb-1 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Mobile slide-out overlay (for extended navigation) */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-72 bg-background border-r animate-slide-in p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
                D
              </div>
              <span className="text-base font-semibold">DeenVerse</span>
            </div>

            {/* Flat sections — same shape as the desktop sidebar, nothing to expand */}
            <nav className="space-y-5">
              {extendedNavGroups.map((group) => {
                const groupItems = extendedNav.filter((item) => (group.items as readonly string[]).includes(item.name));

                return (
                  <div key={group.title}>
                    <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      {group.title}
                    </p>
                    <div className="space-y-0.5">
                      {groupItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        const badge = badgeFor(item.name, unreadCount, chatUnreadCount);

                        return (
                          <NavLink
                            key={item.name}
                            to={item.href}
                            onClick={() => setMobileNavOpen(false)}
                            className={cn(
                              'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                              isActive
                                ? 'bg-secondary font-medium text-foreground'
                                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                            )}
                          >
                            {isActive && (
                              <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
                            )}
                            <item.icon className="h-[18px] w-[18px] shrink-0" />
                            <span className="truncate">{item.name}</span>
                            {badge > 0 && (
                              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                                {badge > 99 ? '99+' : badge}
                              </span>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Admin Panel — only visible to admins */}
            {isAuthenticated && user?.role === 'admin' && (
              <NavLink
                to="/admin/scholars"
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'mt-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors border',
                    isActive
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
                  )
                }
              >
                <ShieldCheck className="h-5 w-5 shrink-0" />
                Admin Panel
              </NavLink>
            )}

            {isAuthenticated && user && (
              <NavLink
                to="/my-sessions"
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'mt-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors border',
                    isActive
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-card text-foreground border-border hover:bg-secondary',
                  )
                }
              >
                <CalendarDays className="h-5 w-5 shrink-0" />
                My Sessions
              </NavLink>
            )}
          </div>
        </div>
      )}
    </>
  );
}
