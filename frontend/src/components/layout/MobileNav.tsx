import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Bookmark, Users, Newspaper, Bell, Radio, BookOpen, BookHeart, MessageCircle, User, GraduationCap, Moon, Sparkles, ChevronDown, Globe, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { useUnreadCount } from '@/features/notifications/useNotifications';
import { useChatUnreadCount } from '@/features/messages/useChat';
import { useState } from 'react';
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
    items: ['Learn Quran', 'Quran by Topic', 'Iman Boost', 'Ruhani Space', 'Hadith', 'Global Courses', 'Courses'],
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
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Main', 'Learning']);

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((current) =>
      current.includes(groupTitle)
        ? current.filter((name) => name !== groupTitle)
        : [...current, groupTitle]
    );
  };

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

            <nav className="space-y-2">
              {extendedNavGroups.map((group) => {
                const isExpanded = expandedGroups.includes(group.title);
                const groupItems = extendedNav.filter((item) => (group.items as readonly string[]).includes(item.name));

                return (
                  <div key={group.title} className="rounded-lg border bg-card">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.title)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium"
                    >
                      <span>{group.title}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-muted-foreground transition-transform',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </button>

                    {isExpanded && (
                      <div className="space-y-1 border-t px-2 py-2">
                        {groupItems.map((item) => {
                          const isActive = location.pathname === item.href;

                          return (
                            <NavLink
                              key={item.name}
                              to={item.href}
                              onClick={() => setMobileNavOpen(false)}
                              className={cn(
                                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative',
                                isActive
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                              )}
                            >
                              <item.icon className="h-5 w-5" />
                              {item.name}
                              {item.name === 'Notifications' && unreadCount > 0 && (
                                <span className="absolute right-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1.5">
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                              )}
                              {item.name === 'Messages' && chatUnreadCount > 0 && (
                                <span className="absolute right-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1.5">
                                  {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                                </span>
                              )}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
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
          </div>
        </div>
      )}
    </>
  );
}
