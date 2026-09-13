import { useNavigate } from 'react-router';

/**
 * Safe navigation hook that provides a fallback if Router context is not available
 * This is useful for components that might be rendered outside Router during development/preview
 */
export function useSafeNavigate() {
  let navigate: ((path: string) => void);
  
  try {
    // Try to use React Router's navigate
    const routerNavigate = useNavigate();
    navigate = routerNavigate;
  } catch (error) {
    // Fallback to window.location if Router context is not available
    console.warn('Router context not available, using window.location fallback');
    navigate = (path: string) => {
      window.location.href = path;
    };
  }
  
  return navigate;
}
