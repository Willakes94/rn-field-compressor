export type ImageFormat = 'jpeg' | 'png' | 'webp';

export type CompressionPreset = 'INSPECTION' | 'HIGH_DETAIL' | 'FAST_UPLOAD' | 'THUMBNAIL';

export interface CompressionOptions {
  /**
   * Maximum target width for the resized image. Aspect ratio is always preserved.
   * Default: 1600 (ideal for vehicle chassis, license plates, and document readability)
   */
  maxWidth?: number;

  /**
   * Maximum target height for the resized image.
   * Default: 1600
   */
  maxHeight?: number;

  /**
   * Compression factor between 0.0 and 1.0.
   * Default: 0.75 (optimal balance between sharpness and small payload)
   */
  quality?: number;

  /**
   * Target format for output file.
   * Default: 'jpeg'
   */
  format?: ImageFormat;

  /**
   * Predefined compression preset. Overrides custom parameters if provided.
   */
  preset?: CompressionPreset;

  /**
   * Optional pre-known original file size in bytes (e.g. from ImagePicker asset.fileSize).
   */
  originalSize?: number | null;
}

export interface CompressionResult {
  /**
   * Local file URI pointing to the compressed image ready for display or upload.
   */
  uri: string;

  /**
   * Original image size in kilobytes (KB).
   */
  originalSizeKB: number;

  /**
   * Compressed image size in kilobytes (KB).
   */
  compressedSizeKB: number;

  /**
   * Size reduction percentage (e.g. 94.8 for 94.8% reduction).
   */
  reductionPercentage: number;

  /**
   * Width of the compressed image in pixels.
   */
  width: number;

  /**
   * Height of the compressed image in pixels.
   */
  height: number;

  /**
   * Total processing duration in milliseconds.
   */
  processingTimeMs: number;
}

export interface BatchOptions extends CompressionOptions {
  /**
   * Number of images processed concurrently.
   * Kept small (default: 2) to protect mobile RAM and avoid Out-Of-Memory (OOM) crashes on budget Android devices.
   */
  concurrencyLimit?: number;

  /**
   * Progress callback invoked whenever an image in the batch finishes processing.
   */
  onProgress?: (completed: number, total: number) => void;
}

export interface PickerCompressOptions extends CompressionOptions {
  /**
   * Whether to allow selecting multiple images from the photo library.
   * Default: false
   */
  multiple?: boolean;

  /**
   * Maximum number of items that can be selected when multiple is true.
   * Default: 20
   */
  selectionLimit?: number;

  /**
   * Concurrency limit when processing batch selection.
   * Default: 2
   */
  concurrencyLimit?: number;

  /**
   * Batch progress callback.
   */
  onProgress?: (completed: number, total: number) => void;
}
