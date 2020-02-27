import { History, Location } from 'history';
import { uniq } from 'lodash-es';
import queryString from 'querystring';
import React, { FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { match, RouteComponentProps, withRouter } from 'react-router';

import {
	Blankslate,
	Button,
	ButtonToolbar,
	Container,
	IconName,
	Toolbar,
	ToolbarCenter,
} from '@viaa/avo2-components';

import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { APP_PATH } from '../../constants';
import { CustomError } from '../../shared/helpers';
import i18n from '../../shared/translations/i18n';

export type ErrorActionButton = 'home' | 'helpdesk'; // TODO use type in typings repo

interface ErrorViewQueryParams {
	message?: string;
	icon?: IconName;
	actionButtons?: string;
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
	const buttons = uniq([
		...actionButtons,
		...(queryParams.actionButtons
			? queryParams.actionButtons.split(',').map(button => button.trim())
			: []),
	]);

	if (!(queryParams.message || message)) {
		console.error(
			new CustomError('Error view without error message', null, {
				queryParams,
				message,
				icon,
				actionButtons,
			})
		);
	}

	return (
		<Container mode="vertical" background="alt">
			<Container size="medium" mode="horizontal">
				<Blankslate body="" icon={errorIcon} title={errorMessage}>
					{children}
					<Toolbar>
						<ToolbarCenter>
							<ButtonToolbar>
								{buttons.includes('home') && (
									<Button
										onClick={() =>
											redirectToClientPage(
												APP_PATH.LOGGED_IN_HOME.route,
												history
											)
										}
										label={t(
											'error/views/error-view___ga-terug-naar-de-homepagina'
										)}
									/>
								)}
								{buttons.includes('helpdesk') && (
									<Button
										type="danger"
										onClick={() => window.zE('webWidget', 'toggle')}
										label={t('error/views/error-view___contacteer-de-helpdesk')}
									/>
								)}
							</ButtonToolbar>
						</ToolbarCenter>
					</Toolbar>
				</Blankslate>
			</Container>
		</Container>
	);
};

export default withRouter(ErrorView);
