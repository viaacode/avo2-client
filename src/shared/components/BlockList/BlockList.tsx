import { type Avo } from '@viaa/avo2-types';
import { noop } from 'lodash-es';
import React, { type FC } from 'react';

import { AssignmentBlockType } from '../../../assignment/assignment.types';
import { CollectionBlockType } from '../../../collection/collection.const';
import { getBlockColor } from '../../helpers/get-block-color';

import { BlockIconWrapper } from './BlockIconWrapper/BlockIconWrapper';
import {
	AssignmentBlockTypeSearch,
	type AssignmentBlockTypeSearchProps,
} from './blocks/AssignmentBlockTypeSearch';
import {
	CollectionFragmentTypeItem,
	type CollectionFragmentTypeItemProps,
} from './blocks/CollectionFragmentTypeItem';
import {
	CollectionFragmentTypeText,
	type CollectionFragmentTypeTextProps,
} from './blocks/CollectionFragmentTypeText';

import './BlockList.scss';

export interface BlockListProps {
	blocks: Avo.Core.BlockItemBase[];
	config?: {
		TEXT?: Partial<CollectionFragmentTypeTextProps>;
		ITEM?: Partial<CollectionFragmentTypeItemProps>;
		ZOEK?: Partial<AssignmentBlockTypeSearchProps>;
	};
}

export const BlockList: FC<BlockListProps> = ({ blocks, config }) => {
	const renderCollectionFragment = (block: Avo.Core.BlockItemBase) => {
		const backgroundColor = getBlockColor(block as Avo.Assignment.Block);

		switch (block.type) {
			case CollectionBlockType.TEXT:
				return (
					<BlockIconWrapper
						type={block.type}
						key={block.id}
						backgroundColor={backgroundColor}
					>
						<CollectionFragmentTypeText
							{...config?.TEXT}
							title={{ ...config?.TEXT?.title, block }}
							block={block}
						/>
					</BlockIconWrapper>
				);

			case CollectionBlockType.ITEM:
				return (
					<BlockIconWrapper
						type={block.type}
						key={block.id}
						backgroundColor={backgroundColor}
						type_id={block.item_meta?.type_id}
					>
						<CollectionFragmentTypeItem
							{...config?.ITEM}
							block={block}
							title={{
								...config?.ITEM?.title,
								block,
							}}
							flowPlayer={{
								...config?.ITEM?.flowPlayer,
								block,
								trackPlayEvent: true,
							}}
							buildSeriesLink={config?.ITEM?.buildSeriesLink}
						/>
					</BlockIconWrapper>
				);

			case AssignmentBlockType.ZOEK:
			case AssignmentBlockType.BOUW:
				return (
					<BlockIconWrapper
						type={block.type}
						key={block.id}
						backgroundColor={backgroundColor}
					>
						<AssignmentBlockTypeSearch
							block={block}
							showCollectionButton={block.type === AssignmentBlockType.BOUW}
							pastDeadline={config?.ZOEK?.pastDeadline || false}
							onSearchButtonClicked={config?.ZOEK?.onSearchButtonClicked || noop}
							onCollectionButtonClicked={
								config?.ZOEK?.onCollectionButtonClicked || noop
							}
							educationLevelId={config?.ZOEK?.educationLevelId}
						/>
					</BlockIconWrapper>
				);

			default:
				return null;
		}
	};

	return <>{blocks.map(renderCollectionFragment)}</>;
};
