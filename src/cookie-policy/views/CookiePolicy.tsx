import React, { FunctionComponent } from 'react';

import { Container } from '@viaa/avo2-components';

const CookiePolicy: FunctionComponent = () => {
	return (
		<Container mode="vertical">
			<Container mode="horizontal">
				<script
					id="Cookiebot"
					src="https://consent.cookiebot.com/uc.js"
					data-cbid="8fb68e92-94b2-4334-bc47-7bcda08bc9c7"
					data-blockingmode="auto"
					type="text/javascript"
				/>
			</Container>
		</Container>
	);
};

export default CookiePolicy;
