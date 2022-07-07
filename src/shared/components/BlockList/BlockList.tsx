import { Container } from '@viaa/avo2-components';
import { ContainerPropsSchema } from '@viaa/avo2-components/dist/esm/components/Container/Container';
import { Avo } from '@viaa/avo2-types';
import { noop } from 'lodash-es';
import React, { FC, ReactNode } from 'react';

import { AssignmentBlockType } from '../../../assignment/assignment.types';
import { CollectionBlockType } from '../../../collection/collection.const';
import {
	CollectionFragmentTypeItem,
	CollectionFragmentTypeText,
} from '../../../collection/components';
import { IconBar } from '../index';

import { BLOCK_ITEM_ICONS } from './BlockList.consts';
import { BlockListProps } from './BlockList.types';
import AssignmentBlockTypeSearch from './blocks/AssignmentBlockTypeSearch';

const BlockList: FC<BlockListProps> = ({ blocks, config }) => {
	const renderCollectionFragment = (block: Avo.Core.BlockItemBase) => {
		const layout = (children?: ReactNode, background?: ContainerPropsSchema['background']) => (
			<Container
				mode="horizontal"
				size="full-width"
				className="u-p-0"
				background={background}
			>
				<Container mode="horizontal">
					<div key={block.id} className="u-padding-top-l u-padding-bottom-l">
						<IconBar
							icon={{
								name: BLOCK_ITEM_ICONS()[block.type](block),
							}}
						>
							{children}
						</IconBar>
					</div>
				</Container>
			</Container>
		);

		switch (block.type) {
			case CollectionBlockType.TEXT:
				return layout(
					<CollectionFragmentTypeText
						{...config?.TEXT}
						title={{ ...config?.TEXT?.title, block }}
						richText={{ ...config?.TEXT?.richText, block }}
					/>
				);

			case CollectionBlockType.ITEM:
				return layout(
					<CollectionFragmentTypeItem
						{...config?.ITEM}
						title={{
							...config?.ITEM?.title,
							block,
						}}
						richText={{ ...config?.ITEM?.richText, block }}
						flowPlayer={{
							...config?.ITEM?.flowPlayer,
							block,
						}}
						meta={{ ...config?.ITEM?.meta, block }}
					/>
				);

			case AssignmentBlockType.ZOEK:
			case AssignmentBlockType.BOUW:
				return layout(
					<AssignmentBlockTypeSearch
						block={block}
						showCollectionButton={block.type === AssignmentBlockType.BOUW}
						onSearchButtonClicked={config?.ZOEK?.onSearchButtonClicked || noop}
						onCollectionButtonClicked={config?.ZOEK?.onCollectionButtonClicked || noop}
					/>,
					'alt'
				);

			default:
				return null;
		}
	};

	return <>{blocks.map(renderCollectionFragment)}</>;
};

export default BlockList;
