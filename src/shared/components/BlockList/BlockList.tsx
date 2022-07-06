import { Container } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { FC, ReactNode } from 'react';

import { CollectionBlockType } from '../../../collection/collection.const';
import {
	CollectionFragmentTypeItem,
	CollectionFragmentTypeText,
} from '../../../collection/components';
import { IconBar } from '../index';

import { BLOCK_ITEM_ICONS } from './BlockList.consts';
import { BlockListProps } from './BlockList.types';

const BlockList: FC<BlockListProps> = ({ blocks, canPlay, enableContentLinks }) => {
	const renderCollectionFragment = (block: Avo.Core.BlockItemBase) => {
		const layout = (children?: ReactNode) => (
			<Container mode="horizontal" className="u-p-0">
				<IconBar
					icon={{
						name: BLOCK_ITEM_ICONS()[block.type](block),
					}}
				>
					{children}
				</IconBar>
			</Container>
		);

		switch (block.type) {
			case CollectionBlockType.TEXT:
				return layout(
					<CollectionFragmentTypeText
						title={{ block: block }}
						richText={{ block: block }}
						enableContentLinks={enableContentLinks}
					/>
				);
			case CollectionBlockType.ITEM:
				return layout(
					<CollectionFragmentTypeItem
						className="m-collection-detail__video-content"
						title={{
							block: block,
						}}
						richText={{ block: block }}
						flowPlayer={{
							block: block,
							canPlay,
						}}
						meta={{ block: block, enableContentLinks }}
						enableContentLinks={enableContentLinks}
					/>
				);

			default:
				return null;
		}
	};

	const renderBlockItemWrapper = (fragment: Avo.Core.BlockItemBase) => {
		return (
			<div key={fragment.id} className="u-padding-top-l u-padding-bottom-l">
				{renderCollectionFragment(fragment)}
			</div>
		);
	};

	return <>{blocks.map(renderBlockItemWrapper)}</>;
};

export default BlockList;
