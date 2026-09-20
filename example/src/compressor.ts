import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { CompressionOptions, CompressionResult } from './types';
import { COMPRESSION_PRESETS } from './constants';

/**
 * Compresses a single photo with field-optimized defaults.
 *
 * @param photoUri Local file URI (from camera or image picker)
 * @param options Custom options or predefined preset
 * @returns CompressionResult with resulting URI and before/after metrics
 */
export async function compressInspectionPhoto(
  photoUri: string,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const startTime = Date.now();

  // Resolve options based on preset if selected
  const baseConfig = options.preset
    ? COMPRESSION_PRESETS[options.preset]
    : COMPRESSION_PRESETS.INSPECTION;

  const maxWidth = options.maxWidth ?? baseConfig.maxWidth;
  const quality = options.quality ?? baseConfig.quality;
  const format = options.format ?? baseConfig.format;

  // 1. Measure original file size
  let originalBytes = 0;
  try {
    const originalInfo = await FileSystem.getInfoAsync(photoUri);
    if (originalInfo.exists && typeof originalInfo.size === 'number') {
      originalBytes = originalInfo.size;
    }
  } catch {
    // Graceful fallback if file system stat fails
    originalBytes = 0;
  }
  const originalSizeKB = Math.round(originalBytes / 1024);

  // 2. Perform intelligent aspect-ratio preserving resize & compression
  const saveFormat =
    format === 'png'
      ? ImageManipulator.SaveFormat.PNG
      : format === 'webp'
      ? ImageManipulator.SaveFormat.WEBP
      : ImageManipulator.SaveFormat.JPEG;

  const manipResult = await ImageManipulator.manipulateAsync(
    photoUri,
    [{ resize: { width: maxWidth } }],
    {
      compress: Math.max(0.1, Math.min(1.0, quality)),
      format: saveFormat,
    }
  );

  // 3. Measure post-compression file size
  let compressedBytes = 0;
  try {
    const compressedInfo = await FileSystem.getInfoAsync(manipResult.uri);
    if (compressedInfo.exists && typeof compressedInfo.size === 'number') {
      compressedBytes = compressedInfo.size;
    }
  } catch {
    compressedBytes = 0;
  }
  const compressedSizeKB = Math.round(compressedBytes / 1024);

  // 4. Calculate reduction ratio
  const savedBytes = Math.max(0, originalBytes - compressedBytes);
  const reductionPercentage =
    originalBytes > 0
      ? Number(((savedBytes / originalBytes) * 100).toFixed(1))
      : 0;

  return {
    uri: manipResult.uri,
    originalSizeKB,
    compressedSizeKB,
    reductionPercentage,
    width: manipResult.width,
    height: manipResult.height,
    processingTimeMs: Date.now() - startTime,
  };
}
