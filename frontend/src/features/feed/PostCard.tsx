import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Repeat2, Share, Trash2, MoreHorizontal } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useToggleLike, useToggleRepost, useDeletePost } from './usePosts';
import { formatDate } from '@/lib/utils';
import type { Post } from '@/types/post';
import { SharedContentCard } from './SharedContentCard';
import toast from 'react-hot-toast';

interface PostCardProps {
  post: Post;
  compact?: boolean;
}

export function PostCard({ post, compact = false }: PostCardProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const likeMutation = useToggleLike();
  const repostMutation = useToggleRepost();
  const deleteMutation = useDeletePost();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const isLiked = user ? post.likes.includes(user._id) : false;
  const isReposted = user ? post.reposts.includes(user._id) : false;
  const isOwner = user?._id === post.author._id;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking a button or link
    if ((e.target as HTMLElement).closest('button, a')) return;
    navigate(`/post/${post._id}`);
  };

  // Parse content for #hashtags and @mentions (including Arabic characters)
  const renderContent = (text: string) => {
    const parts = text.split(/(#[\w\u0600-\u06FF]+|@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <Link
            key={i}
            to={`/search?q=${encodeURIComponent(part)}&tab=hashtags`}
            className="text-primary hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        );
      }
      if (part.startsWith('@')) {
        return (
          <Link
            key={i}
            to={`/user/${part.slice(1)}`}
            className="text-primary hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  return (
    <div
      className="py-6 group transition-colors hover:bg-muted/20 -mx-4 px-4 sm:rounded-lg sm:hover:bg-transparent sm:px-0 border-b border-border/40 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Reply indicator */}
      {post.replyTo && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 ml-12">
          <MessageCircle className="w-3 h-3" />
          <span>
            Replying to{' '}
            <Link
              to={`/user/${post.replyTo.author.username}`}
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              @{post.replyTo.author.username}
            </Link>
          </span>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <Link
          to={`/user/${post.author.username}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
          aria-label={`View ${post.author.name}'s profile`}
        >
          <Avatar src={post.author.avatar} fallback={post.author.name?.[0] || '?'} size="md" />
        </Link>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Link
                to={`/user/${post.author.username}`}
                className="font-semibold text-foreground hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {post.author.name}
              </Link>
              <Link
                to={`/user/${post.author.username}`}
                className="text-muted-foreground text-sm truncate"
                onClick={(e) => e.stopPropagation()}
              >
                @{post.author.username}
              </Link>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm whitespace-nowrap">
                {formatDate(post.createdAt)}
              </span>
            </div>

            {/* Menu */}
            {isOwner && (
              <div className="relative" ref={menuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
                {showMenu && (
                  <div className="absolute right-0 top-8 z-50 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[140px]">
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-muted/50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(post._id);
                        setShowMenu(false);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <p className={`text-foreground mt-1 whitespace-pre-wrap break-words ${compact ? 'text-sm' : ''}`}>
            {renderContent(post.content)}
          </p>

          {post.sharedContent && <SharedContentCard sharedContent={post.sharedContent} />}

          {/* Hadith reference badge */}
          {post.hadithRef && !post.sharedContent && (
            <div className="mt-3 text-xs text-primary mb-2 font-medium uppercase tracking-wider">
              📖 Hadith #{post.hadithRef}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-1 mt-2 -ml-2">
            {/* Reply */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-blue-500 gap-1.5 text-xs transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/post/${post._id}`);
              }}
            >
              <MessageCircle className="w-4 h-4" />
              {post.replyCount > 0 ? <span>{post.replyCount}</span> : <span>Reply</span>}
            </Button>

            {/* Repost */}
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 gap-1.5 text-xs transition-colors ${isReposted
                ? 'text-green-500 hover:text-green-600'
                : 'text-muted-foreground hover:text-green-500'
                }`}
              onClick={(e) => {
                e.stopPropagation();
                repostMutation.mutate(post._id);
              }}
            >
              <Repeat2 className="w-4 h-4" />
              {post.repostCount > 0 ? <span>{post.repostCount}</span> : <span>Repost</span>}
            </Button>

            {/* Like */}
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 gap-1.5 text-xs transition-colors ${isLiked
                ? 'text-red-500 hover:text-red-600'
                : 'text-muted-foreground hover:text-rose-500'
                }`}
              onClick={(e) => {
                e.stopPropagation();
                likeMutation.mutate(post._id);
              }}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {post.likeCount > 0 ? <span>{post.likeCount}</span> : <span>Like</span>}
            </Button>

            {/* Share */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-green-500 gap-1.5 text-xs transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(
                  `${window.location.origin}/post/${post._id}`,
                );
                toast.success('Link copied!');
              }}
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
