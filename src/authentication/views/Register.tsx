import React, { FunctionComponent } from 'react';

import { Container } from '@viaa/avo2-components';

export interface RegisterProps {}

export const Register: FunctionComponent<RegisterProps> = ({}) => {
	return (
		<Container mode="vertical">
			<Container mode="horizontal" size="small">
				<hr className="c-hr" />
				<h3 className="c-h2">Registreren</h3>
			</Container>
		</Container>
	);
};

export default Register;
