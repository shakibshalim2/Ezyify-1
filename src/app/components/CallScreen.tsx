import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, Video, VideoOff,
  RotateCcw, Phone, PhoneOff,
} from 'lucide-react';

export type CallState =
  | 'calling'     // outgoing: dialing
  | 'ringing'     // incoming: user receives
  | 'connecting'  // establishing connection
  | 'connected'   // active call
  | 'ended'       // normal end
  | 'declined'    // declined by either party
  | 'failed';     // network error

export type CallOutcome = 'answered' | 'missed' | 'declined' | 'failed';

export interface CallSessionData {
  type: 'audio' | 'video';
  direction: 'outgoing' | 'incoming';
  contact: { name: string; avatar: string; username: string };
}

function fmtSecs(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function CallBtn({
  icon: Icon, label, active = false, disabled = false, onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 ${
          active ? 'bg-white text-gray-900' : 'bg-white/15 text-white hover:bg-white/25'
        }`}
      >
        <Icon className="w-[22px] h-[22px]" />
      </button>
      <span className="text-white/55 text-[11px] font-medium whitespace-nowrap">{label}</span>
    </div>
  );
}

interface CallScreenProps {
  session: CallSessionData;
  onEnd: (outcome: CallOutcome, durationSecs: number) => void;
}

export function CallScreen({ session, onEnd }: CallScreenProps) {
  const [state, setState] = useState<CallState>(
    session.direction === 'incoming' ? 'ringing' : 'calling'
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(session.type === 'video');
  const [elapsed, setElapsed] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAll = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (simRef.current) { clearTimeout(simRef.current); simRef.current = null; }
  }, []);

  // Start timer when connected
  useEffect(() => {
    if (state !== 'connected') return;
    const t0 = Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state]);

  // Simulate outgoing call progression
  useEffect(() => {
    if (state !== 'calling') return;
    const willDecline = Math.random() < 0.2;
    const ringMs = 1900 + Math.random() * 1800;
    simRef.current = setTimeout(() => {
      if (willDecline) {
        setState('declined');
        simRef.current = setTimeout(() => onEnd('declined', 0), 2400);
      } else {
        setState('connecting');
        simRef.current = setTimeout(() => setState('connected'), 800);
      }
    }, ringMs);
    return clearAll;
   
  }, []);

  const endCall = useCallback(() => {
    clearAll();
    const dur = elapsed;
    const wasConnected = state === 'connected';
    setState('ended');
    setTimeout(() => onEnd(wasConnected ? 'answered' : 'declined', dur), 1800);
  }, [elapsed, state, clearAll, onEnd]);

  const accept = useCallback(() => {
    clearAll();
    setState('connecting');
    simRef.current = setTimeout(() => setState('connected'), 800);
  }, [clearAll]);

  const decline = useCallback(() => {
    clearAll();
    setState('declined');
    setTimeout(() => onEnd('declined', 0), 1500);
  }, [clearAll, onEnd]);

  const isDone = state === 'ended' || state === 'declined' || state === 'failed';
  const isIncoming = state === 'ringing';
  const isActive = state === 'connected';
  const isPending = state === 'calling' || state === 'connecting';

  const statusLabel =
    state === 'calling'    ? 'Calling…' :
    state === 'ringing'    ? 'Incoming call' :
    state === 'connecting' ? 'Connecting…' :
    state === 'connected'  ? fmtSecs(elapsed) :
    state === 'ended'      ? 'Call ended' :
    state === 'declined'   ? (session.direction === 'outgoing' ? 'Call declined' : 'Call declined') :
    'Connection failed';

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden select-none">
      {/* Blurred avatar background */}
      <div className="absolute inset-0">
        <img src={session.contact.avatar} alt="" className="w-full h-full object-cover scale-110" />
        <div className="absolute inset-0 backdrop-blur-3xl bg-black/72" />
      </div>

      {/* Local video PiP */}
      {session.type === 'video' && isActive && (
        <div className="absolute top-16 right-4 z-10 w-24 h-36 sm:w-28 sm:h-44 rounded-2xl overflow-hidden border-2 border-white/25 shadow-2xl bg-gray-900/80 flex flex-col items-center justify-center gap-1.5">
          <VideoOff className="w-5 h-5 text-white/20" />
          <span className="text-white/25 text-[10px]">You</span>
        </div>
      )}

      <div className="relative z-[1] h-full flex flex-col">
        {/* Top type label */}
        <div className="shrink-0 pt-4 pb-2 px-4 text-center">
          <p className="text-white/40 text-[11px] font-medium uppercase tracking-wider">
            {session.type === 'video' ? 'Video Call' : 'Voice Call'}
          </p>
        </div>

        {/* Center info */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative">
          {/* Incoming ring pulse */}
          {isIncoming && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="absolute rounded-full border-2 border-white/12"
                  style={{
                    width: `${200 + i * 64}px`, height: `${200 + i * 64}px`,
                    animation: `callPing 2.4s ease-out ${i * 0.8}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Avatar */}
          <div
            className={`relative rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl mb-5 transition-all duration-500 ${
              isActive ? 'w-24 h-24' : 'w-28 h-28 sm:w-32 sm:h-32'
            }`}
          >
            <img src={session.contact.avatar} alt={session.contact.name} className="w-full h-full object-cover" />
            {/* Remote camera off overlay */}
            {session.type === 'video' && !isCameraOn && isActive && (
              <div className="absolute inset-0 bg-gray-800/90 flex items-center justify-center">
                <VideoOff className="w-7 h-7 text-white/30" />
              </div>
            )}
          </div>

          <h2 className={`text-white font-bold mb-2 leading-tight transition-all ${
            isActive ? 'text-xl' : 'text-2xl sm:text-3xl'
          }`}>
            {session.contact.name}
          </h2>

          <p className={`font-semibold tabular-nums transition-colors ${
            isActive ? 'text-emerald-400 text-xl' :
            isDone   ? 'text-white/50 text-sm' :
                       'text-white/60 text-sm'
          }`}>
            {statusLabel}
          </p>

          {/* Animated dots while dialing */}
          {isPending && (
            <div className="flex gap-1.5 mt-3">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-white/35 animate-bounce"
                  style={{ animationDelay: `${i * 0.18}s`, animationDuration: '0.85s' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div
          className="shrink-0 px-6"
          style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 2.5rem))' }}
        >
          {isIncoming ? (
            /* Incoming: Decline + Accept */
            <div className="flex items-end justify-center gap-20 pb-2">
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={decline}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 active:scale-90 transition-all flex items-center justify-center shadow-xl shadow-red-500/40"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>
                <span className="text-white/60 text-xs font-medium">Decline</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={accept}
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-90 transition-all flex items-center justify-center shadow-xl shadow-emerald-500/40"
                  style={{ animation: 'acceptPulse 1.8s ease-in-out infinite' }}
                >
                  <Phone className="w-7 h-7 text-white" />
                </button>
                <span className="text-white/60 text-xs font-medium">Accept</span>
              </div>
            </div>
          ) : isDone ? (
            /* Done: close */
            <div className="flex justify-center pb-2">
              <button
                onClick={() => onEnd(
                  state === 'ended' ? (elapsed > 0 ? 'answered' : 'missed') : state === 'declined' ? 'declined' : 'failed',
                  elapsed
                )}
                className="px-7 py-2.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium hover:bg-white/20 active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            /* Active / Calling / Connecting */
            <div className="space-y-5">
              <div className="flex items-center justify-center gap-5 flex-wrap max-w-xs mx-auto">
                <CallBtn
                  icon={isMuted ? MicOff : Mic}
                  label={isMuted ? 'Unmute' : 'Mute'}
                  active={isMuted}
                  onClick={() => setIsMuted(m => !m)}
                />

                <CallBtn
                  icon={isSpeaker ? Volume2 : VolumeX}
                  label="Speaker"
                  active={isSpeaker}
                  onClick={() => setIsSpeaker(s => !s)}
                />

                {session.type === 'video' && (
                  <CallBtn
                    icon={isCameraOn ? Video : VideoOff}
                    label={isCameraOn ? 'Camera' : 'Cam off'}
                    active={!isCameraOn}
                    onClick={() => setIsCameraOn(c => !c)}
                  />
                )}

                {session.type === 'video' && (
                  <CallBtn icon={RotateCcw} label="Flip" onClick={() => {}} />
                )}
              </div>

              <div className="flex justify-center">
                <div className="flex flex-col items-center gap-2.5">
                  <button
                    onClick={endCall}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 active:scale-90 transition-all flex items-center justify-center shadow-xl shadow-red-500/40"
                  >
                    <PhoneOff className="w-7 h-7 text-white" />
                  </button>
                  <span className="text-white/60 text-xs font-medium">End call</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes callPing {
          0%   { transform: scale(0.8); opacity: 0.65; }
          100% { transform: scale(2);   opacity: 0; }
        }
        @keyframes acceptPulse {
          0%,100% { box-shadow: 0 0 0 0   rgba(16,185,129,0.6); }
          50%     { box-shadow: 0 0 0 18px rgba(16,185,129,0);   }
        }
      `}</style>
    </div>
  );
}
