import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { Button, ButtonToolbar, Container } from '@viaa/avo2-components';

import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { APP_PATH } from '../../constants';

import './ForTeachers.scss';

export interface ForTeachersProps extends RouteComponentProps {}

const ForTeachers: FunctionComponent<ForTeachersProps> = ({ history }) => {
	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="small">
				<ButtonToolbar>
					<Button
						label="Login"
						type="primary"
						onClick={() => redirectToClientPage(APP_PATH.REGISTER_OR_LOGIN, history)}
					/>
					<Button
						label="Maak je gratis account aan"
						type="secondary"
						onClick={() => redirectToClientPage(APP_PATH.STAMBOEK, history)}
					/>
				</ButtonToolbar>
			</Container>
		</Container>
	);
};

export default withRouter(ForTeachers);
