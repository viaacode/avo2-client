import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useWarningBeforeUnload = ({
	when,
	message,
}: {
	when: boolean;
	message?: string;
}): void => {
	const [t] = useTranslation();
	const messageOrDefault: any =
		message ||
		t('Er zijn nog niet opgeslagen wijzigingen. Weet u zeker dat u de pagina wil verlaten?');

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
