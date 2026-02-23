import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTopicDetail } from './useQuranTopics';
import { AyahCard } from './components/AyahCard';
import { LessonsSection } from './components/LessonsSection';
import { DynamicIcon } from './components/TopicCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export function TopicDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: topic, isLoading, isError } = useTopicDetail(slug);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-96" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !topic) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16 space-y-4">
        <p className="text-muted-foreground">Topic not found or failed to load.</p>
        <Button variant="outline" asChild>
          <Link to="/quran-topics">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Topics
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Back link */}
      <Link
        to="/quran-topics"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Topics
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <DynamicIcon name={topic.icon} className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{topic.name}</h1>
            <p className="text-sm text-muted-foreground">{topic.nameArabic}</p>
          </div>
        </div>
        <p className="text-muted-foreground">{topic.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5">{topic.category}</span>
          <span>{topic.ayahCount} ayahs</span>
        </div>
      </div>

      {/* Lessons & Understanding */}
      {topic.lessons && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Understanding & Lessons</h2>
          <LessonsSection lessons={topic.lessons} />
        </section>
      )}

      {/* Ayahs */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Ayahs</h2>
        {topic.ayahs.length === 0 ? (
          <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading ayahs...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {topic.ayahs.map((ayah, i) => (
              <AyahCard key={ayah.globalAyahNumber} ayah={ayah} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
