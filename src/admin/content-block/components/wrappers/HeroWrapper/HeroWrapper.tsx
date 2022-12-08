import { BlockHero, BlockHeroProps } from '@viaa/avo2-components';
import React, { FunctionComponent } from 'react';

import { getEnv } from '../../../../../shared/helpers';

const HeroWrapper: FunctionComponent<BlockHeroProps> = (props) => {
	return (
		<BlockHero
			{...props}
			dataPlayerId={getEnv('FLOW_PLAYER_ID')}
			token={getEnv('FLOW_PLAYER_TOKEN')}
		/>
	);
};

export default HeroWrapper;
