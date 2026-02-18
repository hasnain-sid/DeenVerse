// ===== Stream Types =====
export interface Stream {
  _id: string;
  host: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  title: string;
  description: string;
  category: 'lecture' | 'quran_recitation' | 'qa_session' | 'discussion' | 'other';
  status: 'scheduled' | 'live' | 'ended';
  streamKey?: string;
  playbackUrl: string;
  thumbnailUrl: string;
  viewerCount: number;
  peakViewers: number;
  startedAt: string | null;
  endedAt: string | null;
  chatEnabled: boolean;
  recordingUrl: string;
  scheduledFor: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StreamChatMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  streamId: string;
  createdAt: string;
}
