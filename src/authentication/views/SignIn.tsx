import React, { Fragment, FunctionComponent } from 'react';

import { get } from 'lodash-es';
import queryString from 'query-string';
import { RouteComponentProps } from 'react-router';

export interface SignInProps {}

export const SignIn: FunctionComponent<SignInProps & RouteComponentProps> = (
	props: SignInProps & RouteComponentProps
) => {
	const base = window.location.href.split('/aanmelden')[0];

	// Url to call with authentication response
	const callbackUrl = `${base}/callback`;
	// Url to return to after authentication is completed and server stored auth object in session
	const returnToUrl = base + get(props, 'location.state.from.pathname', '/');

	const url = `${process.env.REACT_APP_PROXY_URL}/auth/login?${queryString.stringify({
		callbackUrl,
		returnToUrl,
	})}`;
	window.location.href = url;
	return <Fragment />;
};

export default SignIn;
