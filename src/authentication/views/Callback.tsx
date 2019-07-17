import React, { Fragment, FunctionComponent } from 'react';

import { get } from 'lodash-es';
import queryString from 'query-string';
import { RouteComponentProps } from 'react-router';

export interface CallbackProps {}

export const Callback: FunctionComponent<CallbackProps & RouteComponentProps> = (
	props: CallbackProps & RouteComponentProps
) => {
	console.log(props);
	// TODO contact server with saml response
	return <Fragment />;
};

export default Callback;
