import { History, Location } from 'history';
import { get } from 'lodash-es';
import queryString from 'query-string';
import React, { FunctionComponent } from 'react';
import { withRouter } from 'react-router';

import { Button, Column, Container, Grid, Spacer } from '@viaa/avo2-components';

import { SEARCH_PATH } from '../../../search/search.const';
import { getEnv } from '../../../shared/helpers';
import { AUTH_PATH } from '../../authentication.const';

import './r1-pupil-or-teacher.scss';

export interface RegisterPupilOrTeacherProps {
	history: History;
	location: Location;
}

const RegisterPupilOrTeacher: FunctionComponent<RegisterPupilOrTeacherProps> = ({
	history,
	location,
}) => {
	const redirectToLogin = () => {
		history.push(AUTH_PATH.LOGIN_AVO, {
			from: { pathname: get(location, 'state.from.pathname', SEARCH_PATH.SEARCH) },
		});
	};

	const redirectToSmartschoolLogin = () => {
		// Redirect to smartschool login form
		const base = window.location.href.split(AUTH_PATH.REGISTER_OR_LOGIN)[0];
		// Url to return to after authentication is completed and server stored auth object in session
		const returnToUrl = base + get(location, 'state.from.pathname', SEARCH_PATH.SEARCH);
		window.location.href = `${getEnv('PROXY_URL')}/auth/smartschool/login?${queryString.stringify({
			returnToUrl,
		})}`;
	};

	const redirectToStamboek = () => {
		history.push(AUTH_PATH.STAMBOEK);
	};

	return (
		<Container className="c-pupil-or-teacher-view" mode="vertical">
			<Container mode="horizontal" size="small">
				<h3 className="c-h2">Bent u een leerling of een lesgever?</h3>
				<Grid>
					<Column size="2-6">
						<h4 className="c-h2">Leerling</h4>
						<Spacer margin={'bottom-small'}>
							<Button label="Inloggen met e-mailadres" type="primary" onClick={redirectToLogin} />
						</Spacer>
						<Button
							block
							className="c-button-smartschool"
							icon="smartschool"
							label="Inloggen met Smartschool"
							onClick={redirectToSmartschoolLogin}
						/>
					</Column>
					<Column size="2-6">
						<h4 className="c-h2">Lesgever</h4>
						<Button label="Maak een account aan" onClick={redirectToStamboek} />
					</Column>
				</Grid>
			</Container>
		</Container>
	);
};

export default withRouter(RegisterPupilOrTeacher);
