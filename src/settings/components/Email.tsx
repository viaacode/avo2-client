import React, { FunctionComponent } from 'react';

import {
	BlockHeading,
	Button,
	Checkbox,
	CheckboxGroup,
	Container,
	Form,
	FormGroup,
	Spacer,
} from '@viaa/avo2-components';

export interface EmailProps {}

const Email: FunctionComponent<EmailProps> = () => {
	return (
		<Container mode="vertical">
			<Container mode="horizontal">
				<BlockHeading type="h3">E-mail nieuwsbrief voorkeuren</BlockHeading>
				<p>
					Tips en inspiratie voor je lessen, uitnodigingen voor workshops, vacatures,
					nieuws van de partners waarmee we werken aan beeld en geluid op maat van jouw
					klas, en dit recht in je mailbox: klinkt goed? Schrijf je hieronder in voor onze
					nieuwsbrief en andere communicatie. Je kan je voorkeuren altijd aanpassen.
				</p>
				<Spacer margin="top">
					<Form>
						<FormGroup labelFor="newsletter" required>
							<CheckboxGroup>
								<Checkbox label="Ik ontvang graag tips en inspiratie voor mijn lessen en nieuws van partners." />
								<Checkbox label="Ik wil berichten over workshops en events ontvangen." />
								<Checkbox label="Ik krijg graag berichten om actief mee te werken aan Het Archief voor Onderwijs." />
							</CheckboxGroup>
						</FormGroup>
					</Form>
				</Spacer>
				<Spacer margin="top">
					<Button label="Opslaan" type="primary" />
				</Spacer>
			</Container>
		</Container>
	);
};

export default Email;
