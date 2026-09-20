import * as ImagePicker from 'expo-image-picker';
import { compressInspectionPhoto } from './compressor';
import { compressBatch } from './batch';
import { CompressionOptions, CompressionResult, PickerCompressOptions } from './types';

/**
 * Requests media library permissions, opens the device photo library,
 * and automatically compresses the selected image(s) using field-ready presets.
 *
 * @param options Compression and selection options
 * @returns CompressionResult (single), CompressionResult[] (multiple), or null if canceled
 */
export async function pickAndCompress(
  options: PickerCompressOptions = {}
): Promise<CompressionResult | CompressionResult[] | null> {
  const {
    multiple = false,
    selectionLimit = 20,
    concurrencyLimit = 2,
    onProgress,
    ...compressOptions
  } = options;

  // 1. Request permission if needed
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permission to access photo library was denied.');
  }

  // 2. Launch photo library
  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: multiple,
    selectionLimit: multiple ? selectionLimit : 1,
    quality: 1, // Get raw full-resolution image for the compressor to optimize
  });

  if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
    return null;
  }

  // 3. Process multiple selection
  if (multiple) {
    const uris = pickerResult.assets.map((asset) => asset.uri);
    return await compressBatch(uris, {
      ...compressOptions,
      concurrencyLimit,
      onProgress,
    });
  }

  // 4. Process single selection
  const singleAsset = pickerResult.assets[0];
  return await compressInspectionPhoto(singleAsset.uri, {
    ...compressOptions,
    originalSize: singleAsset.fileSize,
  });
}

/**
 * Requests camera permissions, opens the device camera,
 * and automatically compresses the taken photo.
 *
 * @param options Compression options or presets
 * @returns CompressionResult or null if camera capture was canceled
 */
export async function captureAndCompress(
  options: CompressionOptions = {}
): Promise<CompressionResult | null> {
  // 1. Request camera permission
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Permission to access camera was denied.');
  }

  // 2. Launch camera
  const captureResult = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 1,
  });

  if (captureResult.canceled || !captureResult.assets || captureResult.assets.length === 0) {
    return null;
  }

  const asset = captureResult.assets[0];
  return await compressInspectionPhoto(asset.uri, {
    ...options,
    originalSize: asset.fileSize,
  });
}
