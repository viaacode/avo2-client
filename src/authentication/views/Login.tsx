import { Button, Flex, IconName, Spacer, Spinner } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC, useEffect } from 'react';
import { connect } from 'react-redux';
import { type RouteComponentProps, withRouter } from 'react-router';
import { type Dispatch } from 'redux';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import useTranslation from '../../shared/hooks/useTranslation';
import { type AppState } from '../../store';
import { LoginMessage } from '../authentication.types';
import { getUserGroupId } from '../helpers/get-profile-info';
import { redirectToServerLoginPage } from '../helpers/redirects';
import { getLoginStateAction } from '../store/actions';
import { selectLogin, selectLoginError, selectLoginLoading } from '../store/selectors';

export interface LoginProps extends RouteComponentProps {
	loginState: Avo.Auth.LoginResponse | null;
	loginStateLoading: boolean;
	loginStateError: boolean;
	getLoginState: () => Dispatch;
}

const LOGIN_ATTEMPT_KEY = 'AVO_LOGIN_ATTEMPT';

const Login: FC<LoginProps> = ({
	history,
	location,
	loginState,
	loginStateLoading,
	loginStateError,
	getLoginState,
}) => {
	const { tText } = useTranslation();

	useEffect(() => {
		if (!loginState && !loginStateLoading && !loginStateError) {
			getLoginState();
			return;
		}

		// Redirect to previous requested path or the default page for that user group (LOGGED_IN_HOME or WORKSPACE_ASSIGNMENTS)
		if (loginState && loginState.message === LoginMessage.LOGGED_IN && !loginStateLoading) {
			let path: string | undefined = (location?.state as any)?.from?.pathname;

			if (!path) {
				if (
					[SpecialUserGroup.PupilSecondary, SpecialUserGroup.PupilElementary]
						.map(String)
						.includes(getUserGroupId(loginState?.userInfo?.profile))
				) {
					path = APP_PATH.WORKSPACE_ASSIGNMENTS.route;
				} else {
					path = APP_PATH.LOGGED_IN_HOME.route;
				}
			}

			history.push(path);

			return;
		}

		if (
			loginState &&
			loginState.message === LoginMessage.LOGGED_OUT &&
			!loginStateLoading &&
			!loginStateError
		) {
			redirectToServerLoginPage(location);
		}
	}, [getLoginState, loginState, loginStateLoading, loginStateError, history, location]);

	const tryLoginAgainManually = () => {
		if (localStorage) {
			localStorage.removeItem(LOGIN_ATTEMPT_KEY);
		}
		getLoginState();
	};

	if (loginStateError) {
		return (
			<ErrorView
				message={tText('authentication/views/login___het-inloggen-is-mislukt')}
				icon={IconName.lock}
			>
				<Button
					type="link"
					onClick={tryLoginAgainManually}
					label={tText('authentication/views/login___probeer-opnieuw')}
				/>
			</ErrorView>
		);
	}

	if (!loginState || loginStateLoading) {
		// Wait for login check
		return (
			<Spacer margin={['top-large', 'bottom-large']}>
				<Flex center>
					<Spinner size="large" />
				</Flex>
			</Spacer>
		);
	}

	return null;
};

const mapStateToProps = (state: AppState) => ({
	loginState: selectLogin(state),
	loginStateLoading: selectLoginLoading(state),
	loginStateError: selectLoginError(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		getLoginState: () => dispatch(getLoginStateAction() as any),
	};
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));
