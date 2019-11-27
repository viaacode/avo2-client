import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { Button, Column, Container, Grid, Spacer } from '@viaa/avo2-components';
import {
	redirectToClientLogin,
	redirectToClientStamboek,
	redirectToServerSmartschoolLogin,
} from '../../helpers/redirects';

import './r1-pupil-or-teacher.scss';

export interface RegisterPupilOrTeacherProps extends RouteComponentProps {}

const RegisterPupilOrTeacher: FunctionComponent<RegisterPupilOrTeacherProps> = ({
	history,
	location,
}) => {
	return (
		<Container className="c-pupil-or-teacher-view" mode="vertical">
			<Container mode="horizontal" size="small">
				<h3 className="c-h2">Bent u een leerling of een lesgever?</h3>
				<Grid>
					<Column size="2-6">
						<h4 className="c-h2">Leerling</h4>
						<Spacer margin={'bottom-small'}>
							<Button
								label="Inloggen met e-mailadres"
								type="primary"
								onClick={() => redirectToClientLogin(history, location)}
							/>
						</Spacer>
						<Button
							block
							className="c-button-smartschool"
							icon="smartschool"
							label="Inloggen met Smartschool"
							onClick={() => redirectToServerSmartschoolLogin(location)}
						/>
					</Column>
					<Column size="2-6">
						<h4 className="c-h2">Lesgever</h4>
						<Button
							label="Maak een account aan"
							onClick={() => redirectToClientStamboek(history)}
						/>
					</Column>
				</Grid>
			</Container>
		</Container>
	);
};

export default withRouter(RegisterPupilOrTeacher);
