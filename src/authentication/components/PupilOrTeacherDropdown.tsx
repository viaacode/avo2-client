import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { Button, Container, Spacer } from '@viaa/avo2-components';

import { PUPILS_PATH } from '../../pupils/pupils.const';
import { TEACHERS_PATH } from '../../teachers/teachers.const';
import { redirectToClientPage } from '../helpers/redirects';

export interface PupilOrTeacherDropdownProps extends RouteComponentProps {}

const PupilOrTeacherDropdown: FunctionComponent<PupilOrTeacherDropdownProps> = ({ history }) => {
	return (
		<Container className="c-register-pupil-or-teacher-dropdown" mode="horizontal">
			<Container mode="vertical">
				<h4 className="c-h4">Ben je lesgever?</h4>
				<p>Krijg toegang tot audiovisueel lesmateriaal, maak eigen collecties.</p>
				<Spacer margin={['bottom-large', 'top-small']}>
					<Button
						block
						type="primary"
						label="Maak je gratis account aan"
						onClick={() => redirectToClientPage(TEACHERS_PATH.FOR_TEACHERS, history)}
					/>
				</Spacer>
				<Spacer margin="top-large">
					<h4 className="c-h4">Ben je leerling secundair?</h4>
					<p>Krijg toegang tot opdrachten klaargezet door jouw leerkrachten.</p>
					<Spacer margin="top-small">
						<Button
							block
							type="primary"
							label="Toegang voor leerlingen"
							onClick={() => redirectToClientPage(PUPILS_PATH.FOR_PUPILS, history)}
						/>
					</Spacer>
				</Spacer>
			</Container>
		</Container>
	);
};

export default withRouter(PupilOrTeacherDropdown);
