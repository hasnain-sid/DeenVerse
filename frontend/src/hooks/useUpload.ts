import { useState, useCallback } from 'react';
import api from '@/lib/api';

interface UploadResult {
  url: string;
  key: string;
}

interface UseUploadReturn {
  upload: (file: File, bucket?: string) => Promise<UploadResult>;
  progress: number;
  isUploading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Hook that handles the full presigned-URL upload cycle:
 *   1. POST /upload/presign  → get presigned S3 PUT url
 *   2. PUT file to S3        → direct upload with progress tracking
 *   3. POST /upload/confirm  → verify file landed in S3
 *
 * Returns the final CDN / public URL.
 */
export function useUpload(): UseUploadReturn {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
    setError(null);
  }, []);

  const upload = useCallback(async (file: File, bucket = 'media'): Promise<UploadResult> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // ── Step 1: get presigned URL ──────────────────
      const { data: presign } = await api.post('/upload/presign', {
        bucket,
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      if (!presign.success) {
        throw new Error(presign.message || 'Failed to get upload URL');
      }

      const { uploadUrl, key } = presign;

      // ── Step 2: upload directly to S3 via XHR (for progress) ──
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`S3 upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload network error')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

        xhr.send(file);
      });

      // ── Step 3: confirm the upload ─────────────────
      const { data: confirm } = await api.post('/upload/confirm', { bucket, key });

      if (!confirm.success) {
        throw new Error(confirm.message || 'Upload confirmation failed');
      }

      setProgress(100);
      return { url: confirm.url, key };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Upload failed';
      setError(msg);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { upload, progress, isUploading, error, reset };
}
