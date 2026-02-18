import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Copy, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateStream, useStartStream, useEndStream, useMyStreams } from './useStreams';
import type { Stream } from '@/types/stream';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const categories = [
  { value: 'lecture', label: '📖 Lecture' },
  { value: 'quran_recitation', label: '🕌 Quran Recitation' },
  { value: 'qa_session', label: '❓ Q&A Session' },
  { value: 'discussion', label: '💬 Discussion' },
  { value: 'other', label: '🎙️ Other' },
];

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <Input value={value} readOnly className="font-mono text-xs" />
        <Button variant="ghost" size="sm" onClick={handleCopy} className="shrink-0 h-9 w-9 p-0">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function StreamSetup({ stream, onStart }: { stream: Stream; onStart: () => void }) {
  const endStream = useEndStream();
  const isLive = stream.status === 'live';

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold',
            isLive ? 'bg-red-600 text-white' : 'bg-secondary text-secondary-foreground'
          )}
        >
          {isLive && <span className="h-2 w-2 rounded-full bg-white animate-pulse" />}
          {isLive ? 'LIVE' : 'Ready to go live'}
        </div>
        {isLive && (
          <span className="text-sm text-muted-foreground">
            {stream.viewerCount} viewers • Peak: {stream.peakViewers}
          </span>
        )}
      </div>

      <h2 className="text-xl font-bold">{stream.title}</h2>
      {stream.description && (
        <p className="text-sm text-muted-foreground">{stream.description}</p>
      )}

      {/* Stream credentials */}
      <div className="border rounded-xl p-5 space-y-4 bg-card">
        <h3 className="text-sm font-semibold">Stream Settings</h3>
        <p className="text-xs text-muted-foreground">
          Use these credentials in OBS Studio or any RTMP broadcaster.
        </p>
        <CopyField label="Server URL" value="rtmp://live.deenverse.com/app" />
        {stream.streamKey && <CopyField label="Stream Key" value={stream.streamKey} />}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {!isLive ? (
          <Button onClick={onStart} className="gap-2">
            <Radio className="h-4 w-4" />
            Go Live
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
            onClick={() => endStream.mutate(stream._id)}
            disabled={endStream.isPending}
          >
            End Stream
          </Button>
        )}
        <Link to={`/streams/${stream._id}`}>
          <Button variant="ghost">Preview</Button>
        </Link>
      </div>
    </div>
  );
}

export function GoLivePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('lecture');
  const [activeStream, setActiveStream] = useState<Stream | null>(null);

  const createStream = useCreateStream();
  const startStream = useStartStream();
  const { data: myStreams } = useMyStreams();

  // Show existing stream if user has an ongoing one
  const ongoingStream = myStreams?.streams?.find(
    (s) => s.status === 'live' || s.status === 'scheduled'
  );
  const currentStream = activeStream || ongoingStream || null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a stream title');
      return;
    }
    const result = await createStream.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      category,
    });
    setActiveStream(result.stream);
  };

  const handleGoLive = () => {
    if (!currentStream) return;
    startStream.mutate(currentStream._id);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Go Live</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Start a live stream for your community
          </p>
        </div>
      </div>

      {currentStream ? (
        <StreamSetup stream={currentStream} onStart={handleGoLive} />
      ) : (
        <form onSubmit={handleCreate} className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Friday Night Lecture — The Power of Dua"
              maxLength={120}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/120</p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you be streaming about?"
              maxLength={500}
              rows={3}
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-colors',
                    category === cat.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={createStream.isPending || !title.trim()} className="gap-2">
            <Radio className="h-4 w-4" />
            {createStream.isPending ? 'Creating...' : 'Create Stream'}
          </Button>
        </form>
      )}
    </div>
  );
}
