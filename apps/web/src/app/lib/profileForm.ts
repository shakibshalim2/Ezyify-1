import type { UpdateProfileRequest, UserProfile } from '@ezyify/core';

export interface ProfileFormValues {
  name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  avatarUrl: string | null;
  coverUrl: string | null;
}

export const profileToForm = (p: UserProfile): ProfileFormValues => ({ name: p.name, username: p.username, bio: p.bio ?? '', location: p.location ?? '', website: p.website ?? '', avatarUrl: p.avatarUrl, coverUrl: p.coverUrl });

/** Only fields that changed are sent; empty strings clear nullable fields; a bare domain is promoted to https. */
export function diffProfile(initial: ProfileFormValues, current: ProfileFormValues): UpdateProfileRequest {
  const body: UpdateProfileRequest = {};
  const trim = (s: string) => s.trim();
  if (trim(current.name) !== initial.name) body.name = trim(current.name);
  if (trim(current.username).toLowerCase() !== initial.username) body.username = trim(current.username).toLowerCase();
  if (trim(current.bio) !== (initial.bio ?? '')) body.bio = trim(current.bio) || null;
  if (trim(current.location) !== (initial.location ?? '')) body.location = trim(current.location) || null;
  const site = trim(current.website);
  if (site !== (initial.website ?? '')) body.website = site ? (/^https?:\/\//i.test(site) ? site : `https://${site}`) : null;
  if (current.avatarUrl !== initial.avatarUrl) body.avatarUrl = current.avatarUrl;
  if (current.coverUrl !== initial.coverUrl) body.coverUrl = current.coverUrl;
  return body;
}
