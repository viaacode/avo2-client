import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import LoginOptions from './LoginOptions';
import './LoginOptionsDropdown.scss';

export interface LoginOptionsDropdownProps {
	closeDropdown?: () => void;
}

const LoginOptionsDropdown: FunctionComponent<LoginOptionsDropdownProps & RouteComponentProps> = ({
	history,
	location,
	match,
	closeDropdown = () => {},
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
