import { useState, useCallback, useEffect } from 'react';
import { HadithCard } from '../hadith/HadithCard';
import { useHadithDetail } from '../hadith/useHadith';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Bookmark,
  FolderPlus,
  Folder,
  ChevronRight,
  Plus,
  X,
  Loader2,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  useCollections,
  useCreateCollection,
  useDeleteCollection,
  type HadithCollection,
} from './useCollections';
import { ShareActionsMenu } from '@/features/share/ShareActionsMenu';
import type { SharePayload } from '@/features/share/types';

// ── View Mode ────────────────────────────────────────

type ViewMode = 'all' | 'collection';

// ── EMOJI_OPTIONS ────────────────────────────────────

const EMOJI_OPTIONS = ['📖', '🌙', '⭐', '🤲', '🕌', '💎', '🌺', '📚', '❤️', '🔖'];

export function SavedPage() {
  const { user, isAuthenticated, updateSaved } = useAuthStore();
  const savedIds = user?.saved ?? [];

  // View mode: "all" saved vs a specific collection
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [activeCollection, setActiveCollection] = useState<HadithCollection | null>(null);

  // Index for paging through hadiths
  const [index, setIndex] = useState(0);

  // New collection form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📖');

  // Collections query
  const { data: collections } = useCollections();
  const createCollection = useCreateCollection();
  const deleteCollection = useDeleteCollection();

  // Active hadith IDs based on view mode
  const activeHadithIds =
    viewMode === 'collection' && activeCollection
      ? activeCollection.hadithIds
      : savedIds;

  // Clamp index when list shrinks
  useEffect(() => {
    if (activeHadithIds.length > 0 && index >= activeHadithIds.length) {
      setIndex(activeHadithIds.length - 1);
    }
  }, [activeHadithIds.length, index]);

  const currentId = activeHadithIds.length > 0 ? String(activeHadithIds[index]) : null;
  const { data: hadithDetail, isLoading } = useHadithDetail(currentId);

  const isBookmarked = currentId ? savedIds.includes(currentId) : false;

  // ── Handlers ─────────────────────────────────────
  const handleBookmark = useCallback(async () => {
    if (!isAuthenticated || !currentId) {
      toast.error('Please sign in to manage bookmarks');
      return;
    }

    updateSaved(currentId);

    try {
      const res = await api.put(`/user/saved/${currentId}`);
      if (!res.data.success) throw new Error();
      toast.success('Bookmark updated');
    } catch {
      updateSaved(currentId);
      toast.error('Failed to update bookmark');
    }
  }, [isAuthenticated, currentId, updateSaved]);

  const sharePayload: SharePayload | null = hadithDetail && currentId
    ? {
      kind: 'hadith',
      title: hadithDetail.title || 'Saved Hadith',
      text: hadithDetail.hadeeth,
      url: `${window.location.origin}/saved`,
      feedCaption: `Sharing a saved hadith: ${hadithDetail.title}`,
      sharedContent: {
        kind: 'hadith',
        title: hadithDetail.title,
        sourceRef: hadithDetail.reference,
        sourceRoute: '/saved',
        excerpt: hadithDetail.hadeeth,
        meta: [
          viewMode === 'collection' && activeCollection
            ? `${activeCollection.emoji} ${activeCollection.name}`
            : 'Saved Hadiths',
          `Hadith #${currentId}`,
        ],
      },
    }
    : null;

  const handlePrev = useCallback(() => {
    if (activeHadithIds.length > 0) {
      setIndex((i) => (i - 1 + activeHadithIds.length) % activeHadithIds.length);
    }
  }, [activeHadithIds.length]);

  const handleNext = useCallback(() => {
    if (activeHadithIds.length > 0) {
      setIndex((i) => (i + 1) % activeHadithIds.length);
    }
  }, [activeHadithIds.length]);

  const handleCreateCollection = useCallback(async () => {
    if (!newName.trim()) return;
    await createCollection.mutateAsync({ name: newName.trim(), emoji: newEmoji });
    setNewName('');
    setNewEmoji('📖');
    setShowNewForm(false);
  }, [newName, newEmoji, createCollection]);

  const handleSwitchToCollection = useCallback(
    (col: HadithCollection) => {
      setActiveCollection(col);
      setViewMode('collection');
      setIndex(0);
    },
    []
  );

  const handleSwitchToAll = useCallback(() => {
    setActiveCollection(null);
    setViewMode('all');
    setIndex(0);
  }, []);

  // ── Empty states ─────────────────────────────────
  if (!isAuthenticated) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Bookmark className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">Sign in to see saved hadiths</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Create an account or sign in to bookmark your favorite hadiths and access them anytime.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header / Tabs ─────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSwitchToAll}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors',
              viewMode === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'hover:bg-secondary'
            )}
          >
            <Bookmark className="h-3.5 w-3.5" />
            All Saved
            <span className="ml-1 text-xs opacity-70">({savedIds.length})</span>
          </button>

          {collections?.map((col) => (
            <button
              key={col._id}
              onClick={() => handleSwitchToCollection(col)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors group',
                viewMode === 'collection' && activeCollection?._id === col._id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-secondary'
              )}
            >
              <span>{col.emoji}</span>
              {col.name}
              <span className="ml-1 text-xs opacity-70">({col.hadithIds.length})</span>
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNewForm(!showNewForm)}
        >
          {showNewForm ? <X className="h-4 w-4" /> : <FolderPlus className="h-4 w-4 mr-1.5" />}
          {showNewForm ? '' : 'New Collection'}
        </Button>
      </div>

      {/* ── New Collection Form ──────────────────── */}
      {showNewForm && (
        <Card className="animate-fade-in">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setNewEmoji(e)}
                    className={cn(
                      'w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors',
                      newEmoji === e ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-secondary'
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                autoFocus
                placeholder="Collection name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                maxLength={50}
              />
              <Button
                onClick={handleCreateCollection}
                disabled={!newName.trim() || createCollection.isPending}
              >
                {createCollection.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Collection info bar ─────────────────── */}
      {viewMode === 'collection' && activeCollection && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">{activeCollection.emoji}</span>
            <span className="font-medium">{activeCollection.name}</span>
            <span className="text-muted-foreground">
              · {activeCollection.hadithIds.length} hadith
              {activeCollection.hadithIds.length !== 1 ? 's' : ''}
            </span>
          </div>
          {!activeCollection.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (confirm(`Delete "${activeCollection.name}"?`)) {
                  deleteCollection.mutate(activeCollection._id);
                  handleSwitchToAll();
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      )}

      {/* ── Hadith viewer ───────────────────────── */}
      {activeHadithIds.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            {viewMode === 'collection' ? (
              <>
                <Folder className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">This collection is empty</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Add hadiths to this collection from the hadith viewer using the folder icon.
                </p>
              </>
            ) : (
              <>
                <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved hadiths yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Browse the daily hadiths and tap the bookmark icon to save your favorites here.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {activeHadithIds.length} hadith{activeHadithIds.length !== 1 ? 's' : ''}
            </p>
          </div>

          <HadithCard
            hadith={hadithDetail}
            isLoading={isLoading}
            isBookmarked={isBookmarked}
            onBookmark={handleBookmark}
            shareAction={sharePayload ? <ShareActionsMenu payload={sharePayload} /> : undefined}
            onPrev={handlePrev}
            onNext={handleNext}
            currentIndex={index}
            totalCount={activeHadithIds.length}
            label={
              viewMode === 'collection' && activeCollection
                ? `${activeCollection.emoji} ${activeCollection.name}`
                : 'Saved Hadith'
            }
          />
        </>
      )}

      {/* ── Collections sidebar (when in "all" mode) ── */}
      {viewMode === 'all' && collections && collections.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Your Collections
          </h3>
          {collections.map((col) => (
            <button
              key={col._id}
              onClick={() => handleSwitchToCollection(col)}
              className="flex items-center justify-between w-full rounded-lg border p-3 hover:bg-secondary/50 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{col.emoji}</span>
                <div>
                  <p className="text-sm font-medium">{col.name}</p>
                  {col.description && (
                    <p className="text-xs text-muted-foreground">{col.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{col.hadithIds.length}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
