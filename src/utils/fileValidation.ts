/**
 * File validation utilities for OCR uploads.
 * Backend constraints:
 * - Max file size: 5 MB per file
 * - Max batch size: 10 files
 * - Allowed types: JPEG, JPG, PNG, WebP, TIFF
 */

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_BATCH_SIZE = 10;

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
];

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif'];

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function validateOcrFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Check file type
  const lowerName = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) || file.type === '';

  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: `Unsupported file type "${file.name}". Supported formats: JPEG, PNG, WebP, TIFF.`,
    };
  }

  // Check file size (5MB max)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds 5 MB limit (${formatFileSize(file.size)}).`,
    };
  }

  return { valid: true };
}

export function validateBatchFiles(
  incomingFiles: File[],
  currentCount: number = 0
): { validFiles: File[]; errors: string[] } {
  const errors: string[] = [];
  const validFiles: File[] = [];

  const availableSlots = MAX_BATCH_SIZE - currentCount;
  if (availableSlots <= 0) {
    errors.push(`Maximum batch limit of ${MAX_BATCH_SIZE} files reached.`);
    return { validFiles: [], errors };
  }

  const filesToProcess = incomingFiles.slice(0, availableSlots);
  if (incomingFiles.length > availableSlots) {
    errors.push(`Only ${availableSlots} more file(s) allowed (maximum ${MAX_BATCH_SIZE} per batch).`);
  }

  for (const file of filesToProcess) {
    const validation = validateOcrFile(file);
    if (validation.valid) {
      validFiles.push(file);
    } else if (validation.error) {
      errors.push(validation.error);
    }
  }

  return { validFiles, errors };
}
