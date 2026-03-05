import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Globe,
  MessageCircle,
  GraduationCap,
  BookOpen,
  Star,
  Users,
  CheckCircle2,
  ArrowLeft,
  Video,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScholarBadge } from '@/components/ScholarBadge';
import { useScholarProfile } from './useScholar';
import { cn } from '@/lib/utils';

type ProfileTab = 'credentials' | 'about';

export function ScholarProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: scholar, isLoading, isError } = useScholarProfile(id ?? '');
  const [activeTab, setActiveTab] = useState<ProfileTab>('credentials');

  if (isLoading) return <ScholarProfileSkeleton />;

  if (isError || !scholar) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <p className="text-muted-foreground mb-4">Scholar profile not found.</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/feed">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Link>
        </Button>
      </div>
    );
  }

  const sp = scholar.scholarProfile;
  const rating = sp.rating?.average ?? 0;
  const ratingCount = sp.rating?.count ?? 0;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Back button */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b flex items-center gap-3 px-4 py-2.5 -mx-4 mb-0">
        <Link to="/feed" className="text-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-lg font-bold">Scholar Profile</span>
      </div>

      {/* Cover */}
      <div className="relative h-48 bg-muted rounded-b-xl overflow-hidden">
        {scholar.coverUrl ? (
          <img src={scholar.coverUrl} className="w-full h-full object-cover" alt="Cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-600/30 via-muted to-primary/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
      </div>

      {/* Header */}
      <div className="px-4 sm:px-6 pb-8 relative -mt-16">
        <div className="flex justify-between items-end mb-4">
          <Avatar
            src={scholar.avatar}
            fallback={scholar.name}
            size="lg"
            className="h-28 w-28 text-3xl border-4 border-background shadow-lg"
          />
          <div className="flex gap-3 pb-1">
            <Button variant="outline" size="sm" className="font-semibold">
              Follow
            </Button>
            <Button size="sm" className="font-semibold gap-2">
              <GraduationCap className="w-4 h-4" />
              Apply to Study
            </Button>
          </div>
        </div>

        {/* Name + badge */}
        <div className="mb-1">
          <div className="flex items-center gap-2.5 mb-0.5">
            <h1 className="text-2xl font-bold text-foreground">{scholar.name}</h1>
            <ScholarBadge role="scholar" size="lg" />
          </div>
          <p className="text-muted-foreground text-sm">@{scholar.username}</p>
        </div>

        {/* Bio */}
        {sp.bio && (
          <p className="text-foreground/90 max-w-2xl leading-relaxed mt-3 mb-4 text-sm">
            {sp.bio}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-y-2 gap-x-5 text-sm text-muted-foreground mb-6">
          {scholar.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 shrink-0" />
              {scholar.location}
            </div>
          )}
          {scholar.website && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 shrink-0" />
              <a
                href={scholar.website.startsWith('http') ? scholar.website : `https://${scholar.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {scholar.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          {sp.teachingLanguages.length > 0 && (
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 shrink-0" />
              Speaks: {sp.teachingLanguages.join(', ')}
            </div>
          )}
          {sp.verifiedAt && (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Verified since {new Date(sp.verifiedAt).getFullYear()}
            </div>
          )}
        </div>

        {/* Stats banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border rounded-2xl overflow-hidden mb-8">
          {[
            { label: 'Students', value: sp.totalStudents > 0 ? sp.totalStudents.toLocaleString() : '—' },
            { label: 'Courses', value: sp.totalCourses > 0 ? String(sp.totalCourses) : '—' },
            {
              label: 'Rating',
              value: rating > 0 ? (
                <span className="flex items-center justify-center gap-1">
                  {rating.toFixed(1)}
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </span>
              ) : '—',
            },
            { label: 'Reviews', value: ratingCount > 0 ? ratingCount.toLocaleString() : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted/30 py-4 text-center">
              <div className="text-xl font-bold text-foreground">{value}</div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Specialties + Credentials */}
          <div className="md:col-span-1 space-y-6">
            {sp.specialties.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 border-b pb-2 text-sm">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Specialties
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sp.specialties.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {sp.credentials.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 border-b pb-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Credentials
                </h3>
                <div className="space-y-4">
                  {sp.credentials.map((cred, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{cred.title}</div>
                        <div className="text-xs text-muted-foreground">{cred.institution}</div>
                        <div className="text-xs text-muted-foreground">{cred.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Tabs */}
          <div className="md:col-span-2">
            <div className="flex gap-6 border-b mb-6">
              {(
                [
                  { id: 'credentials' as ProfileTab, label: 'About', Icon: Users },
                  { id: 'about' as ProfileTab, label: 'Courses', Icon: Video },
                ] as const
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'pb-3 text-sm font-semibold transition-colors relative',
                    activeTab === id
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </div>
                  {activeTab === id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'credentials' && (
              <div className="space-y-4">
                {sp.bio ? (
                  <div className="bg-muted/30 border rounded-xl p-5">
                    <h4 className="font-semibold text-sm mb-2">About this Scholar</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">{sp.bio}</p>
                  </div>
                ) : null}
                <div className="bg-muted/30 border rounded-xl p-5">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    Teaching Languages
                  </h4>
                  {sp.teachingLanguages.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {sp.teachingLanguages.map((lang) => (
                        <span
                          key={lang}
                          className="px-3 py-1 border rounded-full text-xs font-medium"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not specified</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Video className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">Courses coming soon</p>
                <p className="text-xs mt-1">This scholar's courses will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScholarProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Skeleton className="h-48 w-full rounded-b-xl" />
      <div className="px-4 sm:px-6 -mt-16 space-y-4">
        <div className="flex justify-between items-end">
          <Skeleton className="h-28 w-28 rounded-full" />
          <div className="flex gap-3">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-4 gap-px">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
