import { type RefObject, useEffect } from 'react';

export const useDisablePictureInPicture = (ref: RefObject<HTMLElement>) => {
  const observer = new MutationObserver(() => {
    Array.from(document.getElementsByTagName('video')).forEach((element) => {
      element.disablePictureInPicture = true;
    });
  });

  useEffect(() => {
    if (ref.current) {
      observer.observe(ref.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => observer.disconnect();
  });
};
