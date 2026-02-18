import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PostCard } from './PostCard';
import { CreatePostComposer } from './CreatePostComposer';
import { usePost } from './usePosts';

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = usePost(id);
  const [showComposer, setShowComposer] = useState(true);

  if (isLoading) return <PostDetailSkeleton />;
  if (isError || !data) {
    return (
      <div className="max-w-[600px] mx-auto p-8 text-center">
        <p className="text-muted-foreground mb-4">Post not found</p>
        <Link to="/feed">
          <Button variant="outline" size="sm">Back to Feed</Button>
        </Link>
      </div>
    );
  }

  const { post, replies } = data;

  return (
    <div className="max-w-[600px] mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border flex items-center gap-3 px-4 py-2.5">
        <Link to="/feed" className="text-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Post</h1>
      </div>

      {/* Main post */}
      <PostCard post={post} />

      {/* Reply composer */}
      {showComposer && (
        <CreatePostComposer
          replyTo={post._id}
          placeholder={`Reply to @${post.author.username}...`}
          onSuccess={() => setShowComposer(true)}
          compact
        />
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div>
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
            Replies ({replies.length})
          </div>
          {replies.map((reply) => (
            <PostCard key={reply._id} post={reply} compact />
          ))}
        </div>
      )}

      {replies.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No replies yet. Be the first to reply!
        </div>
      )}
    </div>
  );
}

function PostDetailSkeleton() {
  return (
    <div className="max-w-[600px] mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="px-4 py-3 border-b border-border flex gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
