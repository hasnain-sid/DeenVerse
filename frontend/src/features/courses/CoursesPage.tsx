import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Users, PlayCircle, Video, BookOpen, Loader2 } from 'lucide-react';
import { useCourses, useFeaturedCourses, type Course } from './useCourses';
import type { CourseCategory, CourseLevel, CourseType } from '@deenverse/shared';

const CATEGORIES: CourseCategory[] = [
  'quran', 'hadith', 'fiqh', 'aqeedah', 'seerah', 'arabic', 'tajweed', 'tafseer', 'dawah',
];
const LEVELS: CourseLevel[] = ['beginner', 'intermediate', 'advanced'];
const TYPES: CourseType[] = ['self-paced', 'instructor-led'];

const CATEGORY_LABELS: Record<CourseCategory, string> = {
  quran: 'Quran',
  hadith: 'Hadith',
  fiqh: 'Fiqh',
  aqeedah: 'Aqeedah',
  seerah: 'Seerah',
  arabic: 'Arabic',
  tajweed: 'Tajweed',
  tafseer: 'Tafseer',
  dawah: "Da'wah",
  other: 'Other',
};

const LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const TYPE_LABELS: Record<CourseType, string> = {
  'self-paced': 'Self-paced',
  'instructor-led': 'Instructor-led',
  hybrid: 'Hybrid',
};

type SortOption = 'popular' | 'newest' | 'rating' | 'price-low' | 'price-high';

const SORT_LABELS: Record<SortOption, string> = {
  popular: 'Most Popular',
  newest: 'Newest',
  rating: 'Highest Rated',
  'price-low': 'Price: Low to High',
  'price-high': 'Price: High to Low',
};

function CourseCard({ course }: { course: Course }) {
  const isFree = course.pricing.type === 'free';
  const isLive = course.type === 'instructor-led' || course.type === 'hybrid';

  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all hover:border-primary/30 h-full"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <BookOpen className="size-10 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-background/90 text-foreground text-xs px-2 py-1 rounded-md flex items-center gap-1 font-medium shadow-sm backdrop-blur-sm">
          {isLive ? <Video size={12} /> : <PlayCircle size={12} />}
          {isLive ? 'Live' : 'On-demand'}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            {CATEGORY_LABELS[course.category] ?? course.category}
          </span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {LEVEL_LABELS[course.level] ?? course.level}
          </span>
        </div>

        <h3 className="font-bold text-base leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        <div className="flex items-center gap-2 mb-3 mt-auto pt-2">
          {course.instructor.avatar && (
            <img
              src={course.instructor.avatar}
              alt={course.instructor.name}
              className="w-6 h-6 rounded-full object-cover border border-border"
            />
          )}
          <span className="text-sm text-muted-foreground truncate">{course.instructor.name}</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1 text-amber-500 font-medium">
            <Star size={14} className="fill-amber-500" />
            <span>{course.rating.average.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{course.enrollmentCount.toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between mt-auto">
          <span className="font-bold text-lg">
            {isFree ? 'Free' : `$${course.pricing.amount ?? 0}`}
          </span>
          <span className="text-sm text-primary font-medium hover:underline">View Course</span>
        </div>
      </div>
    </Link>
  );
}

export function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CourseCategory[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<CourseLevel[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<CourseType[]>([]);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sort, setSort] = useState<SortOption>('popular');

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    clearTimeout((handleSearchChange as { _t?: ReturnType<typeof setTimeout> })._t);
    (handleSearchChange as { _t?: ReturnType<typeof setTimeout> })._t = setTimeout(
      () => setDebouncedSearch(value),
      400,
    );
  };

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
      level: selectedLevels.length === 1 ? selectedLevels[0] : undefined,
      type: selectedTypes.length === 1 ? selectedTypes[0] : undefined,
      sort,
    }),
    [debouncedSearch, selectedCategories, selectedLevels, selectedTypes, sort],
  );

  const { data, isLoading, isError } = useCourses(filters);
  const { data: featuredData } = useFeaturedCourses();

  // Client-side multi-select filter on top of API results
  const courses = useMemo(() => {
    const list = data?.courses ?? [];
    return list.filter((course) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(course.category);
      const matchesLevel =
        selectedLevels.length === 0 || selectedLevels.includes(course.level);
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(course.type);
      const matchesPrice =
        priceFilter === 'all'
          ? true
          : priceFilter === 'free'
            ? course.pricing.type === 'free'
            : course.pricing.type !== 'free';
      return matchesCategory && matchesLevel && matchesType && matchesPrice;
    });
  }, [data, selectedCategories, selectedLevels, selectedTypes, priceFilter]);

  const featuredCourses = featuredData?.courses ?? [];

  const toggleCategory = (cat: CourseCategory) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  const toggleLevel = (lvl: CourseLevel) =>
    setSelectedLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl],
    );
  const toggleType = (type: CourseType) =>
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedLevels.length > 0 ||
    selectedTypes.length > 0 ||
    priceFilter !== 'all' ||
    searchQuery !== '';

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSelectedTypes([]);
    setPriceFilter('all');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row p-4 md:p-8 gap-6 max-w-[1600px] mx-auto">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Filter size={20} className="text-primary" />
            Filters
          </h2>

          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wider">
                Category
              </h3>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4 bg-background"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">
                      {CATEGORY_LABELS[cat]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Level */}
            <div>
              <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wider">
                Level
              </h3>
              <div className="space-y-2">
                {LEVELS.map((lvl) => (
                  <label key={lvl} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4 bg-background"
                      checked={selectedLevels.includes(lvl)}
                      onChange={() => toggleLevel(lvl)}
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">
                      {LEVEL_LABELS[lvl]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wider">
                Price
              </h3>
              <div className="space-y-2">
                {(['all', 'free', 'paid'] as const).map((price) => (
                  <label key={price} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="price"
                      className="border-input text-primary focus:ring-primary h-4 w-4 bg-background"
                      checked={priceFilter === price}
                      onChange={() => setPriceFilter(price)}
                    />
                    <span className="text-sm capitalize group-hover:text-primary transition-colors">
                      {price === 'all' ? 'All' : price === 'free' ? 'Free' : 'Paid'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Format */}
            <div>
              <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wider">
                Format
              </h3>
              <div className="space-y-2">
                {TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4 bg-background"
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleType(type)}
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">
                      {TYPE_LABELS[type]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={20}
          />
          <input
            type="text"
            placeholder="Search courses, scholars, topics..."
            className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Featured Courses (only shown when no filters active) */}
        {!hasActiveFilters && featuredCourses.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Featured Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredCourses.slice(0, 3).map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </section>
        )}

        {/* Results Header */}
        <div className="flex justify-between items-center pb-4 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight">
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={20} className="animate-spin" /> Loading...
              </span>
            ) : (
              <>
                {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
              </>
            )}
          </h1>

          <select
            className="h-10 px-3 rounded-md border border-input bg-card text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
          >
            {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Error state */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl">
            <BookOpen size={48} className="text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-bold mb-2">Failed to load courses</h3>
            <p className="text-muted-foreground max-w-md">
              Something went wrong. Please try again later.
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden bg-card animate-pulse">
                <div className="aspect-video bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Course Grid */}
        {!isLoading && !isError && (
          <>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl">
                <BookOpen size={48} className="text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-bold mb-2">No courses found</h3>
                <p className="text-muted-foreground max-w-md">
                  Try adjusting your filters or search query to find what you're looking for.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
