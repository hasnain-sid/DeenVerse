import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LiveKitRoom,
  ParticipantTile,
  TrackToggle,
  VideoTrack,
  useLocalParticipant,
  useRoomContext,
  useTracks,
  type TrackReference,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-react';
import '@livekit/components-styles/prefabs';
import type { AxiosError } from 'axios';
import { ConnectionState, RoomEvent, Track, type Participant, type Room } from 'livekit-client';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Camera,
  CameraOff,
  Clapperboard,
  Edit3,
  Gavel,
  GripHorizontal,
  Hand,
  LoaderCircle,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  Radio,
  RefreshCw,
  Send,
  Settings2,
  UserMinus,
  Users,
  Video,
  VideoOff,
  Volume2,
  X,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { connectSocket, getSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';
import { WhiteboardPanel } from './components/WhiteboardPanel';
import {
  useClassroomDetail,
  useEndClassroom,
  useJoinClassroom,
  useKickParticipant,
  useLeaveClassroom,
  useMuteParticipant,
  useStartRecording,
  useStartClassroom,
  useStopRecording,
  useUpdateSettings,
  type ClassroomChatMessage,
  type ClassroomMutePayload,
  type ClassroomSettingsState,
  type ClassroomSummary,
  type ClassroomRoomSessionResponse,
  type HandQueueEntry,
} from './useClassroom';

interface FloatingPanelProps {
  title: string;
  icon: React.ElementType;
  className: string;
  onClose?: () => void;
  children: React.ReactNode;
}

interface SharedShellProps {
  classroom: ClassroomSummary;
  isHost: boolean;
  messages: ClassroomChatMessage[];
  handQueue: HandQueueEntry[];
  settingsState?: ClassroomSettingsState;
  whiteboardOpen: boolean;
  videoPanelOpen: boolean;
  chatOpen: boolean;
  participantsOpen: boolean;
  unreadCount: number;
  recordingActive: boolean;
  recordingPending: boolean;
  messageDraft: string;
  hasRaisedHand: boolean;
  settingsOpen: boolean;
  settingsPending: boolean;
  onToggleVideoPanel: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onToggleWhiteboard: () => void;
  onToggleSettings: () => void;
  onMessageDraftChange: (value: string) => void;
  onSendMessage: () => void;
  onToggleRaiseHand: () => void;
  onGrantSpeak: (userId: string) => void;
  onToggleRecording: () => void;
  onMuteParticipant: (payload: ClassroomMutePayload) => void;
  onKickParticipant: (participantId: string, reason?: string) => void;
  onSaveSettings: (settings: Partial<ClassroomSettingsState>) => void;
  onViewRecordings: () => void;
  onBackToLobby: () => void;
  onLeave: () => void;
  onEnd: () => void;
  sessionNotice: string | null;
  sessionEnded: boolean;
}

interface KickDialogState {
  participantId: string;
  participantName: string;
}

function getTrackIdentity(trackRef: TrackReference | TrackReferenceOrPlaceholder) {
  return trackRef.participant.identity;
}

function formatMessageTime(value: string) {
  try {
    return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

function getMutationErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? fallback;
}

function isMockSession(session: ClassroomRoomSessionResponse | null) {
  if (!session) {
    return false;
  }

  return (
    session.livekitMode === 'mock' ||
    !session.livekitToken ||
    !session.serverUrl ||
    session.livekitToken.startsWith('placeholder-token')
  );
}

function FloatingPanel({ title, icon: Icon, className, onClose, children }: FloatingPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 12 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'pointer-events-auto absolute overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-2xl',
        className,
      )}
    >
      <div className="flex h-11 items-center justify-between border-b border-slate-200/80 bg-slate-50/90 px-3">
        <div className="flex items-center gap-2 text-slate-700">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">{title}</span>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <div className="h-[calc(100%-2.75rem)]">{children}</div>
    </motion.section>
  );
}

function ClassroomCanvasFrame({
  classroom,
  recordingActive,
  sessionNotice,
  sessionEnded,
  onViewRecordings,
  onBackToLobby,
  children,
}: Pick<
  SharedShellProps,
  'classroom' | 'recordingActive' | 'sessionNotice' | 'sessionEnded' | 'onViewRecordings' | 'onBackToLobby'
> & {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden rounded-[2rem] border border-slate-200/70 bg-[#f8fafc] shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(14,165,233,0.10),_transparent_22%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,0.96))]" />
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:28px_28px] opacity-70" />

      <div className="absolute left-4 top-4 z-20 flex max-w-[calc(100%-7rem)] items-center gap-3 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-slate-700 shadow-lg backdrop-blur-xl">
        <Radio className="h-4 w-4 text-emerald-600" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{classroom.title}</p>
          <p className="truncate text-xs text-slate-500">
            {classroom.host.name} {classroom.status === 'live' ? 'is teaching live now' : 'has scheduled this session'}
          </p>
        </div>
      </div>

      {recordingActive ? (
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-red-100 bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 shadow-lg backdrop-blur-xl">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          Recording In Progress
        </div>
      ) : null}

      {sessionNotice ? (
        <div className="absolute left-1/2 top-20 z-20 w-[min(42rem,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-900 shadow-lg backdrop-blur-xl">
          {sessionNotice}
        </div>
      ) : null}

      {sessionEnded ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/45 backdrop-blur-md">
          <div className="w-[min(32rem,calc(100%-2rem))] rounded-3xl border border-white/10 bg-white/95 p-8 text-center shadow-2xl">
            <Badge className="bg-slate-900 text-white hover:bg-slate-900">Session Ended</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">This classroom has ended</h2>
            <p className="mt-3 text-sm text-slate-600">
              The host has closed the room. You can head back to the classroom lobby and join another live session.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button onClick={onViewRecordings} className="gap-2">
                <Clapperboard className="h-4 w-4" />
                View Recordings
              </Button>
              <Button variant="outline" onClick={onBackToLobby}>
                Back To Lobby
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {children}
    </div>
  );
}

function WhiteboardPlaceholder({
  classroom,
}: {
  classroom: ClassroomSummary;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-6">
      <div className="w-full max-w-3xl rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 text-center shadow-xl backdrop-blur-xl">
        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Live Classroom</Badge>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">{classroom.title}</h2>
        <p className="mt-3 text-sm text-slate-600">
          Keep the session video in focus, or open the whiteboard any time from the dock below.
        </p>
      </div>
    </div>
  );
}

function ChatPanel({
  messages,
  messageDraft,
  onMessageDraftChange,
  onSendMessage,
  onClose,
  disabled,
}: {
  messages: ClassroomChatMessage[];
  messageDraft: string;
  onMessageDraftChange: (value: string) => void;
  onSendMessage: () => void;
  onClose: () => void;
  disabled: boolean;
}) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <FloatingPanel title="Live Chat" icon={MessageSquare} className="bottom-24 left-4 right-4 h-[45vh] md:bottom-auto md:left-auto md:right-5 md:top-24 md:h-[25rem] md:w-80" onClose={onClose}>
      <div className="flex h-full flex-col bg-slate-50/90">
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-4 py-10 text-center text-sm text-slate-500">
              No messages yet. Ask a question or share a reflection to start the conversation.
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar src={message.avatar} fallback={message.name} size="sm" />
                <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                      {message.name}
                    </span>
                    <span className="text-[11px] text-slate-400">{formatMessageTime(message.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{message.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-slate-200 bg-white/90 p-3">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!disabled) {
                onSendMessage();
              }
            }}
            className="flex gap-2"
          >
            <Input
              value={messageDraft}
              onChange={(event) => onMessageDraftChange(event.target.value)}
              placeholder={disabled ? 'Chat is disabled by the host' : 'Type a message...'}
              disabled={disabled}
              className="h-10 rounded-xl border-slate-200 bg-slate-50"
            />
            <Button type="submit" size="icon" disabled={disabled || !messageDraft.trim()} className="h-10 w-10 rounded-xl">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </FloatingPanel>
  );
}

function ParticipantListPanel({
  participants,
  hostIdentity,
  handQueue,
  isHost,
  onGrantSpeak,
  onMuteParticipant,
  onKickParticipant,
  moderationPending,
  onClose,
}: {
  participants: Participant[];
  hostIdentity: string;
  handQueue: HandQueueEntry[];
  isHost: boolean;
  onGrantSpeak: (userId: string) => void;
  onMuteParticipant: (participantId: string, updates: { audio?: boolean; video?: boolean }) => void;
  onKickParticipant: (participantId: string, participantName: string) => void;
  moderationPending: boolean;
  onClose: () => void;
}) {
  return (
    <FloatingPanel title="Participants" icon={Users} className="bottom-24 left-4 right-4 h-[46vh] md:bottom-auto md:left-auto md:right-5 md:top-[28rem] md:h-[22rem] md:w-80" onClose={onClose}>
      <div className="h-full overflow-y-auto bg-white/95 px-4 py-4">
        {isHost && handQueue.length > 0 ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              <Hand className="h-4 w-4" />
              Hand Queue
            </div>
            <div className="mt-3 space-y-2">
              {handQueue.map((entry, index) => (
                <div key={entry.userId} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{entry.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Position {index + 1}</p>
                  </div>
                  <Button type="button" size="sm" onClick={() => onGrantSpeak(entry.userId)}>
                    Grant Speak
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          {participants.map((participant) => {
            const isHostParticipant = participant.identity === hostIdentity;
            const isHandRaised = handQueue.some((entry) => entry.userId === participant.identity);
            const displayName = participant.name || participant.identity;

            return (
              <div key={participant.identity} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar fallback={displayName} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{displayName}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {isHostParticipant ? <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Host</Badge> : null}
                        {isHandRaised ? <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">Hand Raised</Badge> : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    {participant.isMicrophoneEnabled ? <Mic className="h-4 w-4 text-emerald-600" /> : <MicOff className="h-4 w-4" />}
                    {participant.isCameraEnabled ? <Camera className="h-4 w-4 text-sky-600" /> : <CameraOff className="h-4 w-4" />}
                  </div>
                </div>

                {isHost && !isHostParticipant ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={moderationPending}
                      onClick={() =>
                        onMuteParticipant(participant.identity, {
                          audio: participant.isMicrophoneEnabled,
                        })
                      }
                      className="gap-1"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      {participant.isMicrophoneEnabled ? 'Mute Audio' : 'Keep Audio Off'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={moderationPending}
                      onClick={() =>
                        onMuteParticipant(participant.identity, {
                          video: participant.isCameraEnabled,
                        })
                      }
                      className="gap-1"
                    >
                      <VideoOff className="h-3.5 w-3.5" />
                      {participant.isCameraEnabled ? 'Mute Video' : 'Keep Video Off'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={moderationPending}
                      onClick={() => onKickParticipant(participant.identity, displayName)}
                      className="gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                      Kick
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </FloatingPanel>
  );
}

function ControlDock({
  isHost,
  whiteboardOpen,
  videoPanelOpen,
  chatOpen,
  participantsOpen,
  unreadCount,
  hasRaisedHand,
  recordingActive,
  recordingPending,
  settingsOpen,
  onToggleVideoPanel,
  onToggleChat,
  onToggleParticipants,
  onToggleWhiteboard,
  onToggleSettings,
  onToggleRaiseHand,
  onToggleRecording,
  onLeave,
  onEnd,
  chatEnabled,
  handRaiseEnabled,
  whiteboardEnabled,
}: Pick<
  SharedShellProps,
  | 'isHost'
  | 'whiteboardOpen'
  | 'videoPanelOpen'
  | 'chatOpen'
  | 'participantsOpen'
  | 'unreadCount'
  | 'hasRaisedHand'
  | 'recordingActive'
  | 'recordingPending'
  | 'settingsOpen'
  | 'onToggleVideoPanel'
  | 'onToggleChat'
  | 'onToggleParticipants'
  | 'onToggleWhiteboard'
  | 'onToggleSettings'
  | 'onToggleRaiseHand'
  | 'onToggleRecording'
  | 'onLeave'
  | 'onEnd'
> & {
  chatEnabled: boolean;
  handRaiseEnabled: boolean;
  whiteboardEnabled: boolean;
}) {
  const { isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
      <div className="flex items-center gap-1.5 rounded-[1.4rem] border border-slate-200/80 bg-white/92 p-2 shadow-2xl backdrop-blur-xl">
        <TrackToggle
          source={Track.Source.Microphone}
          showIcon={false}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
            isMicrophoneEnabled ? 'text-slate-700 hover:bg-slate-100' : 'bg-red-50 text-red-600 hover:bg-red-100',
          )}
          title={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicrophoneEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </TrackToggle>

        <TrackToggle
          source={Track.Source.Camera}
          showIcon={false}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
            isCameraEnabled ? 'text-slate-700 hover:bg-slate-100' : 'bg-red-50 text-red-600 hover:bg-red-100',
          )}
          title={isCameraEnabled ? 'Turn camera off' : 'Turn camera on'}
        >
          {isCameraEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
        </TrackToggle>

        <TrackToggle
          source={Track.Source.ScreenShare}
          showIcon={false}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
            isScreenShareEnabled ? 'bg-sky-50 text-sky-700 hover:bg-sky-100' : 'text-slate-700 hover:bg-slate-100',
          )}
          title={isScreenShareEnabled ? 'Stop screen sharing' : 'Share your screen'}
        >
          <MonitorUp className="h-5 w-5" />
        </TrackToggle>

        <div className="mx-1 h-8 w-px bg-slate-200" />

        <button
          type="button"
          onClick={onToggleRaiseHand}
          disabled={!handRaiseEnabled}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
            hasRaisedHand ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'text-slate-700 hover:bg-slate-100',
            !handRaiseEnabled && 'cursor-not-allowed opacity-40',
          )}
          title={hasRaisedHand ? 'Lower hand' : 'Raise hand'}
        >
          <Hand className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onToggleWhiteboard}
          disabled={!whiteboardEnabled}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
            whiteboardOpen ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'text-slate-700 hover:bg-slate-100',
            !whiteboardEnabled && 'cursor-not-allowed opacity-40',
          )}
          title={whiteboardOpen ? 'Hide whiteboard' : 'Show whiteboard'}
        >
          <Edit3 className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onToggleVideoPanel}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
            videoPanelOpen ? 'bg-sky-50 text-sky-700 hover:bg-sky-100' : 'text-slate-700 hover:bg-slate-100',
          )}
          title={videoPanelOpen ? 'Hide video gallery' : 'Show video gallery'}
        >
          <GripHorizontal className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onToggleChat}
          disabled={!chatEnabled}
          className={cn(
            'relative flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
            chatOpen ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'text-slate-700 hover:bg-slate-100',
            !chatEnabled && 'cursor-not-allowed opacity-40',
          )}
          title={chatOpen ? 'Hide chat' : 'Show chat'}
        >
          <MessageSquare className="h-5 w-5" />
          {!chatOpen && unreadCount > 0 ? (
            <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={onToggleParticipants}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
            participantsOpen ? 'bg-violet-50 text-violet-700 hover:bg-violet-100' : 'text-slate-700 hover:bg-slate-100',
          )}
          title={participantsOpen ? 'Hide participants' : 'Show participants'}
        >
          <Users className="h-5 w-5" />
        </button>

        <div className="mx-1 h-8 w-px bg-slate-200" />

        {isHost ? (
          <button
            type="button"
            onClick={onToggleRecording}
            disabled={recordingPending}
            className={cn(
              'flex h-12 min-w-12 items-center justify-center gap-2 rounded-xl px-3 transition-colors',
              recordingActive
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'text-slate-700 hover:bg-slate-100',
              recordingPending && 'cursor-not-allowed opacity-60',
            )}
            title={recordingActive ? 'Stop recording' : 'Start recording'}
          >
            <span className={cn('h-2.5 w-2.5 rounded-full', recordingActive ? 'bg-red-500 animate-pulse' : 'bg-slate-300')} />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] md:inline">
              {recordingPending ? 'Working' : recordingActive ? 'Recording' : 'Record'}
            </span>
          </button>
        ) : null}

        {isHost ? (
          <button
            type="button"
            onClick={onToggleSettings}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
              settingsOpen ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'text-slate-700 hover:bg-slate-100',
            )}
            title="Classroom settings"
          >
            <Settings2 className="h-5 w-5" />
          </button>
        ) : null}

        {isHost ? (
          <button
            type="button"
            onClick={onEnd}
            className="rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-600"
          >
            End
          </button>
        ) : null}
        <button
          type="button"
          onClick={onLeave}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Leave
        </button>
      </div>
    </div>
  );
}

function SettingsPanel({
  open,
  currentSettings,
  pending,
  onClose,
  onSave,
}: {
  open: boolean;
  currentSettings?: ClassroomSettingsState;
  pending: boolean;
  onClose: () => void;
  onSave: (settings: Partial<ClassroomSettingsState>) => void;
}) {
  const [draft, setDraft] = useState<Partial<ClassroomSettingsState>>({});

  useEffect(() => {
    if (open) {
      setDraft(currentSettings ?? {});
    }
  }, [currentSettings, open]);

  if (!open) {
    return null;
  }

  const items: Array<{ key: keyof ClassroomSettingsState; label: string; description: string }> = [
    { key: 'chatEnabled', label: 'Chat', description: 'Allow participants to send messages during class.' },
    { key: 'whiteboardEnabled', label: 'Whiteboard', description: 'Show the collaborative teaching board to participants.' },
    { key: 'participantAudio', label: 'Participant Audio', description: 'Let participants publish microphone audio.' },
    { key: 'participantVideo', label: 'Participant Video', description: 'Let participants publish camera video.' },
    { key: 'handRaiseEnabled', label: 'Hand Raise', description: 'Allow participants to enter the hand queue.' },
    { key: 'recordingEnabled', label: 'Recording', description: 'Permit this classroom to start cloud recording.' },
  ];

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div className="w-[min(34rem,100%)] rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Host Controls</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Classroom settings</h3>
            <p className="mt-2 text-sm text-slate-600">Adjust participant permissions in real time without leaving the room.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <label key={item.key} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.description}</p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(draft[item.key])}
                onChange={(event) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    [item.key]: event.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-600"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={() => onSave(draft)} disabled={pending} className="gap-2">
            {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Settings2 className="h-4 w-4" />}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

function KickParticipantDialog({
  participant,
  pending,
  onClose,
  onConfirm,
}: {
  participant: KickDialogState | null;
  pending: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (participant) {
      setReason('');
    }
  }, [participant]);

  if (!participant) {
    return null;
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div className="w-[min(28rem,100%)] rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-red-50 p-3 text-red-600">
            <Gavel className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Remove participant</h3>
            <p className="mt-2 text-sm text-slate-600">
              {participant.participantName} will be removed from the classroom immediately.
            </p>
          </div>
        </div>

        <label className="mt-5 block text-sm font-medium text-slate-700">
          Reason (optional)
          <Input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explain why the participant is being removed"
            className="mt-2"
          />
        </label>

        <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(reason.trim() || undefined)}
            disabled={pending}
            className="gap-2 bg-red-600 text-white hover:bg-red-700"
          >
            {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
            Kick Participant
          </Button>
        </div>
      </div>
    </div>
  );
}

function VideoGalleryPanel({
  classroom,
  hostTrack,
  participantTracks,
  onClose,
}: {
  classroom: ClassroomSummary;
  hostTrack?: TrackReference;
  participantTracks: TrackReferenceOrPlaceholder[];
  onClose: () => void;
}) {
  return (
    <FloatingPanel title="Video Gallery" icon={Video} className="left-4 top-24 h-[28rem] w-[calc(100%-2rem)] md:h-[31rem] md:w-80" onClose={onClose}>
      <div className="h-full overflow-y-auto bg-slate-100/95 p-3">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg">
          <div className="relative aspect-video bg-slate-900">
            {hostTrack ? (
              <VideoTrack trackRef={hostTrack} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_rgba(15,23,42,0.95))]">
                <Avatar fallback={classroom.host.name} size="lg" className="h-20 w-20 border border-white/20 bg-white/10 text-white" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-10">
              <div>
                <p className="text-sm font-semibold text-white">{classroom.host.name}</p>
                <Badge className="mt-1 bg-emerald-500 text-black hover:bg-emerald-500">Host</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {participantTracks.length === 0 ? (
            <div className="col-span-2 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
              Participants will appear here once they join the room.
            </div>
          ) : (
            participantTracks.map((trackRef) => (
              <div key={`${getTrackIdentity(trackRef)}-${trackRef.source}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <ParticipantTile trackRef={trackRef} />
              </div>
            ))
          )}
        </div>
      </div>
    </FloatingPanel>
  );
}

function useRoomConnectionState(room: Room) {
  const [connectionState, setConnectionState] = useState(room.state);

  useEffect(() => {
    const handleChange = () => setConnectionState(room.state);
    room.on(RoomEvent.ConnectionStateChanged, handleChange);
    return () => {
      room.off(RoomEvent.ConnectionStateChanged, handleChange);
    };
  }, [room]);

  return connectionState;
}

function ConnectedClassroomShell(props: SharedShellProps) {
  const room = useRoomContext();
  const [kickDialog, setKickDialog] = useState<KickDialogState | null>(null);
  const connectionState = useRoomConnectionState(room);
  const cameraTracks = useTracks([Track.Source.Camera]);
  const participantTiles = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);

  const hostIdentity = props.classroom.host._id;
  const hostCameraTrack = useMemo(
    () => cameraTracks.find((trackRef) => getTrackIdentity(trackRef) === hostIdentity),
    [cameraTracks, hostIdentity],
  );
  const hostScreenTrack = useMemo(
    () => screenShareTracks.find((trackRef) => getTrackIdentity(trackRef) === hostIdentity),
    [hostIdentity, screenShareTracks],
  );
  const pinnedTrack = hostScreenTrack ?? hostCameraTrack;
  const participantTrackRefs = useMemo(
    () => participantTiles.filter((trackRef) => getTrackIdentity(trackRef) !== hostIdentity),
    [hostIdentity, participantTiles],
  );
  const participants = useMemo(
    () => [room.localParticipant, ...Array.from(room.remoteParticipants.values())].sort((left, right) => {
      if (left.identity === hostIdentity) return -1;
      if (right.identity === hostIdentity) return 1;
      return left.identity.localeCompare(right.identity);
    }),
    [hostIdentity, room.localParticipant, room.remoteParticipants],
  );

  const reconnecting =
    connectionState === ConnectionState.Reconnecting || connectionState === ConnectionState.Connecting;

  return (
    <ClassroomCanvasFrame
      classroom={props.classroom}
      recordingActive={props.recordingActive}
      sessionNotice={props.sessionNotice}
      sessionEnded={props.sessionEnded}
      onViewRecordings={props.onViewRecordings}
      onBackToLobby={props.onBackToLobby}
    >
      {props.whiteboardOpen ? (
        <WhiteboardPanel
          classroomId={props.classroom._id}
          classroomTitle={props.classroom.title}
          isHost={props.isHost}
          livekitEnabled={true}
        />
      ) : (
        <WhiteboardPlaceholder classroom={props.classroom} />
      )}

      {pinnedTrack ? (
        <div className="pointer-events-none absolute bottom-28 right-5 z-10 hidden w-72 overflow-hidden rounded-3xl border border-white/20 bg-slate-900 shadow-2xl md:block">
          <div className="relative aspect-video bg-slate-900">
            <VideoTrack trackRef={pinnedTrack} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-12">
              <p className="text-sm font-semibold text-white">{props.classroom.host.name}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">Host Spotlight</p>
            </div>
          </div>
        </div>
      ) : null}

      {reconnecting ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm">
          <div className="rounded-3xl border border-white/15 bg-white/95 px-6 py-5 text-center shadow-2xl">
            <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-emerald-600" />
            <p className="mt-3 text-sm font-medium text-slate-900">Reconnecting to the classroom...</p>
          </div>
        </div>
      ) : null}

      <div className="absolute inset-0 pointer-events-none z-10">
        <AnimatePresence>
          {props.videoPanelOpen ? (
            <VideoGalleryPanel
              classroom={props.classroom}
              hostTrack={hostCameraTrack}
              participantTracks={participantTrackRefs}
              onClose={props.onToggleVideoPanel}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {props.chatOpen ? (
            <ChatPanel
              messages={props.messages}
              messageDraft={props.messageDraft}
              onMessageDraftChange={props.onMessageDraftChange}
              onSendMessage={props.onSendMessage}
              onClose={props.onToggleChat}
              disabled={!props.settingsState?.chatEnabled}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {props.participantsOpen ? (
            <ParticipantListPanel
              participants={participants}
              hostIdentity={hostIdentity}
              handQueue={props.handQueue}
              isHost={props.isHost}
              onGrantSpeak={props.onGrantSpeak}
              onMuteParticipant={(participantId, updates) =>
                props.onMuteParticipant({
                  classroomId: props.classroom._id,
                  participantId,
                  ...updates,
                })
              }
              onKickParticipant={(participantId, participantName) =>
                setKickDialog({ participantId, participantName })
              }
              moderationPending={props.recordingPending || props.settingsPending}
              onClose={props.onToggleParticipants}
            />
          ) : null}
        </AnimatePresence>

        <SettingsPanel
          open={props.settingsOpen}
          currentSettings={props.settingsState}
          pending={props.settingsPending}
          onClose={props.onToggleSettings}
          onSave={props.onSaveSettings}
        />

        <KickParticipantDialog
          participant={kickDialog}
          pending={props.recordingPending || props.settingsPending}
          onClose={() => setKickDialog(null)}
          onConfirm={(reason) => {
            if (kickDialog) {
              props.onKickParticipant(kickDialog.participantId, reason);
            }
            setKickDialog(null);
          }}
        />
      </div>

      <ControlDock
        isHost={props.isHost}
        whiteboardOpen={props.whiteboardOpen}
        videoPanelOpen={props.videoPanelOpen}
        chatOpen={props.chatOpen}
        participantsOpen={props.participantsOpen}
        unreadCount={props.unreadCount}
        hasRaisedHand={props.hasRaisedHand}
        recordingActive={props.recordingActive}
        recordingPending={props.recordingPending}
        settingsOpen={props.settingsOpen}
        onToggleVideoPanel={props.onToggleVideoPanel}
        onToggleChat={props.onToggleChat}
        onToggleParticipants={props.onToggleParticipants}
        onToggleWhiteboard={props.onToggleWhiteboard}
        onToggleSettings={props.onToggleSettings}
        onToggleRaiseHand={props.onToggleRaiseHand}
        onToggleRecording={props.onToggleRecording}
        onLeave={props.onLeave}
        onEnd={props.onEnd}
        chatEnabled={props.settingsState?.chatEnabled ?? true}
        handRaiseEnabled={props.settingsState?.handRaiseEnabled ?? true}
        whiteboardEnabled={props.settingsState?.whiteboardEnabled ?? true}
      />
    </ClassroomCanvasFrame>
  );
}

function MockClassroomShell(props: SharedShellProps) {
  return (
    <ClassroomCanvasFrame
      classroom={props.classroom}
      recordingActive={props.recordingActive}
      sessionNotice={props.sessionNotice}
      sessionEnded={props.sessionEnded}
      onViewRecordings={props.onViewRecordings}
      onBackToLobby={props.onBackToLobby}
    >
      {props.whiteboardOpen ? (
        <WhiteboardPanel
          classroomId={props.classroom._id}
          classroomTitle={props.classroom.title}
          isHost={props.isHost}
        />
      ) : (
        <WhiteboardPlaceholder classroom={props.classroom} />
      )}

      <div className="pointer-events-none absolute bottom-28 right-5 z-10 hidden w-72 overflow-hidden rounded-3xl border border-white/20 bg-slate-900 shadow-2xl md:block">
        <div className="relative aspect-video bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_rgba(15,23,42,0.95))]">
          <div className="flex h-full items-center justify-center">
            <Avatar fallback={props.classroom.host.name} className="h-20 w-20 border border-white/20 bg-white/10 text-white" />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-12">
            <p className="text-sm font-semibold text-white">{props.classroom.host.name}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-white/70">Mock LiveKit Session</p>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-10">
        <AnimatePresence>
          {props.videoPanelOpen ? (
            <FloatingPanel title="Video Gallery" icon={Video} className="left-4 top-24 h-[28rem] w-[calc(100%-2rem)] md:h-[31rem] md:w-80" onClose={props.onToggleVideoPanel}>
              <div className="h-full overflow-y-auto bg-slate-100/95 p-3">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg">
                  <div className="relative aspect-video bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_rgba(15,23,42,0.95))]">
                    <div className="flex h-full items-center justify-center">
                      <Avatar fallback={props.classroom.host.name} className="h-20 w-20 border border-white/20 bg-white/10 text-white" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-10">
                      <div>
                        <p className="text-sm font-semibold text-white">{props.classroom.host.name}</p>
                        <Badge className="mt-1 bg-emerald-500 text-black hover:bg-emerald-500">Host</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                  LiveKit is not configured in this environment, so this room is running in mock mode.
                </div>
              </div>
            </FloatingPanel>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {props.chatOpen ? (
            <ChatPanel
              messages={props.messages}
              messageDraft={props.messageDraft}
              onMessageDraftChange={props.onMessageDraftChange}
              onSendMessage={props.onSendMessage}
              onClose={props.onToggleChat}
              disabled={!props.settingsState?.chatEnabled}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {props.participantsOpen ? (
            <FloatingPanel title="Participants" icon={Users} className="bottom-24 left-4 right-4 h-[46vh] md:bottom-auto md:left-auto md:right-5 md:top-[28rem] md:h-[22rem] md:w-80" onClose={props.onToggleParticipants}>
              <div className="h-full overflow-y-auto bg-white/95 px-4 py-4">
                {props.isHost && props.handQueue.length > 0 ? (
                  <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                      <Hand className="h-4 w-4" />
                      Hand Queue
                    </div>
                    <div className="mt-3 space-y-2">
                      {props.handQueue.map((entry, index) => (
                        <div key={entry.userId} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{entry.name}</p>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Position {index + 1}</p>
                          </div>
                          <Button type="button" size="sm" onClick={() => props.onGrantSpeak(entry.userId)}>
                            Grant Speak
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  Participant media tiles are unavailable in mock mode, but chat, hand raising, and the classroom shell remain usable.
                </div>
              </div>
            </FloatingPanel>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-slate-200/80 bg-white/92 p-6 text-center shadow-xl backdrop-blur-xl">
        <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-50">Mock LiveKit Mode</Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Interactive shell ready</h2>
        <p className="mt-3 text-sm text-slate-600">
          This environment does not have LiveKit server credentials yet. The real-time room shell still renders so you can verify the classroom experience locally.
        </p>
      </div>

      <div className="pointer-events-auto absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
        <div className="rounded-3xl border border-slate-200/80 bg-white/92 p-3 text-sm text-slate-600 shadow-2xl backdrop-blur-xl">
          Mock LiveKit mode keeps the room chrome available. Recording, settings, and moderation still talk to the classroom API.
        </div>
      </div>

      <SettingsPanel
        open={props.settingsOpen}
        currentSettings={props.settingsState}
        pending={props.settingsPending}
        onClose={props.onToggleSettings}
        onSave={props.onSaveSettings}
      />

      <ControlDock
        isHost={props.isHost}
        whiteboardOpen={props.whiteboardOpen}
        videoPanelOpen={props.videoPanelOpen}
        chatOpen={props.chatOpen}
        participantsOpen={props.participantsOpen}
        unreadCount={props.unreadCount}
        hasRaisedHand={props.hasRaisedHand}
        recordingActive={props.recordingActive}
        recordingPending={props.recordingPending}
        settingsOpen={props.settingsOpen}
        onToggleVideoPanel={props.onToggleVideoPanel}
        onToggleChat={props.onToggleChat}
        onToggleParticipants={props.onToggleParticipants}
        onToggleWhiteboard={props.onToggleWhiteboard}
        onToggleSettings={props.onToggleSettings}
        onToggleRaiseHand={props.onToggleRaiseHand}
        onToggleRecording={props.onToggleRecording}
        onLeave={props.onLeave}
        onEnd={props.onEnd}
        chatEnabled={props.settingsState?.chatEnabled ?? true}
        handRaiseEnabled={props.settingsState?.handRaiseEnabled ?? true}
        whiteboardEnabled={props.settingsState?.whiteboardEnabled ?? true}
      />
    </ClassroomCanvasFrame>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-48 rounded-full" />
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
        <Skeleton className="h-[60vh] w-full rounded-[1.5rem]" />
      </div>
    </div>
  );
}

function CenterState({
  badge,
  title,
  description,
  primaryAction,
  secondaryAction,
}: {
  badge: string;
  title: string;
  description: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="w-[min(34rem,calc(100%-1rem))] rounded-[2rem] border border-slate-200 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-xl">
        <Badge className="bg-slate-900 text-white hover:bg-slate-900">{badge}</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-3 text-sm text-slate-600">{description}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {primaryAction}
          {secondaryAction}
        </div>
      </div>
    </div>
  );
}

export function ClassroomLivePage() {
  const navigate = useNavigate();
  const { id: classroomId } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);

  const classroomDetailQuery = useClassroomDetail(classroomId);
  const startClassroom = useStartClassroom();
  const joinClassroom = useJoinClassroom();
  const leaveClassroom = useLeaveClassroom();
  const endClassroom = useEndClassroom();
  const startRecording = useStartRecording();
  const stopRecording = useStopRecording();
  const muteParticipant = useMuteParticipant();
  const kickParticipant = useKickParticipant();
  const updateSettings = useUpdateSettings();

  const [sessionConnection, setSessionConnection] = useState<ClassroomRoomSessionResponse | null>(null);
  const [messages, setMessages] = useState<ClassroomChatMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState('');
  const [handQueue, setHandQueue] = useState<HandQueueEntry[]>([]);
  const [whiteboardOpen, setWhiteboardOpen] = useState(true);
  const [videoPanelOpen, setVideoPanelOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recordingActive, setRecordingActive] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [settingsState, setSettingsState] = useState<ClassroomSettingsState | undefined>(undefined);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [joinAttemptFailed, setJoinAttemptFailed] = useState(false);
  const [joinFailureReason, setJoinFailureReason] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const attemptedAutoJoinRef = useRef<string | null>(null);
  const chatOpenRef = useRef(true);

  useEffect(() => {
    chatOpenRef.current = chatOpen;
    if (chatOpen) {
      setUnreadCount(0);
    }
  }, [chatOpen]);

  useEffect(() => {
    setMessages([]);
    setMessageDraft('');
    setHandQueue([]);
    setSessionConnection(null);
    setWhiteboardOpen(true);
    setVideoPanelOpen(true);
    setChatOpen(true);
    setParticipantsOpen(false);
    setUnreadCount(0);
    setRecordingActive(false);
    setSessionEnded(false);
    setSessionNotice(null);
    setHasRaisedHand(false);
    setJoinAttemptFailed(false);
    setJoinFailureReason(null);
    setSettingsOpen(false);
    attemptedAutoJoinRef.current = null;
  }, [classroomId]);

  const classroom = sessionConnection?.classroom ?? classroomDetailQuery.data?.classroom;
  const isHost = classroomDetailQuery.data?.isHost ?? (classroom ? classroom.host._id === user?._id : false);

  useEffect(() => {
    setSettingsState(classroom?.settings);
  }, [classroom?.settings]);

  useEffect(() => {
    setHasRaisedHand(handQueue.some((entry) => entry.userId === user?._id));
  }, [handQueue, user?._id]);

  useEffect(() => {
    if (!classroomId || !user?._id) {
      return;
    }

    const socket = getSocket() ?? connectSocket();

    const handleMessage = ({ classroomId: incomingClassroomId, message }: { classroomId: string; message: ClassroomChatMessage }) => {
      if (incomingClassroomId !== classroomId) {
        return;
      }

      setMessages((currentMessages) => [...currentMessages, message]);
      if (!chatOpenRef.current) {
        setUnreadCount((currentCount) => currentCount + 1);
      }
    };

    const handleHandQueue = ({ classroomId: incomingClassroomId, queue }: { classroomId: string; queue: HandQueueEntry[] }) => {
      if (incomingClassroomId !== classroomId) {
        return;
      }
      setHandQueue(queue ?? []);
    };

    const handleSpeakGranted = ({ classroomId: incomingClassroomId }: { classroomId: string }) => {
      if (incomingClassroomId !== classroomId) {
        return;
      }
      setHasRaisedHand(false);
      toast.success('The host invited you to speak.');
    };

    const handleRecordingStarted = ({ classroomId: incomingClassroomId }: { classroomId: string }) => {
      if (incomingClassroomId === classroomId) {
        setRecordingActive(true);
      }
    };

    const handleRecordingStopped = ({ classroomId: incomingClassroomId }: { classroomId: string }) => {
      if (incomingClassroomId === classroomId) {
        setRecordingActive(false);
      }
    };

    const handleSettingsUpdated = ({
      classroomId: incomingClassroomId,
      settings,
    }: {
      classroomId: string;
      settings: ClassroomSettingsState;
    }) => {
      if (incomingClassroomId !== classroomId) {
        return;
      }

      setSettingsState((currentSettings) => ({ ...currentSettings, ...settings }));
      if (settings.chatEnabled === false) {
        setChatOpen(false);
      }
      if (settings.whiteboardEnabled === false) {
        setWhiteboardOpen(false);
      }
    };

    const handleEnded = ({ classroomId: incomingClassroomId }: { classroomId: string }) => {
      if (incomingClassroomId !== classroomId) {
        return;
      }
      setSessionEnded(true);
      setSessionNotice('The host ended this classroom.');
    };

    const handleHostLeft = ({ classroomId: incomingClassroomId, message }: { classroomId: string; message: string }) => {
      if (incomingClassroomId !== classroomId) {
        return;
      }
      setSessionNotice(message);
    };

    const handleKicked = ({ classroomId: incomingClassroomId, reason }: { classroomId: string; reason?: string }) => {
      if (incomingClassroomId !== classroomId) {
        return;
      }
      toast.error(reason ?? 'You were removed from the classroom.');
      navigate('/classrooms');
    };

    const handleMuted = ({ classroomId: incomingClassroomId }: { classroomId: string }) => {
      if (incomingClassroomId === classroomId) {
        toast('The host updated your media permissions.');
      }
    };

    socket.emit('classroom:join-room', { classroomId });
    socket.on('classroom:message:new', handleMessage);
    socket.on('classroom:hand-queue', handleHandQueue);
    socket.on('classroom:speak-granted', handleSpeakGranted);
    socket.on('classroom:recording-started', handleRecordingStarted);
    socket.on('classroom:recording-stopped', handleRecordingStopped);
    socket.on('classroom:settings-updated', handleSettingsUpdated);
    socket.on('classroom:ended', handleEnded);
    socket.on('classroom:host-left', handleHostLeft);
    socket.on('classroom:participant-kicked', handleKicked);
    socket.on('classroom:participant-muted', handleMuted);

    return () => {
      socket.emit('classroom:leave-room', { classroomId });
      socket.off('classroom:message:new', handleMessage);
      socket.off('classroom:hand-queue', handleHandQueue);
      socket.off('classroom:speak-granted', handleSpeakGranted);
      socket.off('classroom:recording-started', handleRecordingStarted);
      socket.off('classroom:recording-stopped', handleRecordingStopped);
      socket.off('classroom:settings-updated', handleSettingsUpdated);
      socket.off('classroom:ended', handleEnded);
      socket.off('classroom:host-left', handleHostLeft);
      socket.off('classroom:participant-kicked', handleKicked);
      socket.off('classroom:participant-muted', handleMuted);
    };
  }, [classroomId, navigate, user?._id]);

  useEffect(() => {
    if (!classroomId || !classroom || sessionConnection || sessionEnded || joinAttemptFailed) {
      return;
    }

    if (classroom.status !== 'live') {
      return;
    }

    if (joinClassroom.isPending || startClassroom.isPending) {
      return;
    }

    const attemptKey = `${classroomId}:${classroom.status}`;
    if (attemptedAutoJoinRef.current === attemptKey) {
      return;
    }

    attemptedAutoJoinRef.current = attemptKey;
    joinClassroom.mutate(
      { classroomId },
      {
        onSuccess: (response) => {
          setSessionConnection(response);
          setJoinAttemptFailed(false);
          setJoinFailureReason(null);
          setSessionEnded(false);
        },
        onError: (error) => {
          setJoinAttemptFailed(true);
          setJoinFailureReason(getMutationErrorMessage(error, 'We could not connect you to the room.'));
        },
      },
    );
  }, [classroom, classroomId, joinAttemptFailed, joinClassroom, sessionConnection, sessionEnded, startClassroom.isPending]);

  const handleSendMessage = () => {
    if (!classroomId || !messageDraft.trim()) {
      return;
    }

    const socket = getSocket() ?? connectSocket();
    socket.emit('classroom:message:send', {
      classroomId,
      message: messageDraft.trim(),
    });
    setMessageDraft('');
  };

  const handleToggleRaiseHand = () => {
    if (!classroomId) {
      return;
    }

    const socket = getSocket() ?? connectSocket();
    if (hasRaisedHand) {
      socket.emit('classroom:lower-hand', { classroomId });
      setHasRaisedHand(false);
      return;
    }

    socket.emit('classroom:raise-hand', { classroomId });
    setHasRaisedHand(true);
  };

  const handleGrantSpeak = (targetUserId: string) => {
    if (!classroomId) {
      return;
    }

    const socket = getSocket() ?? connectSocket();
    socket.emit('classroom:grant-speak', {
      classroomId,
      userId: targetUserId,
    });
  };

  const handleStartClassroom = () => {
    if (!classroomId) {
      return;
    }

    startClassroom.mutate(
      { classroomId },
      {
        onSuccess: (response) => {
          setSessionConnection(response);
          setJoinAttemptFailed(false);
          setJoinFailureReason(null);
          setSessionEnded(false);
        },
      },
    );
  };

  const handleRetryJoin = () => {
    if (!classroomId) {
      return;
    }

    setJoinAttemptFailed(false);
    setJoinFailureReason(null);
    joinClassroom.mutate(
      { classroomId },
      {
        onSuccess: (response) => {
          setSessionConnection(response);
        },
        onError: (error) => {
          setJoinAttemptFailed(true);
          setJoinFailureReason(getMutationErrorMessage(error, 'We could not connect you to the room.'));
        },
      },
    );
  };

  const handleViewRecordings = () => {
    if (!classroomId) {
      navigate('/classrooms');
      return;
    }

    navigate(`/classrooms/${classroomId}/recordings`);
  };

  const handleBackToLobby = () => {
    navigate('/classrooms');
  };

  const handleToggleRecording = async () => {
    if (!classroomId || !isHost) {
      return;
    }

    try {
      if (recordingActive) {
        await stopRecording.mutateAsync({ classroomId });
        setRecordingActive(false);
        return;
      }

      await startRecording.mutateAsync({ classroomId });
      setRecordingActive(true);
    } catch {
      // Mutation hooks show user-facing errors already.
    }
  };

  const handleSaveSettings = async (settings: Partial<ClassroomSettingsState>) => {
    if (!classroomId || !isHost) {
      return;
    }

    try {
      await updateSettings.mutateAsync({
        classroomId,
        settings,
      });
      setSettingsState((currentSettings) => ({ ...currentSettings, ...settings }));
      setSettingsOpen(false);
    } catch {
      // Mutation hooks show user-facing errors already.
    }
  };

  const handleMuteParticipant = async (payload: ClassroomMutePayload) => {
    if (!payload.classroomId) {
      return;
    }

    try {
      await muteParticipant.mutateAsync(payload);
    } catch {
      // Mutation hooks show user-facing errors already.
    }
  };

  const handleKickParticipant = async (participantId: string, reason?: string) => {
    if (!classroomId) {
      return;
    }

    try {
      await kickParticipant.mutateAsync({
        classroomId,
        participantId,
        reason,
      });
    } catch {
      // Mutation hooks show user-facing errors already.
    }
  };

  const handleLeave = async () => {
    if (!classroomId) {
      navigate('/classrooms');
      return;
    }

    await leaveClassroom.mutateAsync({ classroomId });
    navigate('/classrooms');
  };

  const handleEnd = async () => {
    if (!classroomId) {
      navigate('/classrooms');
      return;
    }

    await endClassroom.mutateAsync({ classroomId });
    navigate('/classrooms');
  };

  if (!classroomId || classroomDetailQuery.isLoading) {
    return <LoadingState />;
  }

  if (classroomDetailQuery.isError || !classroom) {
    return (
      <CenterState
        badge="Classroom Missing"
        title="This classroom could not be loaded"
        description="The room may have been removed or you may no longer have access."
        primaryAction={
          <Button onClick={() => navigate('/classrooms')}>
            Back To Lobby
          </Button>
        }
      />
    );
  }

  const isClassroomEnded = sessionEnded || classroom.status === 'ended';

  if (!sessionConnection && isClassroomEnded) {
    return (
      <CenterState
        badge="Session Ended"
        title="The classroom has already ended"
        description="You can view the session recordings if they are available, or head back to the classroom lobby."
        primaryAction={
          <Button onClick={handleViewRecordings} className="gap-2">
            <Clapperboard className="h-4 w-4" />
            View Recordings
          </Button>
        }
        secondaryAction={
          <Button variant="outline" onClick={handleBackToLobby}>Back To Lobby</Button>
        }
      />
    );
  }

  if (!sessionConnection && classroom.status !== 'live') {
    if (isHost) {
      return (
        <div className="space-y-6">
          <Button variant="ghost" className="gap-2 rounded-full" onClick={() => navigate('/classrooms')}>
            <ArrowLeft className="h-4 w-4" />
            Back To Lobby
          </Button>
          <CenterState
            badge="Host Controls"
            title="Your classroom is ready to go live"
            description="Start the LiveKit room when you are ready. Students will be able to join as soon as the session goes live."
            primaryAction={
              <Button onClick={handleStartClassroom} disabled={startClassroom.isPending} className="gap-2">
                {startClassroom.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
                Start Classroom
              </Button>
            }
            secondaryAction={
              <Button variant="outline" onClick={() => navigate('/classrooms')}>
                Leave Setup
              </Button>
            }
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Button variant="ghost" className="gap-2 rounded-full" onClick={() => navigate('/classrooms')}>
          <ArrowLeft className="h-4 w-4" />
          Back To Lobby
        </Button>
        <CenterState
          badge="Scheduled Session"
          title="This classroom has not started yet"
          description="The host has scheduled the room, but it is not live yet. Stay nearby and refresh once the session begins."
          primaryAction={
            <Button onClick={() => navigate('/classrooms')}>Return To Lobby</Button>
          }
        />
      </div>
    );
  }

  if (!sessionConnection && (joinClassroom.isPending || startClassroom.isPending)) {
    return (
      <CenterState
        badge="Connecting"
        title="Preparing your classroom session"
        description="We are connecting your room, joining the socket channel, and preparing the video session."
        primaryAction={<LoaderCircle className="mx-auto h-5 w-5 animate-spin text-emerald-600" />}
      />
    );
  }

  if (!sessionConnection && joinAttemptFailed) {
    const isClassroomFull = joinFailureReason?.toLowerCase().includes('full') ?? false;

    return (
      <CenterState
        badge={isClassroomFull ? 'Classroom Full' : 'Unable To Join'}
        title={isClassroomFull ? 'This classroom has reached capacity' : 'We could not connect you to the room'}
        description={
          joinFailureReason ??
          'The classroom may be full, private, or temporarily unavailable. You can retry or head back to the lobby.'
        }
        primaryAction={
          <Button onClick={handleRetryJoin} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry Join
          </Button>
        }
        secondaryAction={
          <Button variant="outline" onClick={() => navigate('/classrooms')}>
            Back To Lobby
          </Button>
        }
      />
    );
  }

  const shellProps: SharedShellProps = {
    classroom,
    isHost,
    messages,
    handQueue,
    settingsState,
    whiteboardOpen,
    videoPanelOpen,
    chatOpen,
    participantsOpen,
    unreadCount,
    recordingActive,
    recordingPending: startRecording.isPending || stopRecording.isPending,
    messageDraft,
    hasRaisedHand,
    settingsOpen,
    settingsPending:
      updateSettings.isPending || muteParticipant.isPending || kickParticipant.isPending,
    onToggleVideoPanel: () => setVideoPanelOpen((currentValue) => !currentValue),
    onToggleChat: () => setChatOpen((currentValue) => !currentValue),
    onToggleParticipants: () => setParticipantsOpen((currentValue) => !currentValue),
    onToggleWhiteboard: () => setWhiteboardOpen((currentValue) => !currentValue),
    onToggleSettings: () => setSettingsOpen((currentValue) => !currentValue),
    onMessageDraftChange: setMessageDraft,
    onSendMessage: handleSendMessage,
    onToggleRaiseHand: handleToggleRaiseHand,
    onGrantSpeak: handleGrantSpeak,
    onToggleRecording: () => {
      void handleToggleRecording();
    },
    onMuteParticipant: (payload) => {
      void handleMuteParticipant(payload);
    },
    onKickParticipant: (participantId, reason) => {
      void handleKickParticipant(participantId, reason);
    },
    onSaveSettings: (settings) => {
      void handleSaveSettings(settings);
    },
    onViewRecordings: handleViewRecordings,
    onBackToLobby: handleBackToLobby,
    onLeave: () => {
      void handleLeave();
    },
    onEnd: () => {
      void handleEnd();
    },
    sessionNotice,
    sessionEnded,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" className="gap-2 rounded-full" onClick={() => navigate('/classrooms')}>
          <ArrowLeft className="h-4 w-4" />
          Back To Lobby
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge className="bg-slate-900 text-white hover:bg-slate-900">{isMockSession(sessionConnection) ? 'Mock Room' : 'LiveKit Room'}</Badge>
          <span>{classroom.host.name}</span>
        </div>
      </div>

      {isMockSession(sessionConnection) ? (
        <MockClassroomShell {...shellProps} />
      ) : (
        <LiveKitRoom token={sessionConnection?.livekitToken ?? undefined} serverUrl={sessionConnection?.serverUrl ?? undefined} connect={true} className="block">
          <ConnectedClassroomShell {...shellProps} />
        </LiveKitRoom>
      )}
    </div>
  )
}
