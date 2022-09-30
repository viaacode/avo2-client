import { Flex } from '@viaa/avo2-components';
import React, { FunctionComponent, Suspense } from 'react';

import { FlowPlayerPropsSchema } from './FlowPlayer.types';

const FlowplayerInternal = React.lazy(() => import('./FlowPlayer.internal'));

export const FlowPlayer: FunctionComponent<FlowPlayerPropsSchema> = (props) => {
	return (
		<Suspense
			fallback={
				<Flex orientation="horizontal" center>
					Laden ...
				</Flex>
			}
		>
			<FlowplayerInternal {...props} />
		</Suspense>
	);
};
