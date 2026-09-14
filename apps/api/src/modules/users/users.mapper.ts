import type { UserProfile, UserSummary } from '@ezyify/core';
import type { Role } from '../../generated/prisma/enums.js';

type UserRow = { id: string; username: string; name: string; avatarUrl: string | null; verified: boolean; role: Role };
const publicRole = (r: Role): UserSummary['role'] => (r === 'superadmin' ? 'admin' : r);

export const toUserSummary = (u: UserRow): UserSummary => ({ id: u.id, username: u.username, name: u.name, avatarUrl: u.avatarUrl, verified: u.verified, role: publicRole(u.role) });

export const toUserProfile = (
  u: UserRow & { bio: string | null; coverUrl: string | null; website: string | null; location: string | null; createdAt: Date },
  counts: { followers: number; following: number; posts: number },
  isFollowing?: boolean,
): UserProfile => ({ ...toUserSummary(u), bio: u.bio, coverUrl: u.coverUrl, website: u.website, location: u.location, ...counts, isFollowing, createdAt: u.createdAt.toISOString() });
