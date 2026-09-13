import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
      position="top-center"
      richColors
      closeButton
      toastOptions={{ classNames: { toast: 'rounded-xl! border-border! shadow-lg! font-sans!' } }}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
