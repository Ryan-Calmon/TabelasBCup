import { useEffect } from 'react';

/**
 * Force the admin section into light theme by stripping the global `dark` class
 * from <html> while the admin page is mounted. Restores it on unmount.
 */
export function useAdminTheme() {
  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains('dark');
    if (wasDark) html.classList.remove('dark');
    return () => {
      if (wasDark) html.classList.add('dark');
    };
  }, []);
}
