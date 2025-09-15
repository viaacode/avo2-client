import { Button, Flex, IconName, Spacer, Spinner } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC, useEffect } from 'react';
import { connect } from 'react-redux';
import { type RouteComponentProps } from 'react-router';
import { type Dispatch } from 'redux';

import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import { isPupil } from '../../shared/helpers/is-pupil';
import useTranslation from '../../shared/hooks/useTranslation';
import { type AppState } from '../../store';
import { LoginMessage } from '../authentication.types';
import { redirectToServerLoginPage } from '../helpers/redirects';
import { getLoginStateAction } from '../store/actions';
import { selectLogin, selectLoginError, selectLoginLoading } from '../store/selectors';

interface LoginProps extends RouteComponentProps {
	loginState: Avo.Auth.LoginResponse | null;
	loginStateLoading: boolean;
	loginStateError: boolean;
	getLoginState: () => Dispatch;
}

const LOGIN_ATTEMPT_KEY = 'AVO_LOGIN_ATTEMPT';

const Login: FC<LoginProps> = ({
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
				if (isPupil(loginState?.commonUserInfo?.userGroup?.id)) {
					path = APP_PATH.WORKSPACE_ASSIGNMENTS.route;
				} else {
					path = APP_PATH.LOGGED_IN_HOME.route;
				}
			}

			navigate(path);

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

export default connect(mapStateToProps, mapDispatchToProps)(Login);
