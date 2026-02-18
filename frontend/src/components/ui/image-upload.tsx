import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpload } from '@/hooks/useUpload';
import toast from 'react-hot-toast';

// ── Types ────────────────────────────────────────────

interface ImageUploadProps {
  /** Current value — single URL string or array of URLs. */
  value?: string | string[];
  /** Called when value changes. Returns string for single mode, string[] for multi. */
  onChange: (val: string | string[]) => void;
  /** Max number of files (1 = single mode, >1 = multi mode). Default: 1 */
  maxFiles?: number;
  /** Max file size in megabytes. Default: 5 */
  maxSizeMB?: number;
  /** S3 bucket key. Default: "media" */
  bucket?: string;
  /** Accepted MIME types. Default: images only */
  accept?: string;
  /** Additional class names for the container */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Shape variant */
  variant?: 'square' | 'circle';
  /** Disable the component */
  disabled?: boolean;
}

// ── Component ────────────────────────────────────────

export function ImageUpload({
  value,
  onChange,
  maxFiles = 1,
  maxSizeMB = 5,
  bucket = 'media',
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  className,
  placeholder,
  variant = 'square',
  disabled = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, progress, isUploading } = useUpload();
  const [dragOver, setDragOver] = useState(false);

  // Normalize to array internally
  const isSingle = maxFiles === 1;
  const urls: string[] = Array.isArray(value)
    ? value
    : value
      ? [value]
      : [];

  const canAddMore = urls.length < maxFiles && !isUploading;

  // ── Handlers ─────────────────────────────────────

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files);
      const remaining = maxFiles - urls.length;
      const batch = fileArr.slice(0, remaining);

      if (batch.length === 0) {
        toast.error(`Maximum ${maxFiles} image${maxFiles > 1 ? 's' : ''} allowed`);
        return;
      }

      // Validate size
      const maxBytes = maxSizeMB * 1024 * 1024;
      for (const file of batch) {
        if (file.size > maxBytes) {
          toast.error(`"${file.name}" exceeds the ${maxSizeMB}MB limit`);
          return;
        }
      }

      // Upload sequentially (progress bar shows current file)
      const newUrls = [...urls];
      for (const file of batch) {
        try {
          const result = await upload(file, bucket);
          newUrls.push(result.url);
        } catch {
          toast.error(`Failed to upload "${file.name}"`);
        }
      }

      onChange(isSingle ? newUrls[0] ?? '' : newUrls);
    },
    [urls, maxFiles, maxSizeMB, bucket, upload, onChange, isSingle],
  );

  const handleRemove = useCallback(
    (index: number) => {
      const updated = urls.filter((_, i) => i !== index);
      onChange(isSingle ? '' : updated);
    },
    [urls, onChange, isSingle],
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const openPicker = () => {
    if (!disabled && canAddMore) inputRef.current?.click();
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = ''; // reset so same file can be re-selected
    }
  };

  // ── Single-mode avatar / thumbnail style ─────────

  if (isSingle && variant === 'circle') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled || isUploading}
          className={cn(
            'relative h-24 w-24 rounded-full border-2 border-dashed border-border overflow-hidden',
            'flex items-center justify-center bg-secondary/50 transition-colors',
            'hover:border-primary/50 hover:bg-secondary/80',
            dragOver && 'border-primary bg-primary/5',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-[10px] text-muted-foreground">{progress}%</span>
            </div>
          ) : urls[0] ? (
            <img src={urls[0]} alt="Upload" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          )}
        </button>

        {/* Remove button */}
        {urls[0] && !isUploading && (
          <button
            type="button"
            onClick={() => handleRemove(0)}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Remove photo
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onInputChange}
        />
      </div>
    );
  }

  // ── Multi-mode / standard drop zone ──────────────

  return (
    <div className={cn('space-y-3', className)}>
      {/* Previews */}
      {urls.length > 0 && (
        <div className={cn(
          'grid gap-2',
          urls.length === 1 && 'grid-cols-1',
          urls.length === 2 && 'grid-cols-2',
          urls.length >= 3 && 'grid-cols-2 sm:grid-cols-3',
        )}>
          {urls.map((url, i) => (
            <div
              key={url + i}
              className="relative group rounded-lg overflow-hidden border border-border aspect-video bg-secondary/30"
            >
              <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Uploading…
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Drop zone */}
      {canAddMore && (
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            'w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border',
            'py-6 px-4 bg-secondary/20 transition-colors cursor-pointer',
            'hover:border-primary/40 hover:bg-secondary/40',
            dragOver && 'border-primary bg-primary/5',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            {placeholder || (
              <>
                <span className="font-medium text-foreground">Click to upload</span>{' '}
                or drag and drop
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP{maxSizeMB ? ` • Max ${maxSizeMB}MB` : ''}
            {maxFiles > 1 && ` • Up to ${maxFiles} files`}
          </p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
