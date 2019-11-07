import { History, Location } from 'history';
import queryString from 'querystring';
import React, { FunctionComponent, ReactNode } from 'react';
import { match, withRouter } from 'react-router';
import { RouteConfigComponentProps } from 'react-router-config';

import { Blankslate, Container } from '@viaa/avo2-components';

import { IconName } from '../../shared/types/types';

interface ErrorViewQueryParams {
	message?: string;
	icon?: IconName;
}

interface ErrorViewProps extends RouteConfigComponentProps {
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
	const errorMessage: string = queryParams.message || message || 'De pagina werd niet gevonden';
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
