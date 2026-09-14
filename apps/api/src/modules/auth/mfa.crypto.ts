import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { generate, generateSecret, generateURI, verify } from 'otplib';

export const MFA_ISSUER = 'Ezyify';
export const RECOVERY_CODE_COUNT = 10;
/** Codes are shown as `xxxxx-xxxxx`; compared case/dash-insensitively so users can type them from paper. */
const normaliseRecovery = (code: string) => code.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * TOTP secrets are as sensitive as passwords but must be recoverable, so they are AES-256-GCM encrypted with a key
 * that lives only in the environment (`MFA_ENCRYPTION_KEY`). Ciphertext format: `v1.<iv>.<tag>.<data>` (base64url).
 */
export class MfaCrypto {
  constructor(private readonly key: Buffer) {
    if (key.length !== 32) throw new Error('MFA encryption key must be 32 bytes');
  }

  /** Production requires an explicit key; elsewhere derive one from the refresh secret so dev/test need no extra env. */
  static fromEnv(env: { MFA_ENCRYPTION_KEY?: string; JWT_REFRESH_SECRET: string }) {
    const key = env.MFA_ENCRYPTION_KEY ? Buffer.from(env.MFA_ENCRYPTION_KEY, 'base64') : createHash('sha256').update(`mfa:${env.JWT_REFRESH_SECRET}`).digest();
    return new MfaCrypto(key);
  }

  encrypt(plaintext: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const data = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    return ['v1', iv, cipher.getAuthTag(), data].map(p => (typeof p === 'string' ? p : p.toString('base64url'))).join('.');
  }

  decrypt(ciphertext: string) {
    const [version, iv, tag, data] = ciphertext.split('.');
    if (version !== 'v1' || !iv || !tag || !data) throw new Error('Malformed MFA ciphertext');
    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8');
  }
}

export const totp = {
  secret: () => generateSecret(),
  uri: (email: string, secret: string) => generateURI({ issuer: MFA_ISSUER, label: email, secret }),
  /** One 30 s step of drift either way (RFC 6238 §5.2 recommends at most one). */
  verify: async (secret: string, code: string) => /^\d{6}$/.test(code) && (await verify({ secret, token: code, epochTolerance: 30 })).valid,
  /** Test helper / CLI use only — servers never generate user codes. */
  generate: (secret: string) => generate({ secret }),
};

export const hashRecoveryCode = (code: string) => createHash('sha256').update(normaliseRecovery(code)).digest('hex');

export function newRecoveryCodes(count = RECOVERY_CODE_COUNT) {
  const codes = Array.from({ length: count }, () => {
    const raw = randomBytes(6).toString('base64url').toLowerCase().replace(/[^a-z0-9]/g, '').padEnd(10, '0').slice(0, 10);
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
  return { codes, hashes: codes.map(hashRecoveryCode) };
}

/** Returns the remaining hashes when `code` matches one of them, or null. Constant-time per candidate; single use. */
export function consumeRecoveryCode(hashes: string[], code: string): string[] | null {
  const target = Buffer.from(hashRecoveryCode(code), 'hex');
  const idx = hashes.findIndex(h => {
    const buf = Buffer.from(h, 'hex');
    return buf.length === target.length && timingSafeEqual(buf, target);
  });
  return idx === -1 ? null : hashes.filter((_, i) => i !== idx);
}
