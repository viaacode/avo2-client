import React, { FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router';

import { Container, Heading } from '@viaa/avo2-components';
import { Trans } from 'react-i18next';

export interface StudentTeacherProps extends RouteComponentProps {}

const StudentTeacher: FunctionComponent<StudentTeacherProps> = () => {
	return (
		<Container className="c-register-stamboek-view" mode="vertical">
			<Container mode="horizontal" size="large">
				<div className="c-content">
					<Heading type="h2">
						<Trans key="authentication/views/registration-flow/r-10-student-teacher___het-archief-voor-onderwijs-voor-student-leerkrachten">
							Het Archief voor Onderwijs voor Student-leerkrachten
						</Trans>
					</Heading>
					<p>
						<Trans key="authentication/views/registration-flow/r-10-student-teacher___jij-zoekt-meer-en-dat-vinden-wij-top">
							Jij zoekt meer en dat vinden wij top!
						</Trans>
						<br />
						<br />
						Studenten lerarenopleiding{' '}
						<b>
							<Trans key="authentication/views/registration-flow/r-10-student-teacher___kunnen-via-hun-docent-toegang-krijgen">
								kunnen via hun docent toegang krijgen
							</Trans>
						</b>{' '}
						tot onze beeldbank. De docenten moeten hiervoor een aanvraag sturen naar{' '}
						<a href="mailto:support@viaa.be">support@viaa.be</a> met inbegrip van een lijst (excel
						of csv) met de voornaam, achternaam en het e-mailadres van de student aan de betreffende
						onderwijsinstelling (geen privé-adressen).
						<br />
						<br />
						<Trans key="authentication/views/registration-flow/r-10-student-teacher___in-die-mail-moet-ook-formeel-bevestigd-worden-dat-de-lijst-enkel-gegevens-bevat-van-studenten-in-een-vlaamse-lerarenopleiding-ingeschreven-bij-de-boven-vernoemde-onderwijsinstelling-hou-rekening-met-een-verwerkingstijd-van-gemiddeld-een-werkweek">
							In die mail moet ook formeel bevestigd worden dat de lijst enkel gegevens bevat van
							studenten in een Vlaamse lerarenopleiding ingeschreven bij de boven vernoemde
							onderwijsinstelling. Hou rekening met een verwerkingstijd van gemiddeld een werkweek.
						</Trans>
					</p>
				</div>
			</Container>
		</Container>
	);
};

export default StudentTeacher;
