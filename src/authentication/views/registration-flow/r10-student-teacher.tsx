import React, { FunctionComponent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';

import { BlockHeading, Button, Container } from '@viaa/avo2-components';

import { APP_PATH } from '../../../constants';
import { redirectToClientPage } from '../../helpers/redirects';

export interface StudentTeacherProps extends RouteComponentProps {}

const StudentTeacher: FunctionComponent<StudentTeacherProps> = ({ history }) => {
	const [t] = useTranslation();

	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="large">
				<div className="c-content">
					<Button
						type="secondary"
						onClick={() =>
							redirectToClientPage(APP_PATH.MANUAL_ACCESS_REQUEST.route, history)
						}
						title={t(
							'authentication/views/registration-flow/r-10-student-teacher___terug'
						)}
						ariaLabel={t(
							'authentication/views/registration-flow/r-10-student-teacher___terug'
						)}
					/>
					<BlockHeading type="h2">
						<Trans i18nKey="authentication/views/registration-flow/r-10-student-teacher___het-archief-voor-onderwijs-voor-student-leerkrachten">
							Het Archief voor Onderwijs voor Student-leerkrachten
						</Trans>
					</BlockHeading>
					<p>
						<Trans i18nKey="authentication/views/registration-flow/r-10-student-teacher___student-teacher-description">
							Jij zoekt meer en dat vinden wij top! Studenten lerarenopleiding{' '}
							<strong>kunnen via hun docent toegang krijgen</strong> tot onze
							beeldbank. De docenten moeten hiervoor een aanvraag sturen naar{' '}
							<a href="mailto:support@meemoo.be">support@meemoo.be</a> met inbegrip
							van een lijst (excel of csv) met de voornaam, achternaam en het
							e-mailadres van de student aan de betreffende onderwijsinstelling (geen
							privé-adressen). In die mail moet ook formeel bevestigd worden dat de
							lijst enkel gegevens bevat van studenten in een Vlaamse lerarenopleiding
							ingeschreven bij de boven vernoemde onderwijsinstelling. Hou rekening
							met een verwerkingstijd van gemiddeld een werkweek.
						</Trans>
					</p>
				</div>
			</Container>
		</Container>
	);
};

export default StudentTeacher;
