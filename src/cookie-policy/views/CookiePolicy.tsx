import React, { FunctionComponent } from 'react';

import { Container } from '@viaa/avo2-components';

const CookiePolicy: FunctionComponent = () => {
	return (
		<Container mode="vertical">
			<Container mode="horizontal">
				<script
					id="CookieDeclaration"
					src="https://consent.cookiebot.com/8fb68e92-94b2-4334-bc47-7bcda08bc9c7/cd.js"
					type="text/javascript"
					async
				></script>
			</Container>
		</Container>
	);
};

export default CookiePolicy;
