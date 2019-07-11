import React, { FunctionComponent } from 'react';

import { Container } from '@viaa/avo2-components';

export interface SignInProps {}

export const SignIn: FunctionComponent<SignInProps> = ({}) => {
	return (
		<Container mode="vertical">
			<Container size="small">
				<h3 className="c-h2">Aanmelden</h3>.
			</Container>
		</Container>
	);
};

export default SignIn;
