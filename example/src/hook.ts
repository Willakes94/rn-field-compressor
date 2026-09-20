import { useState, useCallback } from 'react';
import { compressInspectionPhoto } from './compressor';
import { compressBatch } from './batch';
import { BatchOptions, CompressionOptions, CompressionResult } from './types';

export interface UseFieldCompressorState {
  isCompressing: boolean;
  progress: { completed: number; total: number };
  error: Error | null;
  results: CompressionResult[];
}

/**
 * React Hook providing stateful image compression and batch progress tracking.
 */
export function useFieldCompressor() {
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ completed: number; total: number }>({
    completed: 0,
    total: 0,
  });
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<CompressionResult[]>([]);

  const compressOne = useCallback(
    async (uri: string, options?: CompressionOptions): Promise<CompressionResult> => {
      setIsCompressing(true);
      setError(null);
      try {
        const res = await compressInspectionPhoto(uri, options);
        setResults([res]);
        return res;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      } finally {
        setIsCompressing(false);
      }
    },
    []
  );

  const compressMultiple = useCallback(
    async (uris: string[], options?: BatchOptions): Promise<CompressionResult[]> => {
      setIsCompressing(true);
      setError(null);
      setProgress({ completed: 0, total: uris.length });

      try {
        const batchResults = await compressBatch(uris, {
          ...options,
          onProgress: (completed, total) => {
            setProgress({ completed, total });
            if (options?.onProgress) {
              options.onProgress(completed, total);
            }
          },
        });
        setResults(batchResults);
        return batchResults;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      } finally {
        setIsCompressing(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsCompressing(false);
    setProgress({ completed: 0, total: 0 });
    setError(null);
    setResults([]);
  }, []);

  return {
    isCompressing,
    progress,
    error,
    results,
    compressOne,
    compressMultiple,
    reset,
  };
}
