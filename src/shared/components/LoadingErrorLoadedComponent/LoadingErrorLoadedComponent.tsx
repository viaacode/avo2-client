import { Container, Flex, Spinner } from '@viaa/avo2-components';
import React, { FunctionComponent, ReactElement } from 'react';

import { ErrorView } from '../../../error/views';
import { ErrorViewQueryParams } from '../../../error/views/ErrorView';
import useTranslation from '../../../shared/hooks/useTranslation';

export type LoadingState = 'loading' | 'loaded' | 'error';

export interface LoadingInfo extends ErrorViewQueryParams {
	state: LoadingState;
}

export interface LoadingErrorLoadedComponentProps {
	loadingInfo: LoadingInfo;
	notFoundError?: string | null;
	showSpinner?: boolean;
	dataObject: any | undefined | null;
	render: () => ReactElement | null;
}

export const LoadingErrorLoadedComponent: FunctionComponent<LoadingErrorLoadedComponentProps> = ({
	loadingInfo = { state: 'loading' },
	notFoundError,
	showSpinner = true,
	dataObject,
	render,
}) => {
	const { tText, tHtml } = useTranslation();

	const renderSpinner = () => (
		<Container mode="vertical">
			<Flex orientation="horizontal" center>
				<Spinner size="large" />
			</Flex>
		</Container>
	);

	const renderError = () => (
		<ErrorView
			message={
				loadingInfo.message ||
				tHtml(
					'shared/components/loading-error-loaded-component/loading-error-loaded-component___er-is-iets-mis-gegaan-bij-het-laden-van-de-gegevens'
				)
			}
			icon={loadingInfo.icon || 'alert-triangle'}
			actionButtons={loadingInfo.actionButtons || ['home']}
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
					message={
						notFoundError ||
						tText(
							'shared/components/loading-error-loaded-component/loading-error-loaded-component___het-gevraagde-object-is-niet-gevonden'
						)
					}
					icon={'search'}
					actionButtons={['home', 'helpdesk']}
				/>
			);

		case 'loading':
		default:
			return showSpinner ? renderSpinner() : <></>;
	}
};
