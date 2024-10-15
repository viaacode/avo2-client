import { noop } from 'lodash-es';
import React, { type FC } from 'react';
import { type RouteComponentProps, withRouter } from 'react-router';

import LoginOptions from './LoginOptions';
import './LoginOptionsDropdown.scss';

export interface LoginOptionsDropdownProps {
	closeDropdown?: () => void;
}

const LoginOptionsDropdown: FC<LoginOptionsDropdownProps & RouteComponentProps> = ({
	history,
	location,
	match,
	closeDropdown = noop,
}) => {
	return (
		<div className="m-login-options-dropdown">
			<LoginOptions
				history={history}
				location={location}
				match={match}
				onOptionClicked={closeDropdown}
			/>
		</div>
	);
};

export default withRouter(LoginOptionsDropdown);
