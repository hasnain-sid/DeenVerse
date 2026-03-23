import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clapperboard, Clock3, PlayCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useClassroomDetail, useRecordings, type ClassroomRecording } from './useClassroom';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getRecordingKey(recording: ClassroomRecording, index = 0) {
  return recording.egressId ?? recording.createdAt ?? `recording-${index}`;
}

function getRecordingDateLabel(recording: ClassroomRecording) {
  return recording.createdAt ? formatDateTime(recording.createdAt) : 'Unavailable';
}

function formatDuration(duration?: number) {
  if (!duration || duration <= 0) {
    return 'Duration unavailable';
  }

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function RecordingPlayer({ recording }: { recording: ClassroomRecording | null }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!recording?.url || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    const sourceUrl = recording.url;

    if (sourceUrl.includes('.m3u8')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        return;
      }

      let cancelled = false;
      let hlsInstance: { destroy: () => void } | null = null;

      import('hls.js')
        .then(({ default: Hls }) => {
          if (cancelled || !Hls.isSupported()) {
            return;
          }

          const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          hlsInstance = hls;
        })
        .catch(() => {
          video.src = sourceUrl;
        });

      return () => {
        cancelled = true;
        hlsInstance?.destroy();
      };
    }

    video.src = sourceUrl;
    return undefined;
  }, [recording]);

  if (!recording?.url) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-100 text-sm text-slate-500">
        Recording playback is unavailable for this entry.
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      controls
      className="aspect-video w-full rounded-[1.75rem] border border-slate-200 bg-black shadow-xl"
    />
  );
}

export function RecordingViewerPage() {
  const navigate = useNavigate();
  const { id: classroomId } = useParams<{ id: string }>();
  const classroomDetailQuery = useClassroomDetail(classroomId);
  const recordingsQuery = useRecordings(classroomId);
  const [selectedEgressId, setSelectedEgressId] = useState<string | null>(null);

  const recordings = useMemo(
    () => recordingsQuery.data?.recordings ?? [],
    [recordingsQuery.data?.recordings],
  );

  useEffect(() => {
    if (!selectedEgressId && recordings.length > 0) {
      setSelectedEgressId(getRecordingKey(recordings[0]));
    }
  }, [recordings, selectedEgressId]);

  const selectedRecording = useMemo(() => {
    return (
      recordings.find((recording, index) => getRecordingKey(recording, index) === selectedEgressId) ??
      recordings[0] ??
      null
    );
  }, [recordings, selectedEgressId]);

  if (!classroomId || classroomDetailQuery.isLoading || recordingsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40 rounded-full" />
        <Skeleton className="h-[26rem] w-full rounded-[2rem]" />
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <Skeleton className="h-40 rounded-[1.5rem]" />
          <Skeleton className="h-40 rounded-[1.5rem]" />
        </div>
      </div>
    );
  }

  const classroom = classroomDetailQuery.data?.classroom;

  if (classroomDetailQuery.isError || recordingsQuery.isError || !classroom) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <div className="w-[min(32rem,100%)] rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl">
          <Badge className="bg-slate-900 text-white hover:bg-slate-900">Recordings Unavailable</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">We could not load this recording page</h1>
          <p className="mt-3 text-sm text-slate-600">
            The classroom may not exist anymore, or you may not have permission to view its recordings.
          </p>
          <Button className="mt-6" onClick={() => navigate('/classrooms')}>
            Back To Classroom Lobby
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" className="gap-2 rounded-full" onClick={() => navigate('/classrooms')}>
          <ArrowLeft className="h-4 w-4" />
          Back To Lobby
        </Button>
        <Badge className="bg-slate-900 text-white hover:bg-slate-900">Recording Viewer</Badge>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(2,44,34,0.98),rgba(15,23,42,0.96))] p-6 text-white shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Virtual Classroom Archive</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{classroom.title}</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-200">
              Replay session recordings, revisit key explanations, and review teaching notes from this classroom.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Host</p>
            <p className="mt-1 text-sm font-semibold text-white">{classroom.host.name}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm text-emerald-100">
              <Clapperboard className="h-4 w-4" />
              Recordings
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{recordings.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm text-sky-100">
              <Users className="h-4 w-4" />
              Peak Attendance
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{classroom.peakParticipants ?? classroom.participantCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm text-amber-100">
              <Clock3 className="h-4 w-4" />
              Scheduled Length
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{classroom.duration} min</p>
          </div>
        </div>
      </section>

      {recordings.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
          <Clapperboard className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">No recordings yet</h2>
          <p className="mt-3 text-sm text-slate-600">
            When this classroom is recorded, playable session archives will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
            <RecordingPlayer recording={selectedRecording} />
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Selected Recording</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{classroom.title}</h2>
                </div>
                {selectedRecording?.url ? (
                  <Button variant="outline" asChild>
                    <a href={selectedRecording.url} target="_blank" rel="noreferrer">
                      Open File
                    </a>
                  </Button>
                ) : null}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Recorded
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-900">{selectedRecording ? getRecordingDateLabel(selectedRecording) : 'Unavailable'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <Clock3 className="h-3.5 w-3.5" />
                    Runtime
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-900">{formatDuration(selectedRecording?.duration)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    Attendance
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-900">Peak {classroom.peakParticipants ?? classroom.participantCount}</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Playlist</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Available recordings</h2>
              </div>
              <Badge variant="secondary">{recordings.length}</Badge>
            </div>

            <div className="mt-5 space-y-3">
              {recordings.map((recording, index) => {
                const recordKey = getRecordingKey(recording, index);
                const selected = recordKey === (selectedRecording ? getRecordingKey(selectedRecording) : null);

                return (
                  <button
                    key={recordKey}
                    type="button"
                    onClick={() => setSelectedEgressId(recordKey)}
                    className={[
                      'w-full rounded-2xl border px-4 py-4 text-left transition-all',
                      selected
                        ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recording {index + 1}</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{getRecordingDateLabel(recording)}</p>
                      </div>
                      <PlayCircle className={selected ? 'h-5 w-5 text-emerald-600' : 'h-5 w-5 text-slate-400'} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>{formatDuration(recording.duration)}</span>
                      <span>{recording.url ? 'Playable' : 'Unavailable'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
