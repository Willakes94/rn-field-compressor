import { compressInspectionPhoto } from './compressor';
import { BatchOptions, CompressionResult } from './types';

/**
 * Compresses an array of photos sequentially in small concurrent chunks.
 * Prevents Out-Of-Memory (OOM) fatal crashes on low-to-mid end mobile devices.
 *
 * @param photoUris Array of local image file URIs
 * @param options Compression and concurrency options
 * @returns Array of CompressionResult
 */
export async function compressBatch(
  photoUris: string[],
  options: BatchOptions = {}
): Promise<CompressionResult[]> {
  const { concurrencyLimit = 2, onProgress, ...compressionOpts } = options;
  const results: CompressionResult[] = [];
  const total = photoUris.length;

  if (total === 0) {
    return [];
  }

  // Cap concurrency limit safely between 1 and 4
  const safeLimit = Math.max(1, Math.min(4, concurrencyLimit));

  for (let i = 0; i < total; i += safeLimit) {
    const chunk = photoUris.slice(i, i + safeLimit);

    const chunkResults = await Promise.all(
      chunk.map((uri) => compressInspectionPhoto(uri, compressionOpts))
    );

    results.push(...chunkResults);

    if (onProgress) {
      onProgress(results.length, total);
    }
  }

  return results;
}
