import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Prompt } from 'react-router-dom';

export const BeforeUnloadPrompt: FunctionComponent<{ when: boolean; message?: string }> = ({
	when,
	message,
}) => {
	const [t] = useTranslation();

	return (
		<Prompt
			when={when}
			message={
				message ||
				t(
					'shared/components/before-unload-prompt/before-unload-prompt___er-zijn-nog-niet-opgeslagen-wijzigingen-weet-u-zeker-dat-u-de-pagina-wil-verlaten'
				)
			}
		/>
	);
};