import React, { FunctionComponent, useReducer } from 'react';

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

import { INITIAL_USER_STATE } from '../../authentication.const';
import { Action, UserState } from '../../authentication.types';

import './Register.scss';

// TODO: Get roles
const mockSelectRoles = [
	{ label: 'Kies een type', value: '', disabled: true },
	{ label: 'Leerkracht', value: 'leerkracht' },
];

export interface RegisterProps {}

const userReducer = (state: UserState, { type, payload }: Action) => ({
	...state,
	[type]: payload,
});

const Register: FunctionComponent<RegisterProps> = () => {
	const [userState, userDispatch] = useReducer(userReducer, INITIAL_USER_STATE);

	const setUserState = (field: string, value: string | boolean) =>
		userDispatch({
			type: field,
			payload: value,
		});

	return (
		<Container className="c-register-view" mode="vertical">
			<Container mode="horizontal" size="small">
				<h3 className="c-h2">Registreren</h3>
				<hr className="c-hr" />
				<Form>
					<Spacer margin="bottom-large">
						<Spacer margin="bottom">
							<Grid>
								<Column size="2-6">
									<FormGroup labelFor="firstName" label="Voornaam">
										<TextInput
											id="firstName"
											value={userState.firstName}
											onChange={value => setUserState('firstName', value)}
										/>
									</FormGroup>
								</Column>
								<Column size="2-6">
									<FormGroup labelFor="lastName" label="Achternaam">
										<TextInput
											id="lastName"
											value={userState.lastName}
											onChange={value => setUserState('lastName', value)}
										/>
									</FormGroup>
								</Column>
							</Grid>
						</Spacer>
						<FormGroup label="E-mailadres *" labelFor="email">
							<TextInput
								id="email"
								value={userState.email}
								onChange={value => setUserState('email', value)}
							/>
						</FormGroup>
						<FormGroup label="Wachtwoord *" labelFor="password">
							<TextInput
								id="password"
								type="password"
								value={userState.password}
								onChange={value => setUserState('password', value)}
							/>
						</FormGroup>
						<FormGroup label="Type gebruiker">
							<Select
								options={mockSelectRoles}
								value={userState.type}
								onChange={value => setUserState('type', value)}
							/>
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
									checked={!!userState.stamboekNumber}
									onChange={() => setUserState('stamboekNumber', true)}
								/>
								<RadioButton
									name="stamboeknummer"
									value="no"
									label="Nee, ik heb geen stamboeknummer"
									checked={!userState.stamboekNumber}
									onChange={() => setUserState('stamboekNumber', false)}
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
