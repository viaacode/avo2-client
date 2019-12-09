import React, { FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router';

import { Button, ButtonToolbar, Container } from '@viaa/avo2-components';

import { redirectToServerSmartschoolLogin } from '../../authentication/helpers/redirects';

interface ForPupilsProps extends RouteComponentProps {}

const ForPupils: FunctionComponent<ForPupilsProps> = ({ location }) => {
	return (
		<Container className="c-for-pupils-view" mode="vertical">
			<Container mode="horizontal" size="small">
				<ButtonToolbar>
					<Button
						className="c-button-smartschool"
						icon="smartschool"
						label="Inloggen met Smartschool"
						onClick={() => redirectToServerSmartschoolLogin(location)}
					/>
				</ButtonToolbar>
			</Container>
		</Container>
	);
};

export default ForPupils;
