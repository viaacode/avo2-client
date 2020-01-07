import React, { FunctionComponent, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Flex, IconName, Spinner } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { Permissions, PermissionService } from '../../../authentication/helpers/permission-service';
import { ErrorView } from '../../../error/views';

export type LoadingState = 'loading' | 'loaded' | 'error';

export interface LoadingInfo {
	state: LoadingState;
	message?: string;
	icon?: IconName;
}

export interface LoadingErrorLoadedComponentProps {
	loadingInfo: LoadingInfo;
	notFoundError?: string | null;
	showSpinner?: boolean;
	dataObject: any | undefined | null;
	render: () => ReactElement | null;
}

const LoadingErrorLoadedComponent: FunctionComponent<LoadingErrorLoadedComponentProps> = ({
	loadingInfo = { state: 'loading' },
	notFoundError,
	showSpinner = true,
	dataObject,
	render,
}) => {
	const [t] = useTranslation();

	const renderSpinner = () => (
		<Flex orientation="horizontal" center>
			<Spinner size="large" />
		</Flex>
	);

	const renderError = () => (
		<ErrorView
			message={loadingInfo.message || t('Er is iets mis gegaan bij het laden van de gegevens')}
			icon={loadingInfo.icon || 'alert-triangle'}
		/>
	);

	// Render
	switch (loadingInfo.state) {
		case 'error':
			return renderError();

		case 'loaded':
			if (dataObject) {
				return render();
			}
			return (
				<ErrorView
					message={notFoundError || t('Het gevraagde object is niet gevonden')}
					icon={'search'}
				/>
			);

		case 'loading':
		default:
			return showSpinner ? renderSpinner() : <></>;
	}
};

export async function checkPermissions(
	permissions: Permissions,
	user: Avo.User.User,
	successFunc: () => void,
	setLoadingInfo: (info: LoadingInfo) => void,
	t: (key: string) => string,
	noPermissionsMessage?: string
) {
	try {
		if (await PermissionService.hasPermissions(permissions, user)) {
			successFunc();
		} else {
			setLoadingInfo({
				state: 'error',
				message: noPermissionsMessage || t('Je hebt geen rechten voor deze pagina'),
				icon: 'lock',
			});
		}
	} catch (err) {
		console.error('Failed to check permissions', err, { permissions, user });
		setLoadingInfo({
			state: 'error',
			message: t('Er ging iets mis tijdens het controleren van de rechten van je account'),
			icon: 'alert-triangle',
		});
	}
}

export default LoadingErrorLoadedComponent;
