import React, { FunctionComponent } from 'react';
import { Prompt, useLocation } from 'react-router-dom';

import useTranslation from '../../../shared/hooks/useTranslation';
import { ROUTE_PARTS } from '../../constants';

export const BeforeUnloadPrompt: FunctionComponent<{ when: boolean; message?: string }> = ({
	when,
	message,
}) => {
	const { tText } = useTranslation();
	const current = useLocation();

	return (
		<Prompt
			// https://github.com/remix-run/react-router/issues/4743#issuecomment-287567549
			message={(next) => {
				// Form has no unsaved changes => do not show the "before unload" message
				if (!when) {
					return true;
				}

				// Same page url => do not show the "before unload" message
				if (current.pathname === next.pathname) {
					return true;
				}

				// Specific tab on the same edit page => do not show the "before unload" message
				// eg: APP_PATH.COLLECTION_EDIT_TAB
				// eg: APP_PATH.BUNDLE_EDIT_TAB
				// eg: APP_PATH.ASSIGNMENT_EDIT_TAB
				const currentRouteWithoutTab =
					current.pathname.split(`/${ROUTE_PARTS.edit}/`)[0] + `/${ROUTE_PARTS.edit}`;
				const nextRouteWithoutTab =
					next.pathname.split(`/${ROUTE_PARTS.edit}/`)[0] + `/${ROUTE_PARTS.edit}`;
				if (currentRouteWithoutTab === nextRouteWithoutTab) {
					return true;
				}

				// Show the "before unload" message
				return (
					message ||
					tText(
						'shared/components/before-unload-prompt/before-unload-prompt___er-zijn-nog-niet-opgeslagen-wijzigingen-weet-u-zeker-dat-u-de-pagina-wil-verlaten'
					)
				);
			}}
		/>
	);
};
