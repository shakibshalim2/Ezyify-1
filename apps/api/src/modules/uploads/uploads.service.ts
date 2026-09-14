import { Inject, Injectable } from '@nestjs/common';
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fileTypeFromBuffer } from 'file-type';
import { ENV, type Env } from '../../config.js';
import { forbidden, validation } from '../../common/errors.js';
import { ALLOWED_UPLOADS } from './uploads.controller.js';

@Injectable()
export class UploadsService {
  private readonly s3: S3Client | null;

  constructor(@Inject(ENV) private readonly env: Env) {
    this.s3 = env.S3_BUCKET
      ? new S3Client({ region: env.S3_REGION ?? 'auto', endpoint: env.S3_ENDPOINT, forcePathStyle: !!env.S3_ENDPOINT, credentials: env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY ? { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY } : undefined })
      : null;
  }

  async signPut(key: string, contentType: string, sizeBytes: number) {
    const s3 = this.require();
    const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket: this.env.S3_BUCKET, Key: key, ContentType: contentType, ContentLength: sizeBytes }), { expiresIn: 300 });
    return { key, url, method: 'PUT', headers: { 'Content-Type': contentType }, expiresInSeconds: 300, publicUrl: this.publicUrl(key) };
  }

  /** Reads the first 4 KB of the stored object and verifies the magic bytes match the extension's allow-listed type. */
  async finalize(userId: string, key: string) {
    const s3 = this.require();
    const owner = key.split('/')[1];
    if (owner !== userId.toLowerCase().replace(/[^a-z0-9]/g, '')) throw forbidden();
    const head = await s3.send(new HeadObjectCommand({ Bucket: this.env.S3_BUCKET, Key: key }));
    const declared = head.ContentType ?? '';
    const rule = ALLOWED_UPLOADS[declared];
    if (!rule || (head.ContentLength ?? 0) > rule.maxBytes) return this.reject(key, 'Unsupported or oversized file');
    const obj = await s3.send(new GetObjectCommand({ Bucket: this.env.S3_BUCKET, Key: key, Range: 'bytes=0-4095' }));
    const bytes = Buffer.from(await obj.Body!.transformToByteArray());
    const sniffed = await fileTypeFromBuffer(bytes);
    if (!sniffed || !this.compatible(sniffed.mime, declared)) return this.reject(key, 'File contents do not match the declared type');
    return { key, url: this.publicUrl(key), contentType: declared, kind: rule.kind, sizeBytes: head.ContentLength ?? 0 };
  }

  private compatible(sniffed: string, declared: string) {
    if (sniffed === declared) return true;
    // quicktime/mp4 share the ISO-BMFF container; heic is reported as image/heic or image/heif.
    const groups = [new Set(['video/mp4', 'video/quicktime']), new Set(['image/heic', 'image/heif'])];
    return groups.some(g => g.has(sniffed) && g.has(declared));
  }

  private async reject(key: string, message: string): Promise<never> {
    await this.s3!.send(new DeleteObjectCommand({ Bucket: this.env.S3_BUCKET, Key: key })).catch(() => undefined);
    throw validation({ file: message });
  }

  private publicUrl(key: string) {
    return `${(this.env.S3_PUBLIC_BASE_URL ?? `https://${this.env.S3_BUCKET}.s3.amazonaws.com`).replace(/\/$/, '')}/${key}`;
  }

  private require() {
    if (!this.s3) throw validation({ storage: 'Uploads are not enabled on this server' }, 'Storage unavailable');
    return this.s3;
  }
}
