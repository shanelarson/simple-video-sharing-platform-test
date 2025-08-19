// Utility functions for file type/size checks and formatted timestamp
export const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB
export const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/mov',
  'video/quicktime',
  'video/x-matroska'
];
export function isSupportedVideoType(mimetype) {
  return VIDEO_MIME_TYPES.includes(mimetype);
}
export function isValidVideoSize(size) {
  return size > 0 && size <= MAX_VIDEO_SIZE;
}
export function formatDateToISOString(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toISOString();
}
export function getCurrentISOString() {
  return new Date().toISOString();
}
