import { Container } from '@viaa/avo2-components';
import React, { FC, ReactNode } from 'react';

import { CollectionBlockType } from '../../../collection/collection.const';
import {
	CollectionFragmentTypeItem,
	CollectionFragmentTypeText,
} from '../../../collection/components';
import { IconBar } from '../index';

import { BLOCK_ITEM_ICONS } from './BlockList.consts';
import { BlockItemBase, BlockListProps } from './BlockList.types';

const BlockList: FC<BlockListProps> = ({ blocks, config }) => {
	const renderCollectionFragment = (block: BlockItemBase) => {
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
						{...config?.text}
						title={{ ...config?.text?.title, block }}
						richText={{ ...config?.text?.richText, block }}
					/>
				);
			case CollectionBlockType.ITEM:
				return layout(
					<CollectionFragmentTypeItem
						{...config?.item}
						title={{
							...config?.item?.title,
							block,
						}}
						richText={{ ...config?.item?.richText, block }}
						flowPlayer={{
							...config?.item?.flowPlayer,
							block,
						}}
						meta={{ ...config?.item?.meta, block }}
					/>
				);

			default:
				return null;
		}
	};

	const renderBlockItemWrapper = (fragment: BlockItemBase) => {
		return (
			<div key={fragment.id} className="u-padding-top-l u-padding-bottom-l">
				{renderCollectionFragment(fragment)}
			</div>
		);
	};

	return <>{blocks.map(renderBlockItemWrapper)}</>;
};

export default BlockList;
