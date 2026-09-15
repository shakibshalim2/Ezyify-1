import { MfaCrypto, consumeRecoveryCode, hashRecoveryCode, newRecoveryCodes, totp } from './mfa.crypto.js';

describe('MfaCrypto', () => {
  const key = Buffer.alloc(32, 1);
  it('round-trips and produces a fresh IV per call', () => {
    const c = new MfaCrypto(key);
    const a = c.encrypt('JBSWY3DPEHPK3PXP');
    const b = c.encrypt('JBSWY3DPEHPK3PXP');
    expect(a).not.toBe(b);
    expect(a.startsWith('v1.')).toBe(true);
    expect(c.decrypt(a)).toBe('JBSWY3DPEHPK3PXP');
    expect(c.decrypt(b)).toBe('JBSWY3DPEHPK3PXP');
  });
  it('rejects tampered ciphertext, wrong keys and malformed input', () => {
    const c = new MfaCrypto(key);
    const ct = c.encrypt('secret');
    const [v, iv, tag, data] = ct.split('.');
    const flipped = Buffer.from(data, 'base64url');
    flipped[0] ^= 0xff;
    expect(() => c.decrypt([v, iv, tag, flipped.toString('base64url')].join('.'))).toThrow();
    expect(() => new MfaCrypto(Buffer.alloc(32, 2)).decrypt(ct)).toThrow();
    expect(() => c.decrypt('nope')).toThrow(/Malformed/);
    expect(() => new MfaCrypto(Buffer.alloc(16))).toThrow(/32 bytes/);
  });
  it('fromEnv prefers MFA_ENCRYPTION_KEY and otherwise derives a stable dev key', () => {
    const explicit = Buffer.alloc(32, 9).toString('base64');
    const a = MfaCrypto.fromEnv({ MFA_ENCRYPTION_KEY: explicit, JWT_REFRESH_SECRET: 'r' });
    expect(new MfaCrypto(Buffer.from(explicit, 'base64')).decrypt(a.encrypt('x'))).toBe('x');
    const d1 = MfaCrypto.fromEnv({ JWT_REFRESH_SECRET: 'refresh-secret' });
    const d2 = MfaCrypto.fromEnv({ JWT_REFRESH_SECRET: 'refresh-secret' });
    expect(d2.decrypt(d1.encrypt('y'))).toBe('y');
    expect(() => MfaCrypto.fromEnv({ JWT_REFRESH_SECRET: 'other' }).decrypt(d1.encrypt('y'))).toThrow();
  });
});

describe('recovery codes', () => {
  it('generates 10 unique xxxxx-xxxxx codes with matching hashes', () => {
    const { codes, hashes } = newRecoveryCodes();
    expect(codes).toHaveLength(10);
    expect(new Set(codes).size).toBe(10);
    for (const c of codes) expect(c).toMatch(/^[a-z0-9]{5}-[a-z0-9]{5}$/);
    expect(hashes).toEqual(codes.map(hashRecoveryCode));
  });
  it('consumes a code exactly once, ignoring case and dashes', () => {
    const { codes, hashes } = newRecoveryCodes(3);
    const left = consumeRecoveryCode(hashes, codes[1].toUpperCase().replace('-', ''));
    expect(left).toHaveLength(2);
    expect(consumeRecoveryCode(left!, codes[1])).toBeNull();
    expect(consumeRecoveryCode(left!, codes[0])).toHaveLength(1);
    expect(consumeRecoveryCode(hashes, 'zzzzz-zzzzz')).toBeNull();
  });
});

describe('totp', () => {
  it('verifies a current code (± one step) and rejects garbage', async () => {
    const secret = totp.secret();
    const code = await totp.generate(secret);
    expect(await totp.verify(secret, code)).toBe(true);
    expect(await totp.verify(secret, '12345')).toBe(false);
    expect(await totp.verify(secret, 'abcdef')).toBe(false);
    expect(await totp.verify(totp.secret(), code)).toBe(false);
    expect(totp.uri('a@b.co', secret)).toBe(`otpauth://totp/Ezyify:a%40b.co?secret=${secret}&issuer=Ezyify`);
  });
});
