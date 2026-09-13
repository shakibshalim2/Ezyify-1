import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

// Success State
export function SuccessMessage({ 
  title = 'Success!', 
  message, 
  onClose 
}: { 
  title?: string; 
  message: string; 
  onClose?: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-lg">
      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-success" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="px-6 py-3 bg-success text-success-foreground rounded-full shadow-sm hover:bg-success/90 transition-all font-semibold"
        >
          Continue
        </button>
      )}
    </div>
  );
}

// Alias for backward compatibility
export const SuccessState = SuccessMessage;

// Error State
export function ErrorState({ 
  title, 
  message, 
  retry 
}: { 
  title: string;
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-lg">
      <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-error" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      {message && <p className="text-muted-foreground mb-6">{message}</p>}
      {retry && (
        <button
          onClick={retry}
          className="px-6 py-3 text-white rounded-full shadow-brand hover:shadow-brand-lg transition-all font-semibold" style={{ background: "var(--brand-gradient)" }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// Warning State
export function WarningState({ 
  title, 
  message, 
  onConfirm,
  onCancel,
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel'
}: { 
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-lg">
      <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-warning" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{message}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-muted text-foreground rounded-full hover:bg-muted/80 transition-colors font-medium"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-3 text-white rounded-full shadow-brand hover:shadow-brand-lg transition-all font-semibold" style={{ background: "var(--brand-gradient)" }}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

// Toast Notification
export function Toast({ 
  type = 'info',
  message,
  duration = 3000,
  onClose 
}: { 
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeConfig = {
    success: { bg: 'bg-success', icon: CheckCircle2 },
    error: { bg: 'bg-error', icon: AlertCircle },
    warning: { bg: 'bg-warning', icon: AlertTriangle },
    info: { bg: 'bg-info', icon: Info }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`${config.bg} text-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3 max-w-md`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <p className="flex-1 text-sm font-medium">{message}</p>
          <button 
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Button States
export function ButtonState({ 
  state,
  children,
  onClick,
  className = ''
}: { 
  state: 'idle' | 'loading' | 'success' | 'error';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const stateContent = {
    idle: children,
    loading: (
      <span className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        Processing...
      </span>
    ),
    success: (
      <span className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" />
        Success!
      </span>
    ),
    error: (
      <span className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Failed
      </span>
    )
  };

  return (
    <button
      onClick={onClick}
      disabled={state === 'loading'}
      className={`px-6 py-3 text-white rounded-full shadow-brand hover:shadow-brand-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ background: 'var(--brand-gradient)' }}
    >
      {stateContent[state]}
    </button>
  );
}

// Confirmation Dialog
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl"
      >
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-muted text-foreground rounded-full hover:bg-muted/80 transition-colors font-medium"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 text-white rounded-full hover:shadow-lg transition-shadow font-medium ${
              destructive 
                ? 'bg-error hover:bg-error/90' 
                : ''
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Like Animation
export function LikeAnimation({ isLiked }: { isLiked: boolean }) {
  return (
    <AnimatePresence>
      {isLiked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-20 h-20 bg-error rounded-full flex items-center justify-center">
            <span className="text-4xl">❤️</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Progress Bar
export function ProgressBar({ progress, label }: { progress: number; label?: string }) {
  return (
    <div className="w-full">
      {label && <p className="text-sm font-medium text-foreground mb-2">{label}</p>}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full" style={{ background: 'var(--brand-gradient)' }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
    </div>
  );
}

// Badge Notification
export function BadgeNotification({ count, onClick }: { count: number; onClick?: () => void }) {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 cursor-pointer"
      onClick={onClick}
    >
      {count > 99 ? '99+' : count}
    </motion.div>
  );
}

// Skeleton Pulse
export function SkeletonPulse({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className}`} />
  );
}