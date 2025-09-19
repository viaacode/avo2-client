import { Flex, IconName, Spacer, Spinner } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type ComponentType, type FC, useEffect } from 'react';
import { Navigate, Route, useNavigate } from 'react-router';
import { type Dispatch } from 'redux';

import { AssignmentDetailSwitcher } from '../../assignment/views/AssignmentDetailSwitcher';
import { APP_PATH } from '../../constants';
import { QuickLaneDetail } from '../../quick-lane/views/QuickLaneDetail';
import { buildLink } from '../../shared/helpers/build-link';
import { useTranslation } from '../../shared/hooks/useTranslation';
import { LoginMessage } from '../authentication.types';
import { isProfileComplete } from '../helpers/get-profile-info';
import { LoginOptionsTabs, setPreferredLoginOption } from '../helpers/login-options-preferred-tab';
import { redirectToClientPage } from '../helpers/redirects/redirect-to-client-page';

// eslint-disable-next-line @typescript-eslint/ban-types
export interface DefaultSecureRouteProps {
	commonUser: Avo.User.CommonUser | null;
	// technically this type is incorrect, it should be Avo.User.User | undefined
	// But practically it's always Avo.User.User where we need a user and this avoids a shit ton of IF checks
	/**
	 * @deprecated Prefer to use commonUser instead
	 */
	user: Avo.User.User | null;
}

export interface SecuredRouteProps {
	Component: ComponentType<any>;
	exact?: boolean;
	path?: string;
}

export const SecuredRoute: FC<
	SecuredRouteProps & {
		getLoginState: () => Dispatch;
		loginState: Avo.Auth.LoginResponse | null;
		loginStateError: boolean;
		loginStateLoading: boolean;
	}
> = ({ Component, getLoginState, loginState, loginStateError, loginStateLoading, path }) => {
	const { tText } = useTranslation();
	const navigateFunc = useNavigate();

	useEffect(() => {
		if (!loginState && !loginStateLoading && !loginStateError) {
			getLoginState();
		}
	}, [getLoginState, loginState, loginStateLoading, loginStateError]);

	if ((!loginState || loginStateLoading) && !loginStateError) {
		// Wait for login check
		return (
			<Spacer margin={['top-large', 'bottom-large']}>
				<Flex center>
					<Spinner size="large" />
				</Flex>
			</Spacer>
		);
	}

	if (loginStateError) {
		redirectToClientPage(
			buildLink(
				APP_PATH.ERROR.route,
				{},
				{
					message: tText(
						'authentication/components/secured-route___het-inloggen-is-mislukt-controleer-je-internet-verbinding-of-probeer-later-opnieuw'
					),
					icon: IconName.alertTriangle,
					actionButtons: 'home, helpdesk',
				}
			),
			navigateFunc
		);
		return null;
	}

	const SecureRouteBody = () => {
		// Already logged in
		if (
			loginState &&
			loginState.message === LoginMessage.LOGGED_IN &&
			loginState.commonUserInfo
		) {
			if (!loginState.acceptedConditions) {
				// Redirect to the accept user and privacy declaration
				return <Navigate to={APP_PATH.ACCEPT_CONDITIONS.route} />;
			}
			if (!isProfileComplete(loginState.commonUserInfo)) {
				// Redirect to the complete profile route
				// So we can redirect to the originally requested route once the user completes their profile info
				return <Navigate to={APP_PATH.COMPLETE_PROFILE.route} />;
			}
			return <Component user={loginState.userInfo} commonUser={loginState.commonUserInfo} />;
		}

		if (Component === QuickLaneDetail || Component === AssignmentDetailSwitcher) {
			setPreferredLoginOption(LoginOptionsTabs.STUDENT);
		}

		if (Component === QuickLaneDetail || Component === AssignmentDetailSwitcher) {
			setPreferredLoginOption(LoginOptionsTabs.STUDENT);
		}

		// On errors or not logged in => redirect to login or register page
		return <Navigate to={APP_PATH.REGISTER_OR_LOGIN.route} />;
	};

	return <Route {...(path ? { path } : {})} element={<SecureRouteBody />} />;
};
