import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { cn } from './ui/utils';

export interface ConfirmState {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

/** Accessible confirm dialog driven by a piece of state (`null` = closed). Pair with `useState<ConfirmState | null>`. */
export function ConfirmDialog({ state, onClose }: { state: ConfirmState | null; onClose: () => void }) {
  return (
    <AlertDialog open={!!state} onOpenChange={open => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{state?.title}</AlertDialogTitle>
          {state?.message && <AlertDialogDescription>{state.message}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{state?.cancelLabel ?? 'Cancel'}</AlertDialogCancel>
          <AlertDialogAction
            className={cn(state?.destructive && 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}
            onClick={() => {
              state?.onConfirm();
              onClose();
            }}
          >
            {state?.confirmLabel ?? 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
