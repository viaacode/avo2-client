import { useEffect } from 'react';

import { tText } from '../helpers/translate-text';

export const useWarningBeforeUnload = ({
  when,
  message,
}: {
  when: boolean;
  message?: string;
}): void => {
  const messageOrDefault: any =
    message ||
    tText(
      'shared/hooks/use-warning-before-unload___er-zijn-nog-niet-opgeslagen-wijzigingen-weet-u-zeker-dat-u-de-pagina-wil-verlaten',
    );

  useEffect(() => {
    const handleBeforeUnload = (event: Event) => {
      event.preventDefault();
      event.returnValue = messageOrDefault as any;
      return messageOrDefault;
    };

    if (when) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [when, messageOrDefault]);
};
