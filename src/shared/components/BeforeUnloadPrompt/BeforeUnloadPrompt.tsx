import React, { FunctionComponent } from 'react';
import { Prompt, useLocation } from 'react-router-dom';

import useTranslation from '../../../shared/hooks/useTranslation';

export const BeforeUnloadPrompt: FunctionComponent<{ when: boolean; message?: string }> = ({
	when,
	message,
}) => {
	const { tText } = useTranslation();
	const current = useLocation();

	return (
		<Prompt
			when={when}
			message={(next) => {
				return (
					current.pathname === next.pathname ||
					message ||
					tText(
						'shared/components/before-unload-prompt/before-unload-prompt___er-zijn-nog-niet-opgeslagen-wijzigingen-weet-u-zeker-dat-u-de-pagina-wil-verlaten'
					)
				);
			}}
		/>
	);
};
