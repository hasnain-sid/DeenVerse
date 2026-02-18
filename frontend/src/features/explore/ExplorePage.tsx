import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ChevronRight, ArrowLeft, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useRootCategories,
  useSubCategories,
  CATEGORY_EMOJI,
  type HadithCategory,
} from '@/features/hadith/useHadith';
import { cn } from '@/lib/utils';

export function ExplorePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Breadcrumb-style navigation stack
  const [stack, setStack] = useState<{ id: string; title: string }[]>([]);
  const currentParentId = stack.length > 0 ? stack[stack.length - 1].id : null;

  // Fetch categories
  const { data: roots, isLoading: rootsLoading } = useRootCategories();
  const { data: subs, isLoading: subsLoading } = useSubCategories(currentParentId);

  const categories = currentParentId ? subs : roots;
  const isLoading = currentParentId ? subsLoading : rootsLoading;

  // Filter by search
  const filtered = categories?.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCategoryClick = (cat: HadithCategory) => {
    const count = Number(cat.hadeeths_count);

    // If the category has a manageable number of hadiths, go directly to the hadith viewer
    // Otherwise, drill into subcategories
    if (count > 0 && count <= 100) {
      navigate(`/hadith?category=${cat.id}&title=${encodeURIComponent(cat.title)}`);
    } else {
      setStack([...stack, { id: cat.id, title: cat.title }]);
      setSearch('');
    }
  };

  const handleBack = () => {
    setStack(stack.slice(0, -1));
    setSearch('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          className="pl-10 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Breadcrumb */}
      {stack.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStack([]);
              setSearch('');
            }}
            className="text-xs px-2 h-7"
          >
            All Topics
          </Button>
          {stack.map((item, i) => (
            <div key={item.id} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStack(stack.slice(0, i + 1));
                  setSearch('');
                }}
                className={cn(
                  'text-xs px-2 h-7',
                  i === stack.length - 1 && 'text-primary font-medium'
                )}
              >
                {item.title}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Back button */}
      {stack.length > 0 && (
        <Button variant="outline" size="sm" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
      )}

      {/* Categories heading */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {stack.length === 0 ? 'Browse by Topic' : stack[stack.length - 1].title}
        </h3>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        )}

        {/* Categories grid */}
        {!isLoading && filtered && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map((cat) => (
              <Card
                key={cat.id}
                className="cursor-pointer hover:bg-secondary/50 hover:border-primary/20 transition-colors group"
                onClick={() => handleCategoryClick(cat)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-2xl shrink-0">
                    {CATEGORY_EMOJI[cat.id] ?? '📄'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {cat.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cat.hadeeths_count} hadiths
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && filtered && filtered.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {search
                  ? `No categories matching "${search}"`
                  : 'No subcategories in this topic'}
              </p>
              {stack.length > 0 && !search && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() =>
                    navigate(
                      `/hadith?category=${currentParentId}&title=${encodeURIComponent(
                        stack[stack.length - 1].title
                      )}`
                    )
                  }
                >
                  View Hadiths in this Category
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
