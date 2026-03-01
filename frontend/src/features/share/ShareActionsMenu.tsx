import { useMemo, useState } from 'react';
import {
  Copy,
  Mail,
  Send,
  Share2,
  SquareArrowOutUpRight,
  MessageCircle,
  Rss,
  Link2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useShareConfig, useShareToFeed } from './useShare';
import type { SharePayload } from './types';

interface ShareActionsMenuProps {
  payload: SharePayload;
  iconOnly?: boolean;
}

function socialShareUrl(platform: 'x' | 'telegram' | 'whatsapp' | 'email', payload: SharePayload) {
  const encodedUrl = encodeURIComponent(payload.url);
  const encodedText = encodeURIComponent(`${payload.title}\n\n${payload.text}`);

  switch (platform) {
    case 'x':
      return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${payload.title}\n${payload.url}`)}`;
    case 'email':
      return `mailto:?subject=${encodeURIComponent(payload.title)}&body=${encodeURIComponent(`${payload.text}\n\n${payload.url}`)}`;
    default:
      return payload.url;
  }
}

export function ShareActionsMenu({ payload, iconOnly = true }: ShareActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { data: config } = useShareConfig(payload.kind);
  const shareToFeed = useShareToFeed();

  const canUseNative = useMemo(() => typeof navigator !== 'undefined' && !!navigator.share, []);

  const handleNativeShare = async () => {
    if (!canUseNative) {
      toast.error('Native share is not available on this device');
      return;
    }

    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      });
      setOpen(false);
    } catch (err) {
      // User cancelled the native share dialog — not an error
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error('Share failed');
    }
  };

  const handleCopy = async (mode: 'link' | 'text') => {
    const value = mode === 'link' ? payload.url : `${payload.title}\n\n${payload.text}\n\n${payload.url}`;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(mode === 'link' ? 'Link copied' : 'Text copied');
      setOpen(false);
    } catch {
      toast.error('Copy failed');
    }
  };

  const openSocial = (platform: 'x' | 'telegram' | 'whatsapp' | 'email') => {
    window.open(socialShareUrl(platform, payload), '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  const handleShareToFeed = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to share to feed');
      return;
    }

    shareToFeed.mutate({
      content: payload.feedCaption,
      sharedContent: payload.sharedContent,
    });
    setOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size={iconOnly ? 'icon' : 'sm'}
        className={iconOnly ? 'h-8 w-8' : 'gap-1.5'}
        onClick={() => setOpen((value) => !value)}
      >
        <Share2 className="h-4 w-4" />
        {!iconOnly && <span>Share</span>}
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-border bg-background p-2 shadow-lg">
          <div className="space-y-1">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
              onClick={handleNativeShare}
              disabled={!canUseNative}
            >
              <SquareArrowOutUpRight className="h-4 w-4" />
              Native Share
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
              onClick={() => handleCopy('link')}
            >
              <Link2 className="h-4 w-4" />
              Copy Link
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
              onClick={() => handleCopy('text')}
            >
              <Copy className="h-4 w-4" />
              Copy Text
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
              onClick={() => openSocial('whatsapp')}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
              onClick={() => openSocial('telegram')}
            >
              <Send className="h-4 w-4" />
              Telegram
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
              onClick={() => openSocial('x')}
            >
              <Rss className="h-4 w-4" />
              X (Twitter)
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
              onClick={() => openSocial('email')}
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
            {config?.supportsShareToFeed && (
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-primary hover:bg-secondary"
                onClick={handleShareToFeed}
                disabled={shareToFeed.isPending}
              >
                <Share2 className="h-4 w-4" />
                Share to Feed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
