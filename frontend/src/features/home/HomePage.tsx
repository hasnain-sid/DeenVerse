import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Bookmark, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const quickLinks = [
  {
    title: "Today's Hadith",
    description: 'Read and reflect on today\'s selected hadith',
    icon: BookOpen,
    href: '/hadith',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
  },
  {
    title: 'Saved',
    description: 'Your bookmarked hadiths',
    icon: Bookmark,
    href: '/saved',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50',
  },
  {
    title: 'Explore',
    description: 'Discover hadiths by topic',
    icon: TrendingUp,
    href: '/explore',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50',
  },
  {
    title: 'Community',
    description: 'Connect with fellow learners',
    icon: Users,
    href: '/explore',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50',
  },
];

export function HomePage() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {isAuthenticated
            ? `Assalamu Alaikum, ${user?.name?.split(' ')[0]}`
            : 'Assalamu Alaikum'}
        </h1>
        <p className="text-muted-foreground">
          Welcome to your Islamic knowledge companion.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.title} to={link.href}>
            <Card className="h-full hover:bg-secondary/30 transition-colors cursor-pointer group">
              <CardContent className="flex items-start gap-4 p-5">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    link.color
                  )}
                >
                  <link.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {link.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Daily Verse Highlight */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
        <CardContent className="p-6 text-center space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Daily Reminder
          </p>
          <blockquote className="text-lg font-arabic leading-loose text-foreground/90 max-w-2xl mx-auto">
            بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
          </blockquote>
          <p className="text-sm text-muted-foreground italic">
            "In the name of Allah, the Most Gracious, the Most Merciful"
          </p>
        </CardContent>
      </Card>

      {/* Feed placeholder */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Recent Activity
        </h3>
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <p>Your feed will appear here as the community grows.</p>
            <p className="mt-1">Start by browsing today's hadith!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
