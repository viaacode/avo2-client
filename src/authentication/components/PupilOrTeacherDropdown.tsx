import React, { FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router';

import { Button, Container, Spacer } from '@viaa/avo2-components';

import { APP_PATH } from '../../constants';
import { redirectToClientPage } from '../helpers/redirects';
import { Trans } from 'react-i18next';

export interface PupilOrTeacherDropdownProps extends RouteComponentProps {
	closeDropdown?: () => void;
}

const PupilOrTeacherDropdown: FunctionComponent<PupilOrTeacherDropdownProps> = ({
	history,
	closeDropdown = () => {},
}) => {
	return (
		<Container className="c-register-pupil-or-teacher-dropdown" mode="horizontal">
			<Container mode="vertical">
				<h4 className="c-h4">
					<Trans>Ben je lesgever?</Trans>
				</h4>
				<p>
					<Trans>Krijg toegang tot audiovisueel lesmateriaal, maak eigen collecties.</Trans>
				</p>
				<Spacer margin={['bottom-large', 'top-small']}>
					<Button
						block
						type="primary"
						label="Maak je gratis account aan"
						onClick={() => {
							closeDropdown();
							redirectToClientPage(APP_PATH.FOR_TEACHERS, history);
						}}
					/>
				</Spacer>
				<Spacer margin="top-large">
					<h4 className="c-h4">
						<Trans>Ben je leerling secundair?</Trans>
					</h4>
					<p>
						<Trans>Krijg toegang tot opdrachten klaargezet door jouw leerkrachten.</Trans>
					</p>
					<Spacer margin="top-small">
						<Button
							block
							type="primary"
							label="Toegang voor leerlingen"
							onClick={() => {
								closeDropdown();
								redirectToClientPage(APP_PATH.FOR_PUPILS, history);
							}}
						/>
					</Spacer>
				</Spacer>
			</Container>
		</Container>
	);
};

export default PupilOrTeacherDropdown;
