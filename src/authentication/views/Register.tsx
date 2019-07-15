import React, { FunctionComponent } from 'react';

import {
	Button,
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

export const Register: FunctionComponent<RegisterProps> = ({}) => {
	return (
		<Container mode="vertical">
			<Container mode="horizontal" size="small">
				<hr className="c-hr" />
				<h3 className="c-h2">Registreren</h3>
				<Form>
					<Spacer margin="bottom-large">
						<div className="o-form-group-layout o-form-group-layout--standard">
							<Grid>
								<Column size="2-6">
									<FormGroup label="Voornaam">
										<TextInput />
									</FormGroup>
								</Column>
								<Column size="2-6">
									<FormGroup label="Achternaam">
										<TextInput />
									</FormGroup>
								</Column>
							</Grid>
							<FormGroup label="E-mailadres *" labelFor="emailId">
								<TextInput id="emailId" />
							</FormGroup>
							<FormGroup label="Wachtwoord *" labelFor="passwordId">
								<TextInput id="passwordId" />
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
								<Button label="Account aanmaken" type="primary" />
							</FormGroup>
						</div>
					</Spacer>
				</Form>
				<hr className="c-hr" />
				<div className="u-text-center">
					<p>Of gebruik je account op:</p>
				</div>
				<div className="c-btn-toolbar">
					<Button icon="klascement" label="KlasCement" type="secondary" />
					<Button icon="smartschool" label="SmartSchool" type="secondary" />
				</div>
			</Container>
		</Container>
	);
};

export default Register;
