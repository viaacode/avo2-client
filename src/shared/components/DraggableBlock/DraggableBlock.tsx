import { BlockHeading, DefaultProps, Flex, FlexItem, Icon } from '@viaa/avo2-components';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import classNames from 'classnames';
import { truncate } from 'lodash';
import React, { FC } from 'react';

import { BlockItemBase } from '../BlockList/BlockList.types';
import { DRAGGABLE_BLOCK_ICONS } from './DraggableBlock.const';

import './DraggableBlock.scss';

export interface DraggableBlockProps extends DefaultProps {
	block?: BlockItemBase;
}

const DraggableBlock: FC<DraggableBlockProps> = ({ block, className }) => {
	if (!block) {
		return null;
	}

	const thumbnail = block.thumbnail_path || block.item_meta?.thumbnail_path;

	const title =
		(block.use_custom_fields
			? block.custom_title
			: (block as AssignmentBlock).original_title) || block.item_meta?.title;

	const description =
		(block.use_custom_fields
			? block.custom_description
			: (block as AssignmentBlock).original_description) || block.item_meta?.description;

	return (
		<Flex className={classNames('c-draggable-block', className)} center>
			<FlexItem shrink>
				{thumbnail ? (
					<div style={{ backgroundImage: `url(${thumbnail})` }} />
				) : (
					<Icon name={DRAGGABLE_BLOCK_ICONS[block.type]} />
				)}
			</FlexItem>
			<FlexItem>
				<BlockHeading type="h4">
					{truncate(`${title || description}`, { length: 45 })}
				</BlockHeading>
			</FlexItem>
		</Flex>
	);
};

export default DraggableBlock;
