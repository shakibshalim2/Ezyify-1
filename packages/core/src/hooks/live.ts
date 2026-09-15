import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateLiveSessionRequest, LiveHeartbeat, LiveSessionsQuery, PinLiveSessionRequest } from '../schemas/index.js';
import { useApi, useAuth } from './index.js';

export const liveKeys = {
  sessions: (query: LiveSessionsQuery = {}) => ['live', 'sessions', query] as const,
  session: (id: string) => ['live', 'session', id] as const,
};

export function useLiveSessions(query: LiveSessionsQuery = {}) {
  const api = useApi();
  return useQuery({
    queryKey: liveKeys.sessions(query),
    queryFn: () => api.live.sessions(query),
    refetchInterval: query.status === 'live' || !query.status ? 15_000 : false,
  });
}

export function useLiveSession(id: string | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: liveKeys.session(id ?? ''),
    queryFn: () => api.live.session(id!),
    enabled: !!id,
    refetchInterval: 10_000,
  });
}

export function useCreateLiveSession() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateLiveSessionRequest) => api.live.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['live', 'sessions'] }),
  });
}

export function useLiveSessionAction() {
  const api = useApi();
  const qc = useQueryClient();
  const refresh = (id: string) => {
    qc.invalidateQueries({ queryKey: ['live', 'sessions'] });
    qc.invalidateQueries({ queryKey: liveKeys.session(id) });
  };
  const start = useMutation({ mutationFn: (id: string) => api.live.start(id), onSuccess: (_, id) => refresh(id) });
  const end = useMutation({ mutationFn: (id: string) => api.live.end(id), onSuccess: (_, id) => refresh(id) });
  const pin = useMutation({ mutationFn: ({ id, body }: { id: string; body: PinLiveSessionRequest }) => api.live.pin(id, body), onSuccess: (_, { id }) => refresh(id) });
  return { start, end, pin };
}

/** Maintains viewer presence while the session is open; likes update the displayed count immediately. */
export function useLiveHeartbeat(id: string | undefined, enabled: boolean) {
  const api = useApi();
  const authenticated = useAuth(s => s.status === 'authenticated');
  const [latest, setLatest] = useState<LiveHeartbeat | undefined>();
  const send = (like = false) => api.live.heartbeat(id!, like).then(result => {
    setLatest(result);
    return result;
  });

  useEffect(() => {
    if (!id || !enabled || !authenticated) return;
    void send();
    const interval = setInterval(() => void send(), 20_000);
    return () => clearInterval(interval);
  }, [id, enabled, authenticated]); // `api` is runtime-stable.

  const like = () => {
    if (!id || !authenticated) return Promise.resolve(latest);
    setLatest(current => current && { ...current, likes: current.likes + 1 });
    return send(true);
  };
  return { ...latest, like };
}
