import { z } from 'zod';
import { IdSchema } from './common.js';
import { SessionSchema, type Session } from './user.js';

export const PasswordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'One uppercase letter')
  .regex(/[a-z]/, 'One lowercase letter')
  .regex(/[0-9]/, 'One number');

export const SignupRequestSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: PasswordSchema,
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
});
export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const SignupResponseSchema = z.object({
  userId: IdSchema,
  email: z.string().email(),
  name: z.string(),
  requiresOTP: z.boolean(),
  otpSentTo: z.enum(['email', 'phone']),
});

export const LoginRequestSchema = z.object({
  identifier: z.string().min(3), // email or phone
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const VerifyOtpRequestSchema = z.object({
  userId: IdSchema,
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
  type: z.enum(['email', 'phone']),
});
export type VerifyOtpRequest = z.infer<typeof VerifyOtpRequestSchema>;

export const ForgotPasswordRequestSchema = z.object({ email: z.string().email() });
export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1),
  password: PasswordSchema,
});

/** Signed-in password change: current password is the re-auth proof; every other session is revoked. */
export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: PasswordSchema,
}).refine(v => v.currentPassword !== v.newPassword, { path: ['newPassword'], message: 'Choose a password you have not used before' });
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

export const LoginResponseSchema = SessionSchema;
export const VerifyOtpResponseSchema = SessionSchema;
export const RefreshResponseSchema = SessionSchema.pick({ accessToken: true, expiresIn: true, refreshToken: true });

// ---- MFA (TOTP) — ASVS 2.8. Enforced at login for seller/admin, opt-in for everyone else.

/** Login succeeded on password but the account has MFA: finish with `POST /auth/mfa/verify`. */
export const MfaChallengeResponseSchema = z.object({
  mfaRequired: z.literal(true),
  /** Opaque, single-use, 5 min TTL. */
  challengeToken: z.string().min(1),
});
export type MfaChallengeResponse = z.infer<typeof MfaChallengeResponseSchema>;

/** Wire shape of `/auth/login`: a full session, or an MFA challenge for accounts with TOTP enabled. */
export const LoginResultSchema = z.union([SessionSchema, MfaChallengeResponseSchema]);
/**
 * Static type of `api.auth.login()`. Deliberately a superset rather than the union so pre-MFA callers that pass the
 * result straight to `commitSession()` keep compiling — but when `mfaRequired` is set the session fields are absent
 * at runtime, so callers must check `isMfaChallenge(result)` first and continue with `api.auth.mfa.verify()`.
 */
export type LoginResult = Session & { mfaRequired?: true; challengeToken?: string };
export const isMfaChallenge = (r: unknown): r is MfaChallengeResponse => MfaChallengeResponseSchema.safeParse(r).success;

export const MfaCodeSchema = z.string().regex(/^\d{6}$/, 'Enter the 6-digit code');
/** TOTP (6 digits) or a recovery code (`xxxxx-xxxxx`). */
export const MfaCodeOrRecoverySchema = z.string().trim().min(6).max(16);

export const MfaVerifyRequestSchema = z.object({ challengeToken: z.string().min(1), code: MfaCodeOrRecoverySchema });
export type MfaVerifyRequest = z.infer<typeof MfaVerifyRequestSchema>;
export const MfaEnableRequestSchema = z.object({ code: MfaCodeSchema });
export type MfaEnableRequest = z.infer<typeof MfaEnableRequestSchema>;
export const MfaDisableRequestSchema = z.object({ code: MfaCodeOrRecoverySchema });
export type MfaDisableRequest = z.infer<typeof MfaDisableRequestSchema>;

export const MfaSetupResponseSchema = z.object({
  /** Base32 secret for manual entry. */
  secret: z.string().min(16),
  /** `otpauth://totp/...` for QR rendering. */
  otpauthUrl: z.string().startsWith('otpauth://'),
  qrLabel: z.string().min(1),
});
export type MfaSetupResponse = z.infer<typeof MfaSetupResponseSchema>;
export const MfaEnableResponseSchema = z.object({ recoveryCodes: z.array(z.string().min(1)).min(1) });
export const MfaStatusSchema = z.object({
  enabled: z.boolean(),
  enabledAt: z.string().nullable(),
  recoveryCodesLeft: z.number().int().min(0),
  /** True for seller/admin accounts: the UI should push them through setup. */
  requiredForRole: z.boolean(),
});
export type MfaStatus = z.infer<typeof MfaStatusSchema>;
