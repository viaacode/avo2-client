import { History, Location } from 'history';
import queryString from 'querystring';
import React, { FunctionComponent, ReactNode } from 'react';
import { match, RouteComponentProps, withRouter } from 'react-router';

import { Blankslate, Container, IconName } from '@viaa/avo2-components';

import i18n from '../../shared/translations/i18n';

interface ErrorViewQueryParams {
	message?: string;
	icon?: IconName;
}

interface ErrorViewProps extends RouteComponentProps {
	message?: string;
	icon?: IconName;
	children?: ReactNode;
	history: History;
	match: match<ErrorViewQueryParams>;
	location: Location;
}

const ErrorView: FunctionComponent<ErrorViewProps> = ({
	message,
	icon,
	children = null,
	location,
}) => {
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
				</Blankslate>
			</Container>
		</Container>
	);
};

export default withRouter(ErrorView);
