import { Blankslate, Container } from '@viaa/avo2-components';
import React, { FunctionComponent } from 'react';

interface NotFoundProps {
	message?: string;
	icon?: string;
}

export const NotFound: FunctionComponent<NotFoundProps> = ({
	message = 'De pagina werd niet gevonden',
	icon = 'search',
}) => {
	return (
		<Container mode="vertical" background="alt">
			<Container size="medium" mode="horizontal">
				<Blankslate body="" icon={icon} title={message} />
			</Container>
		</Container>
	);
};

export default NotFound;
