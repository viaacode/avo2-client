import React, { FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';

import { get } from 'lodash-es';

import { RouteParts } from '../../routes';
import { redirectToLoginPage } from '../helpers/redirect-to-idp';
import { CheckLoginStateResponse } from '../store/types';

export interface LoginProps {
	loginState: CheckLoginStateResponse | null;
	checkLoginState: () => Dispatch;
}

export const Login: FunctionComponent<LoginProps & RouteComponentProps> = (
	props: LoginProps & RouteComponentProps
) => {
	const base = window.location.href.split(`/${RouteParts.Login}`)[0];
	// Url to return to after authentication is completed and server stored auth object in session
	const returnToUrl = base + get(props.location, 'state.from.pathname', '/');
	redirectToLoginPage(returnToUrl);
	return null;
};
