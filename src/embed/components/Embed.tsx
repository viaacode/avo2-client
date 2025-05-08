import { Flex, Spacer } from '@viaa/avo2-components';
import React, { type FC } from 'react';
import { withRouter } from 'react-router';

const Embed: FC = () => {
	return (
		<Spacer margin={['top-large', 'bottom-large']}>
			<Flex center>BLUB</Flex>
		</Spacer>
	);
};

export default withRouter(Embed);
