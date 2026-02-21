import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

export function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const userName = user?.name?.split(' ')[0] || 'Guest';

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Date & Welcome Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-foreground">
          {isAuthenticated ? `Assalamu Alaikum, ${userName}` : 'Assalamu Alaikum'}
        </h2>
        <p className="text-muted-foreground">
          Welcome to your Islamic knowledge companion. {currentDate}
        </p>
      </div>

      {/* Bento Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[160px]">
        {/* Large Feature Card (Spans 2 cols, 2 rows) */}
        <Link
          to="/hadith"
          className="md:col-span-2 md:row-span-2 rounded-[20px] bg-card border border-border p-6 flex flex-col justify-between hover:border-primary/50 transition-colors group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-primary mb-4">
              <BookOpen className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Today's Hadith</span>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold mb-2 line-clamp-3 text-card-foreground">
              "The best among you are those who have the best manners and character."
            </h3>
            <p className="text-muted-foreground text-sm">Sahih al-Bukhari 6029</p>
          </div>
          <div className="flex items-center justify-between mt-4 relative z-10">
            <span className="flex items-center text-sm text-muted-foreground gap-1">
              <Clock className="w-4 h-4" /> 2 min read
            </span>
            <Button variant="secondary" className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              Read Now
            </Button>
          </div>
        </Link>

        {/* Daily Reminder (Text heavy, Arabic focus) */}
        <div className="rounded-[20px] bg-card border border-border p-6 flex flex-col justify-center items-center text-center">
          <p className="font-arabic text-3xl mb-3 text-primary leading-normal">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>
          <p className="text-sm text-muted-foreground italic">
            "In the name of Allah, the Most Gracious, the Most Merciful"
          </p>
        </div>

        {/* Goal Progress / Quick Stat */}
        <div className="rounded-[20px] bg-gradient-to-br from-brand-600 to-primary text-primary-foreground p-6 flex flex-col justify-between shadow-sm border border-primary/20">
          <h4 className="font-semibold text-lg text-primary-foreground/90">Goal Progress</h4>
          <div>
            <div className="text-3xl font-bold mb-1 text-primary-foreground">
              4<span className="text-lg opacity-70">/7</span>
            </div>
            <p className="text-xs opacity-80 uppercase tracking-widest font-semibold">Days Streak</p>
          </div>
        </div>
      </div>

      {/* Horizontal Immersive Feed - Recent Activity */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Continue Reading</h3>
          <Link to="/explore" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
            View All
          </Link>
        </div>

        {/* Horizontal Scroll Area */}
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scroll snap-x">
          <Link to="/explore" className="min-w-[280px] w-[280px] h-40 rounded-[20px] bg-card border border-border p-5 flex flex-col justify-between snap-start shrink-0 hover:border-primary/30 transition-colors group">
            <div>
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-secondary text-muted-foreground mb-2 inline-block">Collection</span>
              <h4 className="font-semibold text-lg line-clamp-1 text-card-foreground group-hover:text-primary transition-colors">The Concept of Tawheed</h4>
            </div>
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[60%]" />
            </div>
          </Link>

          <Link to="/saved" className="min-w-[280px] w-[280px] h-40 rounded-[20px] bg-card border border-border p-5 flex flex-col justify-between snap-start shrink-0 hover:border-primary/30 transition-colors group">
            <div>
              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-secondary text-muted-foreground mb-2 inline-block">Bookmarked</span>
              <h4 className="font-semibold text-lg line-clamp-2 text-card-foreground group-hover:text-primary transition-colors">Significance of the Last Ten Nights</h4>
            </div>
          </Link>

          <Link to="/explore" className="min-w-[280px] w-[280px] h-40 rounded-[20px] bg-transparent border border-border border-dashed p-5 flex flex-col items-center justify-center snap-start shrink-0 hover:border-primary/50 transition-colors group text-muted-foreground hover:text-primary">
            <ArrowRight className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Explore more topics</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
