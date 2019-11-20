import { History, Location } from 'history';
import { get } from 'lodash-es';
import queryString from 'query-string';
import React, { FunctionComponent, useReducer } from 'react';
import { withRouter } from 'react-router';

import { Button, Column, Container, Grid, Spacer } from '@viaa/avo2-components';

import { RouteParts } from '../../../constants';
import { getEnv } from '../../../shared/helpers';
import { INITIAL_USER_STATE } from '../../authentication.const';
import { Action, UserState } from '../../authentication.types';

import './r1-pupil-or-teacher.scss';

export interface RegisterPupilOrTeacherProps {
	history: History;
	location: Location;
}

const userReducer = (state: UserState, { type, payload }: Action) => ({
	...state,
	[type]: payload,
});

const RegisterPupilOrTeacher: FunctionComponent<RegisterPupilOrTeacherProps> = ({
	history,
	location,
}) => {
	const [userState, userDispatch] = useReducer(userReducer, INITIAL_USER_STATE);

	const setUserState = (field: string, value: string | boolean) =>
		userDispatch({
			type: field,
			payload: value,
		});

	const redirectToLogin = () => {
		history.push(`/${RouteParts.LoginAvo}`, {
			from: { pathname: get(location, 'state.from.pathname', `/${RouteParts.Search}`) },
		});
	};

	const redirectToSmartschoolLogin = () => {
		// Redirect to smartschool login form
		const base = window.location.href.split(`/${RouteParts.RegisterOrLogin}`)[0];
		// Url to return to after authentication is completed and server stored auth object in session
		const returnToUrl = base + get(location, 'state.from.pathname', `/${RouteParts.Search}`);
		window.location.href = `${getEnv('PROXY_URL')}/auth/smartschool/login?${queryString.stringify({
			returnToUrl,
		})}`;
	};

	const redirectToStamboek = () => {
		history.push(`/${RouteParts.Stamboek}`);
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
						/>{' '}
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
