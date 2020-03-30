import React, { FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router';

import { Container, Flex, FlexItem } from '@viaa/avo2-components';

import { getFromPath } from '../helpers/redirects';

import LoginOptions from './LoginOptions';
import './LoginOptionsDropdown.scss';

export interface LoginOptionsDropdownProps extends RouteComponentProps {
	closeDropdown?: () => void;
}

const LoginOptionsDropdown: FunctionComponent<LoginOptionsDropdownProps> = ({
	history,
	location,
	match,
	closeDropdown = () => {},
}) => {
	return (
		<Container className="m-login-options-dropdown" mode="horizontal">
			<Container mode="vertical">
				<Flex center>
					<FlexItem>
						<LoginOptions
							history={history}
							location={location}
							match={match}
							onOptionClicked={closeDropdown}
							redirectAfterLogin={getFromPath(location)}
						/>
					</FlexItem>
				</Flex>
			</Container>
		</Container>
	);
};

export default LoginOptionsDropdown;
