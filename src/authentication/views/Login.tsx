import { get } from 'lodash-es';
import React, { FunctionComponent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';

import { Button, Flex, Spacer, Spinner } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';

import { LoginMessage } from '../authentication.types';
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

const Login: FunctionComponent<LoginProps> = ({
	history,
	location,
	loginState,
	loginStateLoading,
	loginStateError,
	getLoginState,
}) => {
	const [t] = useTranslation();

	useEffect(() => {
		if (!loginState && !loginStateLoading && !loginStateError) {
			getLoginState();
			return;
		}

		// Redirect to previous requested path or home page
		if (loginState && loginState.message === LoginMessage.LOGGED_IN && !loginStateLoading) {
			history.push(get(location, 'state.from.pathname', APP_PATH.LOGGED_IN_HOME));
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
		localStorage.removeItem(LOGIN_ATTEMPT_KEY);
		getLoginState();
	};

	if (loginStateError) {
		return (
			<ErrorView message="Het inloggen is mislukt" icon="lock">
				<Button
					type="link"
					onClick={tryLoginAgainManually}
					label={t('authentication/views/login___probeer-opnieuw')}
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

const mapStateToProps = (state: any) => ({
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
