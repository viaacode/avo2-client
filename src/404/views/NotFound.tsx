import { Blankslate, Container } from '@viaa/avo2-components';
import React, { FunctionComponent } from 'react';

interface NotFoundProps {}

export const NotFound: FunctionComponent<NotFoundProps> = ({}) => {
	return (
		<div className="o-container-vertical o-container-vertical-title o-container-vertical--bg-alt">
			{/* TODO use Container component with custom class param after merging: https://github.com/viaacode/avo2-components/pull/67 */}
			<Container size="medium" mode="horizontal">
				<Blankslate body="" icon="search" title="De pagina werd niet gevonden" />
			</Container>
		</div>
	);
};

export default NotFound;
