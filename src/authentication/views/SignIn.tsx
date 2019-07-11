import React, { FunctionComponent } from 'react';

import { Button, Container, Form, FormGroup, Spacer, TextInput } from '@viaa/avo2-components';

export interface SignInProps {}

export const SignIn: FunctionComponent<SignInProps> = ({}) => {
	return (
		<Container mode="vertical">
			<Container mode="horizontal" size="small">
				<Spacer margin="bottom-large" />
				<hr className="c-hr" />
				<h3 className="c-h2">Aanmelden</h3>
				<Form>
					<Spacer margin="bottom-large">
						<FormGroup label="E-mail" labelFor="emailId">
							<TextInput id="emailId" />
						</FormGroup>
						<FormGroup label="Wachtwoord" labelFor="passwordId">
							<TextInput id="passwordId" /> {/* TODO: type="password" */}
						</FormGroup>
						<FormGroup>
							<Button label="Aanmelden" type="primary" />
						</FormGroup>
					</Spacer>
				</Form>
				<hr className="c-hr" />
				<div className="c-content">
					<p>Aanmelden met:</p>
				</div>
				<div className="c-btn-toolbar">
					<Button icon="klascement" label="KlasCement" type="secondary" />
					<Button icon="smartschool" label="SmartSchool" type="secondary" />
				</div>
				<hr className="c-hr" />
				<div className="c-content">
					<p className="u-text-muted">Forgot password?</p>
				</div>
			</Container>
		</Container>
	);
};

export default SignIn;
