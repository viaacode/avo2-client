import React, { FC } from 'react';

import { ItemSchema } from '@viaa/avo2-types/types/item';

import { FlowPlayerWrapper } from '../../shared/components';
import { FlowPlayerWrapperProps } from '../../shared/components/FlowPlayerWrapper/FlowPlayerWrapper';
import { FragmentComponent } from '../collection.types';

export type CollectionFragmentFlowPlayerProps = FragmentComponent & FlowPlayerWrapperProps;

const CollectionFragmentFlowPlayer: FC<CollectionFragmentFlowPlayerProps> = (props) => {
	const { fragment, ...rest } = props;

	const meta = fragment.item_meta as ItemSchema | undefined;

	return (
		<FlowPlayerWrapper
			item={meta}
			external_id={meta?.external_id}
			duration={meta?.duration}
			title={meta?.title}
			cuePoints={{
				start: fragment.start_oc,
				end: fragment.end_oc,
			}}
			{...rest}
		/>
	);
};

export default CollectionFragmentFlowPlayer;
