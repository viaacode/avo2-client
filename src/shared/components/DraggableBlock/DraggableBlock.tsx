import { BlockHeading, DefaultProps, Flex, FlexItem, Icon } from '@viaa/avo2-components';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import { BlockItemBaseSchema } from '@viaa/avo2-types/types/core';
import classNames from 'classnames';
import { truncate } from 'lodash';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { DRAGGABLE_BLOCK_ICONS } from './DraggableBlock.const';

import './DraggableBlock.scss';

export interface DraggableBlockProps extends DefaultProps {
	block?: BlockItemBaseSchema;
}

const DraggableBlock: FC<DraggableBlockProps> = ({ block, className }) => {
	const [t] = useTranslation();

	if (!block) {
		return null;
	}

	const thumbnail = block.thumbnail_path || block.item_meta?.thumbnail_path;

	const title =
		(block.use_custom_fields
			? block.custom_title
			: (block as AssignmentBlock).original_title) || block.item_meta?.title;

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
					{title ? (
						truncate(title, { length: 45 })
					) : (
						<span className="c-draggable-block__placeholder">
							{t(
								'shared/components/draggable-block/draggable-block___instructies-of-omschrijving'
							)}
						</span>
					)}
				</BlockHeading>
			</FlexItem>
		</Flex>
	);
};

export default DraggableBlock;