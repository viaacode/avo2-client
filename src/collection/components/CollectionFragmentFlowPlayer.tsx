import type { Avo } from '@viaa/avo2-types';
import React, { FC } from 'react';

import { FlowPlayerWrapper } from '../../shared/components';
import { FlowPlayerWrapperProps } from '../../shared/components/FlowPlayerWrapper/FlowPlayerWrapper';
import { BlockItemComponent } from '../collection.types';

export type CollectionFragmentFlowPlayerProps = BlockItemComponent & FlowPlayerWrapperProps;

const CollectionFragmentFlowPlayer: FC<CollectionFragmentFlowPlayerProps> = (props) => {
	const { block, ...rest } = props;

	const meta = block?.item_meta as Avo.Item.Item | undefined;

	return (
		<FlowPlayerWrapper
			item={meta}
			poster={block?.thumbnail_path || meta?.thumbnail_path}
			external_id={meta?.external_id}
			duration={meta?.duration}
			title={meta?.title}
			cuePointsVideo={
				block
					? {
							start: block.start_oc || null,
							end: block.end_oc || null,
					  }
					: undefined
			}
			cuePointsLabel={
				block
					? {
							start: block.start_oc || null,
							end: block.end_oc || null,
					  }
					: undefined
			}
			{...rest}
		/>
	);
};

export default CollectionFragmentFlowPlayer;
