import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import type { Endpoints, Media, SignUploadRequest } from '@ezyify/core';
import type { PickedMedia } from './media';
import { uploadFetch } from './runtime';

const MIME_BY_EXT: Record<string, SignUploadRequest['contentType']> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', mp4: 'video/mp4', mov: 'video/quicktime' };

export function contentTypeOf(asset: PickedMedia): SignUploadRequest['contentType'] {
  const fromPicker = asset.mimeType?.toLowerCase();
  if (fromPicker && fromPicker in MIME_BY_EXT_VALUES) return fromPicker as SignUploadRequest['contentType'];
  const ext = asset.uri.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXT[ext] ?? (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
}
const MIME_BY_EXT_VALUES: Record<string, true> = Object.fromEntries(Object.values(MIME_BY_EXT).map(v => [v, true]));

async function readBytes(asset: PickedMedia): Promise<{ bytes: Uint8Array | Blob; size: number }> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(asset.uri)).blob();
    return { bytes: blob, size: blob.size };
  }
  const file = new File(asset.uri);
  const bytes = await file.bytes();
  return { bytes, size: bytes.byteLength };
}

/**
 * Direct-to-bucket upload: sign → PUT bytes → finalize. Returns the `Media` entry for `POST /posts`.
 * Already-remote URLs (e.g. reposting suggested media) skip the upload entirely.
 */
export async function uploadMedia(api: Endpoints, asset: PickedMedia, purpose: SignUploadRequest['purpose'], onProgress?: (p: number) => void): Promise<Media> {
  if (/^https?:\/\//.test(asset.uri)) {
    return { type: asset.type, url: asset.uri, thumbnailUrl: null, width: asset.width || null, height: asset.height || null, durationMs: asset.durationMs };
  }
  const contentType = contentTypeOf(asset);
  const { bytes, size } = await readBytes(asset);
  onProgress?.(0.1);
  const signed = await api.uploads.sign({ contentType, sizeBytes: size, purpose });
  onProgress?.(0.2);
  const res = await uploadFetch(signed.url, { method: signed.method, headers: signed.headers, body: bytes as BodyInit });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  onProgress?.(0.85);
  const done = await api.uploads.finalize(signed.key);
  onProgress?.(1);
  return { type: done.kind, url: done.url, thumbnailUrl: null, width: asset.width || null, height: asset.height || null, durationMs: asset.type === 'video' ? asset.durationMs : null };
}
