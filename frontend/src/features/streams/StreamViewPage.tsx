import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Radio,
  Users,
  Send,
  ArrowLeft,
  Maximize,
  Minimize,
  MessageSquare,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { getSocket } from '@/lib/socket';
import { useStream } from './useStreams';
import type { StreamChatMessage } from '@/types/stream';

export function StreamViewPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useStream(id);
  const stream = data?.stream;
  const user = useAuthStore((s) => s.user);

  const [chatMessages, setChatMessages] = useState<StreamChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Join stream room via socket
  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit('stream:join', id);
    setViewerCount(stream?.viewerCount ?? 0);

    socket.on('stream:chat:message', (msg: StreamChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on('stream:viewer:count', (count: number) => {
      setViewerCount(count);
    });

    socket.on('stream:ended', () => {
      // Stream ended, could show a banner
    });

    return () => {
      socket.emit('stream:leave', id);
      socket.off('stream:chat:message');
      socket.off('stream:viewer:count');
      socket.off('stream:ended');
    };
  }, [id, stream?.viewerCount]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Setup HLS player (if playbackUrl available)
  useEffect(() => {
    if (!stream?.playbackUrl || !videoRef.current) return;

    const video = videoRef.current;

    // Try native HLS support (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream.playbackUrl;
      video.play().catch(() => {});
      return;
    }

    // For other browsers, we'd use hls.js – lazy load it
    let hls: any;
    import('hls.js')
      .then(({ default: Hls }) => {
        if (!Hls.isSupported()) return;
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream.playbackUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
      })
      .catch(() => {
        // hls.js not installed — show placeholder
      });

    return () => {
      if (hls) hls.destroy();
    };
  }, [stream?.playbackUrl]);

  const sendChatMessage = useCallback(() => {
    if (!chatInput.trim() || !id) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit('stream:chat:send', { streamId: id, content: chatInput.trim() });
    setChatInput('');
  }, [chatInput, id]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Radio className="h-16 w-16 text-muted-foreground/20" />
        <p className="text-muted-foreground">Stream not found</p>
        <Link to="/streams">
          <Button variant="ghost">Back to streams</Button>
        </Link>
      </div>
    );
  }

  const isLive = stream.status === 'live';

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto">
      <div className={cn('flex gap-4', isFullscreen ? 'h-screen' : '', showChat ? 'flex-col lg:flex-row' : '')}>
        {/* Video + Info */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Back */}
          <Link to="/streams" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to streams
          </Link>

          {/* Player */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
            {stream.playbackUrl ? (
              <video
                ref={videoRef}
                className="w-full h-full"
                controls={false}
                muted={isMuted}
                playsInline
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
                <Radio className="h-16 w-16 opacity-30" />
                <p className="text-sm opacity-60">
                  {isLive ? 'Connecting to stream...' : 'Stream is not live yet'}
                </p>
              </div>
            )}

            {/* Player overlay controls */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-end justify-between">
              <div className="flex items-center gap-3">
                {isLive && (
                  <div className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-white/80 text-xs">
                  <Users className="h-3.5 w-3.5" />
                  {viewerCount} watching
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <button onClick={toggleFullscreen} className="text-white/80 hover:text-white transition-colors">
                  {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className={cn(
                    'text-white/80 hover:text-white transition-colors lg:hidden',
                    showChat && 'text-primary'
                  )}
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Stream info */}
          <div className="flex items-start gap-3">
            <Avatar fallback={stream.host.name} src={stream.host.avatar} />
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight">{stream.title}</h1>
              <Link
                to={`/user/${stream.host.username}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {stream.host.name} @{stream.host.username}
              </Link>
              {stream.description && (
                <p className="text-sm text-muted-foreground mt-2">{stream.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Live Chat */}
        {showChat && stream.chatEnabled && (
          <div
            className={cn(
              'border rounded-xl flex flex-col bg-card',
              isFullscreen ? 'w-80' : 'lg:w-80 w-full h-96 lg:h-auto'
            )}
          >
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-semibold">Live Chat</span>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-muted-foreground hover:text-foreground text-xs hidden lg:block"
              >
                Hide
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
              {chatMessages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No messages yet. Say Salam! 👋
                </p>
              )}
              {chatMessages.map((msg) => (
                <div key={msg._id} className="flex items-start gap-2">
                  <Avatar fallback={msg.sender.name} src={msg.sender.avatar} size="sm" />
                  <div>
                    <span className="text-xs font-semibold text-primary">{msg.sender.name}</span>
                    <p className="text-xs text-foreground">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            {user ? (
              <div className="p-3 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendChatMessage();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Send a message..."
                    className="text-xs h-8"
                    maxLength={200}
                  />
                  <Button type="submit" size="sm" disabled={!chatInput.trim()} className="h-8 w-8 p-0 shrink-0">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </div>
            ) : (
              <div className="p-3 border-t text-center">
                <Link to="/login" className="text-xs text-primary hover:underline">
                  Sign in to chat
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
