import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { UploadsService } from './uploads.service.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';
import { validation } from '../../common/errors.js';

/** Allow-list of what users may upload. MIME here is the client's claim; the finalize step sniffs real bytes. */
export const ALLOWED_UPLOADS: Record<string, { ext: string; maxBytes: number; kind: 'image' | 'video' }> = {
  'image/jpeg': { ext: 'jpg', maxBytes: 12 * 1024 * 1024, kind: 'image' },
  'image/png': { ext: 'png', maxBytes: 12 * 1024 * 1024, kind: 'image' },
  'image/webp': { ext: 'webp', maxBytes: 12 * 1024 * 1024, kind: 'image' },
  'image/heic': { ext: 'heic', maxBytes: 12 * 1024 * 1024, kind: 'image' },
  'video/mp4': { ext: 'mp4', maxBytes: 250 * 1024 * 1024, kind: 'video' },
  'video/quicktime': { ext: 'mov', maxBytes: 250 * 1024 * 1024, kind: 'video' },
};

const SignSchema = z.object({
  contentType: z.enum(Object.keys(ALLOWED_UPLOADS) as [string, ...string[]]),
  sizeBytes: z.number().int().positive(),
  purpose: z.enum(['post', 'loop', 'story', 'avatar', 'cover', 'product', 'message']),
});
const FinalizeSchema = z.object({ key: z.string().regex(/^u\/[a-z0-9]+\/[a-z]+\/[0-9a-f-]{36}\.[a-z0-9]+$/) });

/**
 * Direct-to-bucket uploads with short-lived signed PUT URLs (ASVS V12): the API never proxies file bytes,
 * the object key is server-generated (no path traversal / overwrite), and `finalize` sniffs the stored bytes'
 * magic numbers to reject files whose real type differs from the declared one.
 */
@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('sign')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async sign(@CurrentUser() user: AccessClaims, @Body(zod(SignSchema)) body: z.infer<typeof SignSchema>) {
    const rule = ALLOWED_UPLOADS[body.contentType];
    if (body.sizeBytes > rule.maxBytes) throw validation({ sizeBytes: `Max ${Math.round(rule.maxBytes / 1024 / 1024)} MB for ${body.contentType}` });
    const key = `u/${user.sub.toLowerCase().replace(/[^a-z0-9]/g, '')}/${body.purpose}/${randomUUID()}.${rule.ext}`;
    return this.uploads.signPut(key, body.contentType, body.sizeBytes);
  }

  @Post('finalize')
  finalize(@CurrentUser() user: AccessClaims, @Body(zod(FinalizeSchema)) body: z.infer<typeof FinalizeSchema>) {
    return this.uploads.finalize(user.sub, body.key);
  }
}
