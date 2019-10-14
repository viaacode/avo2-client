import React, { FunctionComponent } from 'react';

import {
	Button,
	ButtonToolbar,
	Checkbox,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	RadioButton,
	RadioButtonGroup,
	Select,
	Spacer,
	TextInput,
} from '@viaa/avo2-components';

import './Register.scss';

const mockSelectRoles = [
	{ label: 'Kies een type', value: '', disabled: true },
	{ label: 'Leerkracht', value: 'leerkracht' },
	{ label: 'Student', value: 'student' },
	{ label: 'Andere', value: 'andere' },
];

export interface RegisterProps {}

const Register: FunctionComponent<RegisterProps> = () => {
	return (
		<Container mode="vertical">
			<Container mode="horizontal" size="small">
				<h3 className="c-h2">Registreren</h3>
				<hr className="c-hr" />
				<Form>
					<Spacer margin="bottom-large">
						<Grid>
							<Column size="2-6">
								<FormGroup labelFor="firstNameId" label="Voornaam">
									<TextInput id="firstNameId" />
								</FormGroup>
							</Column>
							<Column size="2-6">
								<FormGroup labelFor="lastNameId" label="Achternaam">
									<TextInput id="lastNameId" />
								</FormGroup>
							</Column>
						</Grid>
						<FormGroup label="E-mailadres *" labelFor="emailId">
							<TextInput id="emailId" />
						</FormGroup>
						<FormGroup label="Wachtwoord *" labelFor="passwordId">
							<TextInput id="passwordId" type="password" />
						</FormGroup>
						<FormGroup label="Type gebruiker">
							<Select options={mockSelectRoles} value="" />
						</FormGroup>
						<div className="c-content">
							<p className="u-text-bold">Heb je een stamboeknummer?</p>
						</div>
						<FormGroup>
							<RadioButtonGroup>
								<RadioButton
									name="stamboeknummer"
									value="yes"
									label="Ja, ik heb een stamboeknummer"
								/>
								<RadioButton
									name="stamboeknummer"
									value="no"
									label="Nee, ik heb geen stamboeknummer"
								/>
							</RadioButtonGroup>
						</FormGroup>
						<FormGroup>
							<Checkbox label="Ik aanvaard de gebruiksvoorwaarden en privacyverklaring." />
						</FormGroup>
						<FormGroup>
							<Button label="Account aanmaken" type="primary" />
						</FormGroup>
					</Spacer>
				</Form>
				<hr className="c-hr" />
				<div className="u-text-center">
					<p>Of gebruik je account op:</p>
					<Spacer margin="top">
						<ButtonToolbar>
							<Button icon="klascement" label="KlasCement" type="secondary" />
							<Button icon="smartschool" label="SmartSchool" type="secondary" />
						</ButtonToolbar>
					</Spacer>
				</div>
			</Container>
		</Container>
	);
};

export default Register;
