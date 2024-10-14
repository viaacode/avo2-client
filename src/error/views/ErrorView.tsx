import {
	Blankslate,
	Button,
	ButtonToolbar,
	Container,
	Flex,
	IconName,
	Spacer,
	Spinner,
	Toolbar,
	ToolbarCenter,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { compact, isArray, isNil, isString, omit, uniq } from 'lodash-es';
import queryString from 'query-string';
import React, { type FC, type ReactNode } from 'react';
import { type RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'redux';

import {
	redirectToLoggedInHome,
	redirectToLoggedOutHome,
	redirectToServerLogoutPage,
} from '../../authentication/helpers/redirects';
import { CustomError, isMobileWidth } from '../../shared/helpers';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { getPageNotFoundError } from '../../shared/translations/page-not-found';

import './ErrorView.scss';

export interface ErrorViewQueryParams {
	message?: string | ReactNode;
	icon?: IconName;
	actionButtons?: Avo.Auth.ErrorActionButton[];
}

interface ErrorViewProps {
	message?: string | ReactNode;
	icon?: IconName;
	actionButtons?: Avo.Auth.ErrorActionButton[];
	children?: ReactNode;
}

const ErrorView: FC<ErrorViewProps & RouteComponentProps & UserProps> = ({
	message,
	icon,
	children = null,
	location,
	actionButtons = [],
	user,
}) => {
	const { tText } = useTranslation();

	const queryParams = queryString.parse((location.search || '').substring(1));

	if (queryParams.logout === 'true') {
		// redirect to logout route and afterwards redirect back to the error page
		redirectToServerLogoutPage(
			location,
			`/error?${queryString.stringify(omit(queryParams, 'logout'))}`
		);
		return (
			<Spacer margin={['top-large', 'bottom-large']}>
				<Flex center>
					<Spinner size="large" />
				</Flex>
			</Spacer>
		);
	}

	const messageText: string | ReactNode = (queryParams.message as string) || message || '';
	const errorMessage: string | ReactNode = isNil(messageText)
		? getPageNotFoundError(!!user)
		: messageText;
	const errorIcon: IconName =
		(queryParams.icon as IconName | undefined) || icon || IconName.search;
	const buttons = uniq([
		...actionButtons,
		...(isArray(queryParams.actionButtons) ? queryParams.actionButtons : []),
		...(isString(queryParams.actionButtons)
			? queryParams.actionButtons
					.split(',')
					.map((button) => button.trim())
					.filter((button) => !!button)
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

	const goToHome = () => {
		if (user) {
			redirectToLoggedInHome(location);
		} else {
			redirectToLoggedOutHome(location);
		}
	};

	const renderButtons = (btns: string[]) => {
		const buttons = (
			<>
				{btns.includes('home') && (
					<Button
						onClick={goToHome}
						label={tText('error/views/error-view___ga-terug-naar-de-homepagina')}
					/>
				)}
				{btns.includes('helpdesk') && (
					<Button
						type="danger"
						onClick={() => window.zE('webWidget', 'toggle')}
						label={tText('error/views/error-view___contacteer-de-helpdesk')}
					/>
				)}
			</>
		);

		if (isMobileWidth()) {
			return <div className="c-error-buttons__mobile">{buttons}</div>;
		}
		return (
			<Toolbar>
				<ToolbarCenter>
					<ButtonToolbar>{buttons}</ButtonToolbar>
				</ToolbarCenter>
			</Toolbar>
		);
	};

	return (
		<Container mode="vertical" background="alt" className="m-error-view">
			<Container size="medium" mode="horizontal">
				<Blankslate body="" icon={errorIcon} title={errorMessage} className="c-content">
					{children}
					{renderButtons(compact(buttons))}
				</Blankslate>
			</Container>
		</Container>
	);
};

export default compose(withRouter, withUser)(ErrorView) as FC<ErrorViewProps>;
