import { CompressionOptions, CompressionPreset } from './types';

export const COMPRESSION_PRESETS: Record<CompressionPreset, Required<Omit<CompressionOptions, 'preset'>>> = {
  /**
   * Tailored for vehicle inspections, commercial proposals, and damage reports.
   * Keeps plates, VIN numbers, and scratches sharp while slashing file size by 90-95%.
   */
  INSPECTION: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.75,
    format: 'jpeg',
  },

  /**
   * Higher resolution for zoomable parts, detailed interior scans, or legal documents.
   */
  HIGH_DETAIL: {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 0.85,
    format: 'jpeg',
  },

  /**
   * Maximum speed for poor 3G / edge networks. Prioritizes small payload.
   */
  FAST_UPLOAD: {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.65,
    format: 'jpeg',
  },

  /**
   * Lightweight thumbnails for fast offline list caching.
   */
  THUMBNAIL: {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.60,
    format: 'jpeg',
  },
};
