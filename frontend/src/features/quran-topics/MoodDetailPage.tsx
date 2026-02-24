import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useMoodDetail } from './useQuranTopics';
import { AyahCard } from './components/AyahCard';
import { LessonsSection } from './components/LessonsSection';
import { DynamicIcon } from './components/TopicCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export function MoodDetailPage() {
  const { moodId } = useParams<{ moodId: string }>();
  const { data: mood, isLoading, isError } = useMoodDetail(moodId);

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

  if (isError || !mood) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16 space-y-4">
        <p className="text-muted-foreground">Mood not found or failed to load.</p>
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
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in p-4 md:p-6 pb-24">
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
          <span className="text-4xl" role="img" aria-label={mood.name}>
            {mood.emoji}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{mood.name}</h1>
            <p className="text-sm text-muted-foreground">{mood.description}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{mood.ayahCount} ayahs from related topics</p>
      </div>

      {/* Related topics */}
      {mood.relatedTopics.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Related Topics</h2>
          <div className="flex flex-wrap gap-2">
            {mood.relatedTopics.map((topic) => (
              <Link
                key={topic.slug}
                to={`/quran-topics/${topic.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:border-primary/40 transition-colors"
              >
                <DynamicIcon name={topic.icon} className="h-3.5 w-3.5 text-primary" />
                {topic.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Lessons */}
      {mood.lessons.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Understanding & Lessons</h2>
          <LessonsSection lessons={mood.lessons} />
        </section>
      )}

      {/* Ayahs */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Ayahs</h2>
        {mood.ayahs.length === 0 ? (
          <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading ayahs...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {mood.ayahs.map((ayah, i) => (
              <AyahCard key={ayah.globalAyahNumber} ayah={ayah} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
