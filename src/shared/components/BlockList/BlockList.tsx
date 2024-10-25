import { Container } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { noop } from 'lodash-es';
import React, { type FC, type ReactNode } from 'react';

import { AssignmentBlockType } from '../../../assignment/assignment.types';
import { CollectionBlockType } from '../../../collection/collection.const';
import {
	CollectionFragmentTypeItem,
	CollectionFragmentTypeText,
} from '../../../collection/components';
import { getBlockColor } from '../../helpers/get-block-color';
import { SourcePage } from '../../services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { IconBar } from '../index';

import { BLOCK_ITEM_ICONS } from './BlockList.consts';
import { type BlockListProps } from './BlockList.types';
import AssignmentBlockTypeSearch from './blocks/AssignmentBlockTypeSearch';

import './BlockList.scss';

const BlockList: FC<BlockListProps> = ({ blocks, config }) => {
	const renderCollectionFragment = (block: Avo.Core.BlockItemBase) => {
		const backgroundColor = getBlockColor(block as Avo.Assignment.Block);

		const layout = (children?: ReactNode) => (
			<div
				className="u-p-0 c-block-list__item"
				style={{ backgroundColor, '--block-background': backgroundColor }}
				key={'block-list__item--' + block.id}
			>
				<Container mode="horizontal">
					<div className="u-padding-top-l u-padding-bottom-l">
						<IconBar
							icon={{
								name: BLOCK_ITEM_ICONS()[block.type as Avo.Core.BlockItemType](
									block
								),
							}}
						>
							{children}
						</IconBar>
					</div>
				</Container>
			</div>
		);

		switch (block.type) {
			case CollectionBlockType.TEXT:
				return layout(
					<CollectionFragmentTypeText
						{...config?.TEXT}
						title={{ ...config?.TEXT?.title, block }}
						block={block}
					/>
				);

			case CollectionBlockType.ITEM:
				return layout(
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
							sourcePage: SourcePage.collectionPage,
							trackPlayEvent: true,
						}}
						meta={{ ...config?.ITEM?.meta }}
					/>
				);

			case AssignmentBlockType.ZOEK:
			case AssignmentBlockType.BOUW:
				return layout(
					<AssignmentBlockTypeSearch
						block={block}
						showCollectionButton={block.type === AssignmentBlockType.BOUW}
						pastDeadline={config?.ZOEK?.pastDeadline || false}
						onSearchButtonClicked={config?.ZOEK?.onSearchButtonClicked || noop}
						onCollectionButtonClicked={config?.ZOEK?.onCollectionButtonClicked || noop}
						educationLevelId={config?.ZOEK?.educationLevelId}
					/>
				);

			default:
				return null;
		}
	};

	return <>{blocks.map(renderCollectionFragment)}</>;
};

export default BlockList;
