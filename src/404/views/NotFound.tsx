import { Blankslate, Container } from '@viaa/avo2-components';
import React, { FunctionComponent } from 'react';

interface NotFoundProps {}

export const NotFound: FunctionComponent<NotFoundProps> = () => {
	return (
		<Container mode="vertical" background="alt" className="o-container-vertical-title">
			<Container size="medium" mode="horizontal">
				<Blankslate body="" icon="search" title="De pagina werd niet gevonden" />
			</Container>
		</Container>
	);
};

export default NotFound;
