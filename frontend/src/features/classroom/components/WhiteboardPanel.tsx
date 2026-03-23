import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type PointerEvent,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDataChannel, useLocalParticipant } from '@livekit/components-react';
import {
  createTLStore,
  getSnapshot,
  loadSnapshot,
  Tldraw,
  type Editor,
  type TLPage,
  type TLStore,
  type TLStoreSnapshot,
  type TLEditorSnapshot,
} from 'tldraw';
import 'tldraw/tldraw.css';
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  LayoutTemplate,
  Maximize2,
  Plus,
  SquareStack,
  Trash2,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  type ClassroomWhiteboardSnapshot,
  useSaveWhiteboard,
  useWhiteboardSnapshot,
} from '../useClassroom';

const SNAPSHOT_TOPIC = 'classroom:whiteboard:sync' as const;
const CURSOR_TOPIC = 'classroom:whiteboard:pointer' as const;
const AUTOSAVE_INTERVAL_MS = 30000;
const SNAPSHOT_BROADCAST_DELAY_MS = 180;
const CURSOR_BROADCAST_INTERVAL_MS = 120;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

interface WhiteboardPanelProps {
  classroomId: string;
  classroomTitle: string;
  isHost: boolean;
  livekitEnabled?: boolean;
}

interface WhiteboardCursorPayload {
  classroomId: string;
  userId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  sentAt: number;
}

interface WhiteboardSnapshotPayload {
  classroomId: string;
  senderId: string;
  sentAt: number;
  snapshot: WhiteboardSnapshotShape;
}

type WhiteboardSnapshotShape = Partial<TLEditorSnapshot> | TLStoreSnapshot;

type WhiteboardCursorMap = Record<string, WhiteboardCursorPayload>;

interface WhiteboardLayoutProps {
  classroomTitle: string;
  isHost: boolean;
  isFullscreen: boolean;
  pages: TLPage[];
  activePageId: TLPage['id'] | null;
  remoteCursors: WhiteboardCursorMap;
  isClearDialogOpen: boolean;
  onToggleFullscreen: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onCreateSlide: () => void;
  onDuplicateSlide: () => void;
  onSelectSlide: (pageId: TLPage['id']) => void;
  onRequestClear: () => void;
  onCancelClear: () => void;
  onConfirmClear: () => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerLeave: () => void;
  children: ReactNode;
}

function parsePayload<T>(payload: Uint8Array): T | null {
  try {
    return JSON.parse(textDecoder.decode(payload)) as T;
  } catch {
    return null;
  }
}

function encodePayload(payload: object) {
  return textEncoder.encode(JSON.stringify(payload));
}

function getCursorColor(identity: string) {
  const palette = ['#0f766e', '#0284c7', '#ca8a04', '#b91c1c', '#7c3aed', '#0891b2'];
  let total = 0;
  for (const char of identity) {
    total += char.charCodeAt(0);
  }
  return palette[total % palette.length];
}

function WhiteboardLayout({
  classroomTitle,
  isHost,
  isFullscreen,
  pages,
  activePageId,
  remoteCursors,
  isClearDialogOpen,
  onToggleFullscreen,
  onPrevSlide,
  onNextSlide,
  onCreateSlide,
  onDuplicateSlide,
  onSelectSlide,
  onRequestClear,
  onCancelClear,
  onConfirmClear,
  onPointerMove,
  onPointerLeave,
  children,
}: WhiteboardLayoutProps) {
  const activeIndex = Math.max(
    0,
    pages.findIndex((page) => page.id === activePageId),
  );
  const activePageLabel = pages[activeIndex]?.name ?? `Slide ${activeIndex + 1}`;

  return (
    <div
      className={cn(
        'absolute inset-0 p-4 md:p-6',
        isFullscreen && 'fixed inset-4 z-40 p-3 md:p-5',
      )}
    >
      <div className="relative h-full overflow-hidden rounded-[1.9rem] border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/92 px-4 md:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <LayoutTemplate className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  Slide-Based Whiteboard
                </Badge>
                {!isHost ? (
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                    View Only
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 truncate text-sm font-semibold text-slate-900">{classroomTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isHost ? (
              <>
                <Button type="button" variant="outline" size="sm" onClick={onDuplicateSlide} className="gap-2">
                  <SquareStack className="h-4 w-4" />
                  Duplicate
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={onCreateSlide} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Slide
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={onRequestClear} className="gap-2 text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              </>
            ) : null}
            <Button type="button" variant="outline" size="icon" onClick={onToggleFullscreen} aria-label={isFullscreen ? 'Exit whiteboard fullscreen' : 'Enter whiteboard fullscreen'}>
              {isFullscreen ? <Expand className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div
          className="absolute inset-x-0 bottom-16 top-16 overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.10),_transparent_24%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,0.92))]"
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
        >
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:26px_26px] opacity-35" />
          <div className="absolute inset-0">{children}</div>

          <div className="pointer-events-none absolute inset-0 z-20">
            {Object.values(remoteCursors).map((cursor) => (
              <motion.div
                key={cursor.userId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute"
                style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
              >
                <div className="relative -translate-x-1 -translate-y-1">
                  <div
                    className="h-4 w-4 rounded-full border-2 border-white shadow-lg"
                    style={{ backgroundColor: cursor.color }}
                  />
                  <div
                    className="mt-1 rounded-full px-2 py-1 text-[11px] font-semibold text-white shadow-lg"
                    style={{ backgroundColor: cursor.color }}
                  >
                    {cursor.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 flex h-16 items-center justify-between border-t border-slate-200 bg-white/92 px-4 md:px-5">
          <div className="hidden items-center gap-2 md:flex">
            <Button type="button" variant="ghost" size="icon" onClick={onPrevSlide} aria-label="Go to previous slide">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              {pages.map((page, index) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => onSelectSlide(page.id)}
                  className={cn(
                    'h-2.5 rounded-full transition-all duration-200',
                    page.id === activePageId ? 'w-8 bg-emerald-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400',
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={onNextSlide} aria-label="Go to next slide">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-sm font-medium text-slate-600">
            {activePageLabel}
          </div>

          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Slide {activeIndex + 1} of {pages.length}
          </div>
        </div>

        <AnimatePresence>
          {isClearDialogOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Clear this whiteboard?</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      This removes all shapes on the current slide and syncs the cleared board to everyone in the room.
                    </p>
                  </div>
                  <button type="button" onClick={onCancelClear} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={onCancelClear}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={onConfirmClear} className="bg-red-600 text-white hover:bg-red-700">
                    Clear Slide
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface ConnectedWhiteboardPanelProps extends WhiteboardPanelProps {
  livekitEnabled: true;
}

function ConnectedWhiteboardPanel({ classroomId, classroomTitle, isHost }: ConnectedWhiteboardPanelProps) {
  const [store] = useState<TLStore>(() => createTLStore());
  const [editor, setEditor] = useState<Editor | null>(null);
  const [pages, setPages] = useState<TLPage[]>([]);
  const [activePageId, setActivePageId] = useState<TLPage['id'] | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [remoteCursors, setRemoteCursors] = useState<WhiteboardCursorMap>({});
  const lastCursorSentAtRef = useRef(0);
  const saveSnapshotTimeoutRef = useRef<number | null>(null);
  const hydratedRef = useRef(false);
  const { localParticipant } = useLocalParticipant();
  const saveWhiteboard = useSaveWhiteboard();
  const whiteboardSnapshotQuery = useWhiteboardSnapshot(classroomId);

  const localIdentity = localParticipant.identity || 'local-participant';
  const localName = localParticipant.name || 'You';
  const localCursorColor = useMemo(() => getCursorColor(localIdentity), [localIdentity]);

  const snapshotChannel = useDataChannel(SNAPSHOT_TOPIC, (message) => {
    const incoming = parsePayload<WhiteboardSnapshotPayload>(message.payload);
    if (!incoming || incoming.classroomId !== classroomId || incoming.senderId === localIdentity) {
      return;
    }

    loadSnapshot(store, incoming.snapshot);
    if (editor) {
      syncPagesFromEditor(editor, setPages, setActivePageId);
    }
  });

  const cursorChannel = useDataChannel(CURSOR_TOPIC, (message) => {
    const incoming = parsePayload<WhiteboardCursorPayload>(message.payload);
    if (!incoming || incoming.classroomId !== classroomId || incoming.userId === localIdentity) {
      return;
    }

    setRemoteCursors((currentValue) => ({
      ...currentValue,
      [incoming.userId]: incoming,
    }));
  });

  const broadcastSnapshot = useCallback(async () => {
    const snapshot = getSnapshot(store) as WhiteboardSnapshotShape;
    const payload: WhiteboardSnapshotPayload = {
      classroomId,
      senderId: localIdentity,
      sentAt: Date.now(),
      snapshot,
    };

    try {
      await snapshotChannel.send(encodePayload(payload), {
        reliable: true,
        topic: SNAPSHOT_TOPIC,
      });
    } catch {
      // Ignore transient channel failures; autosave remains the durable fallback.
    }
  }, [classroomId, localIdentity, snapshotChannel, store]);

  const scheduleSnapshotBroadcast = useCallback(() => {
    if (saveSnapshotTimeoutRef.current) {
      window.clearTimeout(saveSnapshotTimeoutRef.current);
    }

    saveSnapshotTimeoutRef.current = window.setTimeout(() => {
      void broadcastSnapshot();
    }, SNAPSHOT_BROADCAST_DELAY_MS);
  }, [broadcastSnapshot]);

  const persistSnapshot = useCallback(() => {
    if (!isHost || saveWhiteboard.isPending) {
      return;
    }

    const snapshot = getSnapshot(store) as WhiteboardSnapshotShape;
    saveWhiteboard.mutate({
      classroomId,
      snapshot: snapshot as ClassroomWhiteboardSnapshot,
    });
  }, [classroomId, isHost, saveWhiteboard, store]);

  useEffect(() => {
    if (!whiteboardSnapshotQuery.isSuccess || hydratedRef.current) {
      return;
    }

    hydratedRef.current = true;
    const snapshot = whiteboardSnapshotQuery.data?.snapshot;
    if (snapshot) {
      loadSnapshot(store, snapshot as WhiteboardSnapshotShape);
    }
  }, [store, whiteboardSnapshotQuery.data, whiteboardSnapshotQuery.isSuccess]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    syncPagesFromEditor(editor, setPages, setActivePageId);
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    return store.listen(
      () => {
        syncPagesFromEditor(editor, setPages, setActivePageId);
        if (isHost) {
          scheduleSnapshotBroadcast();
        }
      },
      { scope: 'document', source: 'user' },
    );
  }, [editor, isHost, scheduleSnapshotBroadcast, store]);

  useEffect(() => {
    if (!editor || !isHost) {
      return;
    }

    const autosaveId = window.setInterval(() => {
      persistSnapshot();
    }, AUTOSAVE_INTERVAL_MS);

    return () => {
      window.clearInterval(autosaveId);
    };
  }, [editor, isHost, persistSnapshot]);

  useEffect(() => {
    return () => {
      if (saveSnapshotTimeoutRef.current) {
        window.clearTimeout(saveSnapshotTimeoutRef.current);
      }
    };
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      if (!bounds.width || !bounds.height) {
        return;
      }

      const now = Date.now();
      if (now - lastCursorSentAtRef.current < CURSOR_BROADCAST_INTERVAL_MS) {
        return;
      }

      lastCursorSentAtRef.current = now;
      const payload: WhiteboardCursorPayload = {
        classroomId,
        userId: localIdentity,
        name: localName,
        color: localCursorColor,
        x: clamp((event.clientX - bounds.left) / bounds.width),
        y: clamp((event.clientY - bounds.top) / bounds.height),
        sentAt: now,
      };

      void cursorChannel.send(encodePayload(payload), {
        reliable: false,
        topic: CURSOR_TOPIC,
      });
    },
    [classroomId, cursorChannel, localCursorColor, localIdentity, localName],
  );

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((currentValue) => !currentValue);
  }, []);

  const handleCreateSlide = useCallback(() => {
    if (!editor || !isHost) {
      return;
    }

    editor.createPage({ name: `Slide ${pages.length + 1}` });
    const editorPages = editor.getPages();
    const nextPage = editorPages[editorPages.length - 1];
    if (nextPage) {
      editor.setCurrentPage(nextPage.id);
      syncPagesFromEditor(editor, setPages, setActivePageId);
    }
  }, [editor, isHost, pages.length]);

  const handleDuplicateSlide = useCallback(() => {
    if (!editor || !isHost) {
      return;
    }

    const currentPage = editor.getCurrentPage();
    editor.duplicatePage(currentPage);
    const editorPages = editor.getPages();
    const nextPage = editorPages[editorPages.length - 1];
    if (nextPage) {
      editor.setCurrentPage(nextPage.id);
      syncPagesFromEditor(editor, setPages, setActivePageId);
    }
  }, [editor, isHost]);

  const handleSelectSlide = useCallback(
    (pageId: TLPage['id']) => {
      if (!editor) {
        return;
      }

      editor.setCurrentPage(pageId);
      syncPagesFromEditor(editor, setPages, setActivePageId);
      if (isHost) {
        scheduleSnapshotBroadcast();
      }
    },
    [editor, isHost, scheduleSnapshotBroadcast],
  );

  const handlePrevSlide = useCallback(() => {
    if (!editor || pages.length === 0) {
      return;
    }

    const currentIndex = pages.findIndex((page) => page.id === activePageId);
    const nextIndex = currentIndex <= 0 ? pages.length - 1 : currentIndex - 1;
    const nextPage = pages[nextIndex];
    if (nextPage) {
      handleSelectSlide(nextPage.id);
    }
  }, [activePageId, editor, handleSelectSlide, pages]);

  const handleNextSlide = useCallback(() => {
    if (!editor || pages.length === 0) {
      return;
    }

    const currentIndex = pages.findIndex((page) => page.id === activePageId);
    const nextIndex = currentIndex >= pages.length - 1 ? 0 : currentIndex + 1;
    const nextPage = pages[nextIndex];
    if (nextPage) {
      handleSelectSlide(nextPage.id);
    }
  }, [activePageId, editor, handleSelectSlide, pages]);

  const handleConfirmClear = useCallback(() => {
    if (!editor || !isHost) {
      return;
    }

    const ids = Array.from(editor.getCurrentPageShapeIds());
    if (ids.length > 0) {
      editor.deleteShapes(ids);
      scheduleSnapshotBroadcast();
      persistSnapshot();
    }
    setIsClearDialogOpen(false);
  }, [editor, isHost, persistSnapshot, scheduleSnapshotBroadcast]);

  const handleMount = useCallback(
    (editorInstance: Editor) => {
      setEditor(editorInstance);
      editorInstance.updateInstanceState({ isReadonly: !isHost });
      syncPagesFromEditor(editorInstance, setPages, setActivePageId);
    },
    [isHost],
  );

  return (
    <WhiteboardLayout
      classroomTitle={classroomTitle}
      isHost={isHost}
      isFullscreen={isFullscreen}
      pages={pages}
      activePageId={activePageId}
      remoteCursors={remoteCursors}
      isClearDialogOpen={isClearDialogOpen}
      onToggleFullscreen={handleToggleFullscreen}
      onPrevSlide={handlePrevSlide}
      onNextSlide={handleNextSlide}
      onCreateSlide={handleCreateSlide}
      onDuplicateSlide={handleDuplicateSlide}
      onSelectSlide={handleSelectSlide}
      onRequestClear={() => setIsClearDialogOpen(true)}
      onCancelClear={() => setIsClearDialogOpen(false)}
      onConfirmClear={handleConfirmClear}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => undefined}
    >
      <Tldraw store={store} onMount={handleMount} hideUi={!isHost} className="h-full w-full" />
    </WhiteboardLayout>
  );
}

function MockWhiteboardPanel({ classroomTitle, isHost }: WhiteboardPanelProps) {
  const [store] = useState<TLStore>(() => createTLStore());
  const [editor, setEditor] = useState<Editor | null>(null);
  const [pages, setPages] = useState<TLPage[]>([]);
  const [activePageId, setActivePageId] = useState<TLPage['id'] | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  useEffect(() => {
    if (!editor) {
      return;
    }

    return store.listen(
      () => {
        syncPagesFromEditor(editor, setPages, setActivePageId);
      },
      { scope: 'document', source: 'user' },
    );
  }, [editor, store]);

  const handleMount = useCallback(
    (editorInstance: Editor) => {
      setEditor(editorInstance);
      editorInstance.updateInstanceState({ isReadonly: !isHost });
      syncPagesFromEditor(editorInstance, setPages, setActivePageId);
    },
    [isHost],
  );

  const handleSelectSlide = useCallback(
    (pageId: TLPage['id']) => {
      if (!editor) {
        return;
      }

      editor.setCurrentPage(pageId);
      syncPagesFromEditor(editor, setPages, setActivePageId);
    },
    [editor],
  );

  const handleCreateSlide = useCallback(() => {
    if (!editor || !isHost) {
      return;
    }

    editor.createPage({ name: `Slide ${pages.length + 1}` });
    const editorPages = editor.getPages();
    const nextPage = editorPages[editorPages.length - 1];
    if (nextPage) {
      editor.setCurrentPage(nextPage.id);
      syncPagesFromEditor(editor, setPages, setActivePageId);
    }
  }, [editor, isHost, pages.length]);

  const handleDuplicateSlide = useCallback(() => {
    if (!editor || !isHost) {
      return;
    }

    const currentPage = editor.getCurrentPage();
    editor.duplicatePage(currentPage);
    const editorPages = editor.getPages();
    const nextPage = editorPages[editorPages.length - 1];
    if (nextPage) {
      editor.setCurrentPage(nextPage.id);
      syncPagesFromEditor(editor, setPages, setActivePageId);
    }
  }, [editor, isHost]);

  const handlePrevSlide = useCallback(() => {
    if (!editor || pages.length === 0) {
      return;
    }

    const currentIndex = pages.findIndex((page) => page.id === activePageId);
    const nextIndex = currentIndex <= 0 ? pages.length - 1 : currentIndex - 1;
    const nextPage = pages[nextIndex];
    if (nextPage) {
      handleSelectSlide(nextPage.id);
    }
  }, [activePageId, editor, handleSelectSlide, pages]);

  const handleNextSlide = useCallback(() => {
    if (!editor || pages.length === 0) {
      return;
    }

    const currentIndex = pages.findIndex((page) => page.id === activePageId);
    const nextIndex = currentIndex >= pages.length - 1 ? 0 : currentIndex + 1;
    const nextPage = pages[nextIndex];
    if (nextPage) {
      handleSelectSlide(nextPage.id);
    }
  }, [activePageId, editor, handleSelectSlide, pages]);

  const handleConfirmClear = useCallback(() => {
    if (!editor || !isHost) {
      return;
    }

    const ids = Array.from(editor.getCurrentPageShapeIds());
    if (ids.length > 0) {
      editor.deleteShapes(ids);
    }
    setIsClearDialogOpen(false);
  }, [editor, isHost]);

  return (
    <WhiteboardLayout
      classroomTitle={classroomTitle}
      isHost={isHost}
      isFullscreen={isFullscreen}
      pages={pages}
      activePageId={activePageId}
      remoteCursors={{}}
      isClearDialogOpen={isClearDialogOpen}
      onToggleFullscreen={() => setIsFullscreen((currentValue) => !currentValue)}
      onPrevSlide={handlePrevSlide}
      onNextSlide={handleNextSlide}
      onCreateSlide={handleCreateSlide}
      onDuplicateSlide={handleDuplicateSlide}
      onSelectSlide={handleSelectSlide}
      onRequestClear={() => setIsClearDialogOpen(true)}
      onCancelClear={() => setIsClearDialogOpen(false)}
      onConfirmClear={handleConfirmClear}
      onPointerMove={() => undefined}
      onPointerLeave={() => undefined}
    >
      <div className="absolute left-4 top-4 z-30 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 shadow-sm">
        Mock Mode: local-only whiteboard preview
      </div>
      <Tldraw store={store} onMount={handleMount} hideUi={!isHost} className="h-full w-full" />
    </WhiteboardLayout>
  );
}

function syncPagesFromEditor(
  editor: Editor,
  setPages: Dispatch<SetStateAction<TLPage[]>>,
  setActivePageId: Dispatch<SetStateAction<TLPage['id'] | null>>,
) {
  setPages(editor.getPages());
  setActivePageId(editor.getCurrentPageId());
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function WhiteboardPanel({ livekitEnabled = false, ...props }: WhiteboardPanelProps) {
  if (livekitEnabled) {
    return <ConnectedWhiteboardPanel {...props} livekitEnabled={true} />;
  }

  return <MockWhiteboardPanel {...props} />;
}
