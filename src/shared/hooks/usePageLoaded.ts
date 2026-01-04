import { useEffect, useState } from 'react';

export const usePageLoaded = (callback: () => void, enabled: boolean): void => {
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (!enabled) {
        // Disabled after being enabled => stop observer
        observer.disconnect();
        return;
      }
      if (document.querySelector('.c-spinner')) {
        // Still loading => wait for next observer call
        return;
      }
      // Fully loaded => wait a final 100ms before calling the callback (cheap debounce)
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const timeoutIdTemp = window.setTimeout(() => {
        // Fully loaded => call the callback and stop the observer
        observer.disconnect();
        callback();
      }, 100); // Give the react components time to mount fully
      setTimeoutId(timeoutIdTemp);
    });
    observer.observe(document.documentElement);
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Stop the observer since the hook is being unloaded
      observer.disconnect();
    };
  }, [enabled]);
};
