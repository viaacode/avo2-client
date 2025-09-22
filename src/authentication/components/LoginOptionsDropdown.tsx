import { noop } from 'lodash-es';
import React, { type FC } from 'react';

import { LoginOptions } from './LoginOptions';
import './LoginOptionsDropdown.scss';

interface LoginOptionsDropdownProps {
	closeDropdown?: () => void;
}

export const LoginOptionsDropdown: FC<LoginOptionsDropdownProps> = ({ closeDropdown = noop }) => {
	return (
		<div className="m-login-options-dropdown">
			<LoginOptions onOptionClicked={closeDropdown} />
		</div>
	);
};
