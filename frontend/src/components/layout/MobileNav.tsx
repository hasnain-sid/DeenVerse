import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, BookOpen, Bookmark, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';

const mobileNav = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Explore', href: '/explore', icon: Search },
  { name: 'Hadith', href: '/hadith', icon: BookOpen },
  { name: 'Saved', href: '/saved', icon: Bookmark },
  { name: 'Profile', href: '/profile', icon: User },
];

export function MobileNav() {
  const location = useLocation();
  const { mobileNavOpen, setMobileNavOpen } = useUIStore();

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm md:hidden">
        <div className="flex items-center justify-around py-2">
          {mobileNav.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className="flex flex-col items-center gap-1 px-3 py-1"
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
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
            className="absolute left-0 top-0 h-full w-72 bg-background border-r animate-slide-in p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
                D
              </div>
              <span className="text-base font-semibold">DeenVerse</span>
            </div>

            <nav className="space-y-1">
              {mobileNav.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
