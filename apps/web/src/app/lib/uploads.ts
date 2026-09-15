import type { Endpoints, SignUploadRequest } from '@ezyify/core';

const ALLOWED = new Set<string>(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'video/mp4', 'video/quicktime']);

/**
 * Direct-to-bucket upload: sign → PUT bytes → finalize. Returns the public URL.
 * `fetchImpl` is the runtime's transport so demo builds hit the in-process mock bucket.
 */
export async function uploadFile(api: Endpoints, file: File, purpose: SignUploadRequest['purpose'], fetchImpl: typeof fetch = (input, init) => fetch(input, init)): Promise<string> {
  if (!ALLOWED.has(file.type)) throw new Error(`${file.name}: unsupported file type`);
  const signed = await api.uploads.sign({ contentType: file.type as SignUploadRequest['contentType'], sizeBytes: file.size, purpose });
  const res = await fetchImpl(signed.url, { method: signed.method, headers: signed.headers, body: file });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  const done = await api.uploads.finalize(signed.key);
  return done.url;
}
