import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useCreatePost } from './usePosts';

interface CreatePostComposerProps {
  replyTo?: string;
  placeholder?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

const MAX_CHARS = 500;

export function CreatePostComposer({
  replyTo,
  placeholder = "What's on your mind?",
  onSuccess,
  compact = false,
}: CreatePostComposerProps) {
  const user = useAuthStore((s) => s.user);
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createPost = useCreatePost();

  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const canPost = content.trim().length > 0 && !isOverLimit && !createPost.isPending;

  const handleSubmit = () => {
    if (!canPost) return;
    createPost.mutate(
      { content: content.trim(), replyTo },
      {
        onSuccess: () => {
          setContent('');
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
          }
          onSuccess?.();
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setContent(textarea.value);
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  if (!user) return null;

  return (
    <div className={`flex gap-3 ${compact ? 'px-3 py-2' : 'px-4 py-3'} border-b border-border`}>
      <Avatar src={user.avatar} fallback={user.name[0]} size={compact ? 'sm' : 'md'} />

      <div className="flex-1 min-w-0">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={autoResize}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={compact ? 1 : 2}
          className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-[15px] leading-relaxed"
          maxLength={MAX_CHARS + 50} // Allow slight overflow for better UX
        />

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {/* Character counter */}
            {content.length > 0 && (
              <div className="flex items-center gap-1.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted/30"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${(1 - charsLeft / MAX_CHARS) * 63} 63`}
                    strokeLinecap="round"
                    transform="rotate(-90 12 12)"
                    className={
                      isOverLimit
                        ? 'text-red-500'
                        : charsLeft < 50
                          ? 'text-yellow-500'
                          : 'text-primary'
                    }
                  />
                </svg>
                {charsLeft < 50 && (
                  <span
                    className={`text-xs font-medium ${
                      isOverLimit ? 'text-red-500' : 'text-yellow-500'
                    }`}
                  >
                    {charsLeft}
                  </span>
                )}
              </div>
            )}
          </div>

          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!canPost}
            className="gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            {replyTo ? 'Reply' : 'Post'}
          </Button>
        </div>
      </div>
    </div>
  );
}
