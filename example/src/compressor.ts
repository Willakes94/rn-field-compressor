import * as ImageManipulator from 'expo-image-manipulator';
import { CompressionOptions, CompressionResult } from './types';
import { COMPRESSION_PRESETS } from './constants';

/**
 * Safely resolves the size of a local file in bytes across Expo SDK versions and platforms.
 */
export async function getFileSizeInBytes(fileUri: string, knownSize?: number | null): Promise<number> {
  if (typeof knownSize === 'number' && knownSize > 0) {
    return knownSize;
  }

  // Strategy 1: New Expo SDK 54+ File class (supports File.size property)
  try {
    const ExpoFS = require('expo-file-system');
    if (ExpoFS && ExpoFS.File) {
      const file = new ExpoFS.File(fileUri);
      if (typeof file.size === 'number' && file.size > 0) {
        return file.size;
      }
    }
  } catch {}

  // Strategy 2: Expo FileSystem Legacy (SDK 52-57 compatible without throwing warnings)
  try {
    const LegacyFS = require('expo-file-system/legacy');
    if (LegacyFS && typeof LegacyFS.getInfoAsync === 'function') {
      const info = await LegacyFS.getInfoAsync(fileUri);
      if (info && info.exists && typeof info.size === 'number' && info.size > 0) {
        return info.size;
      }
    }
  } catch {}

  // Strategy 3: Standard getInfoAsync (older SDKs)
  try {
    const StandardFS = require('expo-file-system');
    if (StandardFS && typeof StandardFS.getInfoAsync === 'function') {
      const info = await StandardFS.getInfoAsync(fileUri);
      if (info && info.exists && typeof info.size === 'number' && info.size > 0) {
        return info.size;
      }
    }
  } catch {}

  // Strategy 4: Universal React Native fetch blob (iOS/Android native network/file cache)
  try {
    const res = await fetch(fileUri);
    const blob = await res.blob();
    if (blob && typeof blob.size === 'number' && blob.size > 0) {
      return blob.size;
    }
  } catch {}

  return 0;
}

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
  const originalBytes = await getFileSizeInBytes(photoUri, options.originalSize);
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
  const compressedBytes = await getFileSizeInBytes(manipResult.uri);
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
