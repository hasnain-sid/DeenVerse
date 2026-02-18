import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ArrowLeft, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { useSocketStore } from '@/stores/socketStore';
import { getSocket } from '@/lib/socket';
import {
  useConversations,
  useMessages,
  useSendMessage,
  type ConversationData,
  type MessageData,
} from './useChat';

export function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const user = useAuthStore((s) => s.user);
  const isUserOnline = useSocketStore((s) => s.isUserOnline);

  const { data: convData, isLoading: convsLoading } = useConversations();
  const { data: msgData, isLoading: msgsLoading } = useMessages(activeConversation);
  const sendMessage = useSendMessage();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgData?.messages]);

  // Join the conversation room via Socket.IO when selected
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeConversation) return;

    socket.emit('chat:join', activeConversation);

    // Listen for new messages in this conversation
    const handleMessage = (_message: MessageData) => {
      // Invalidate messages query to refetch
      // (handled by useSocket's global handler)
    };
    socket.on('chat:message', handleMessage);

    return () => {
      socket.emit('chat:leave', activeConversation);
      socket.off('chat:message', handleMessage);
    };
  }, [activeConversation]);

  const handleSend = () => {
    if (!messageInput.trim() || !activeConversation) return;
    sendMessage.mutate(
      { conversationId: activeConversation, content: messageInput.trim() },
      { onSuccess: () => setMessageInput('') }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getOtherParticipant = (conv: ConversationData) => {
    return conv.participants.find((p) => p._id !== user?._id) ?? conv.participants[0];
  };

  const filteredConversations = convData?.conversations.filter((conv) => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(conv);
    return (
      other.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      other.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const activeConvData = convData?.conversations.find((c) => c._id === activeConversation);
  const activeOtherUser = activeConvData ? getOtherParticipant(activeConvData) : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden rounded-lg border bg-card">
      {/* ── Conversation List (Left Panel) ──────────── */}
      <div
        className={cn(
          'w-full md:w-80 lg:w-96 border-r flex flex-col shrink-0',
          activeConversation ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Conversation items */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations && filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isActive = conv._id === activeConversation;
              const online = isUserOnline(other._id);

              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConversation(conv._id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left',
                    isActive && 'bg-secondary'
                  )}
                >
                  <div className="relative">
                    <Avatar fallback={other.name} src={other.avatar} size="sm" />
                    {online && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{other.name}</p>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(conv.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Visit a user's profile to start a conversation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Chat View (Right Panel) ───────────────── */}
      <div
        className={cn(
          'flex-1 flex flex-col',
          !activeConversation ? 'hidden md:flex' : 'flex'
        )}
      >
        {activeConversation && activeOtherUser ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 p-4 border-b">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveConversation(null)}
                className="md:hidden h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Avatar fallback={activeOtherUser.name} src={activeOtherUser.avatar} size="sm" />
                {isUserOnline(activeOtherUser._id) && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">{activeOtherUser.name}</p>
                <p className="text-xs text-muted-foreground">
                  {isUserOnline(activeOtherUser._id) ? 'Online' : `@${activeOtherUser.username}`}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                      <Skeleton className="h-10 w-48 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : (
                msgData?.messages.map((msg) => {
                  const isMine = msg.sender._id === user?._id;
                  return (
                    <div key={msg._id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn(
                          'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                          isMine
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-secondary text-secondary-foreground rounded-bl-md'
                        )}
                      >
                        <p>{msg.content}</p>
                        <p
                          className={cn(
                            'text-[10px] mt-1',
                            isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!messageInput.trim() || sendMessage.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageCircle className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold mb-1">Your Messages</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Select a conversation to start chatting, or visit a user's profile to send them a message.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
