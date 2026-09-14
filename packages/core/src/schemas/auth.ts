import { z } from 'zod';
import { IdSchema } from './common.js';
import { SessionSchema } from './user.js';

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

export const LoginResponseSchema = SessionSchema;
export const VerifyOtpResponseSchema = SessionSchema;
export const RefreshResponseSchema = SessionSchema.pick({ accessToken: true, expiresIn: true, refreshToken: true });
