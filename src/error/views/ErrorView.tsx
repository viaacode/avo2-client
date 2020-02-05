import { History, Location } from 'history';
import queryString from 'querystring';
import React, { FunctionComponent, ReactNode } from 'react';
import { match, RouteComponentProps, withRouter } from 'react-router';

import { Blankslate, Button, Container, IconName } from '@viaa/avo2-components';

import { useTranslation } from 'react-i18next';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { APP_PATH } from '../../constants';
import i18n from '../../shared/translations/i18n';

export type ErrorActionButton = 'home' | 'helpdesk';

interface ErrorViewQueryParams {
	message?: string;
	icon?: IconName;
}

interface ErrorViewProps extends RouteComponentProps {
	message?: string;
	icon?: IconName;
	actionButtons?: ErrorActionButton[];
	children?: ReactNode;
	history: History;
	match: match<ErrorViewQueryParams>;
	location: Location;
}

const ErrorView: FunctionComponent<ErrorViewProps> = ({
	message,
	icon,
	children = null,
	history,
	location,
	actionButtons = [],
}) => {
	const [t] = useTranslation();

	const queryParams = queryString.parse(
		(location.search || '').substring(1)
	) as ErrorViewQueryParams;
	const errorMessage: string =
		queryParams.message ||
		message ||
		i18n.t('error/views/error-view___de-pagina-werd-niet-gevonden');
	const errorIcon: IconName = queryParams.icon || icon || 'search';

	return (
		<Container mode="vertical" background="alt">
			<Container size="medium" mode="horizontal">
				<Blankslate body="" icon={errorIcon} title={errorMessage}>
					{children}
					{actionButtons.includes('home') && (
						<Button
							onClick={() => redirectToClientPage(APP_PATH.LOGGED_IN_HOME, history)}
							label={t('error/views/error-view___ga-terug-naar-de-homepagina')}
						/>
					)}
				</Blankslate>
			</Container>
		</Container>
	);
};

export default withRouter(ErrorView);
