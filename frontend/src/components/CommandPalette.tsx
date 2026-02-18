import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Home,
  BookOpen,
  Bookmark,
  Users,
  User,
  Settings,
  Compass,
  ArrowRight,
  Command,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

// ── Types ────────────────────────────────────────────

interface SearchItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  category: 'navigation' | 'recent' | 'hadith';
}

// ── Navigation items ─────────────────────────────────

const NAV_ITEMS = [
  { path: '/', label: 'Home', description: 'Go to the home page', icon: Home },
  { path: '/explore', label: 'Explore', description: 'Browse hadith categories', icon: Compass },
  { path: '/hadith', label: 'Daily Hadith', description: 'Read the hadith of the day', icon: BookOpen },
  { path: '/saved', label: 'Saved', description: 'View your bookmarked hadiths', icon: Bookmark },
  { path: '/community', label: 'Community', description: 'Connect with others', icon: Users },
  { path: '/profile', label: 'Profile', description: 'View your profile', icon: User },
  { path: '/settings', label: 'Settings', description: 'Appearance, reading, password', icon: Settings },
];

// ── Helpers ──────────────────────────────────────────

const RECENT_SEARCHES_KEY = 'deenverse-recent-searches';

function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  const recents = getRecentSearches().filter((q) => q !== query);
  recents.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recents.slice(0, 5)));
}

// ── Component ────────────────────────────────────────

export function CommandPalette() {
  const { commandPaletteOpen: open, setCommandPaletteOpen: setOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // ── Keyboard shortcut: Cmd+K / Ctrl+K ──────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // ── Build search items ─────────────────────────
  const items = useMemo<SearchItem[]>(() => {
    const results: SearchItem[] = [];

    // Navigation items always available
    NAV_ITEMS.forEach((item) => {
      // Skip auth-required routes for unauthenticated users
      if (!isAuthenticated && ['/saved', '/profile', '/settings'].includes(item.path)) return;

      results.push({
        id: `nav-${item.path}`,
        label: item.label,
        description: item.description,
        icon: item.icon,
        category: 'navigation',
        action: () => {
          navigate(item.path);
          setOpen(false);
        },
      });
    });

    return results;
  }, [navigate, isAuthenticated]);

  // ── Filter items by query ──────────────────────
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const lowerQuery = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery)
    );
  }, [items, query]);

  // Reset selected index when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length]);

  // ── Keyboard navigation ────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          if (query.trim()) addRecentSearch(query.trim());
          filtered[selectedIndex].action();
        } else if (query.trim()) {
          // No exact match — navigate to full search page
          addRecentSearch(query.trim());
          navigate(`/search?q=${encodeURIComponent(query.trim())}`);
          setOpen(false);
        }
      }
    },
    [filtered, selectedIndex, query]
  );

  // Scroll selected item into view
  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    const selected = listEl.children[selectedIndex] as HTMLElement;
    selected?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 animate-slide-down">
        <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages, hadiths..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
            <button
              onClick={() => setOpen(false)}
              className="sm:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[300px] overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No results found for "{query}"
              </div>
            ) : (
              filtered.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (query.trim()) addRecentSearch(query.trim());
                    item.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                    idx === selectedIndex
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {idx === selectedIndex && (
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-4 py-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5">↵</kbd> select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Command className="h-3 w-3" />K to toggle
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
