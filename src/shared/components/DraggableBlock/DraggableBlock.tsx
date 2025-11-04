import { BlockHeading } from '@meemoo/admin-core-ui/client';
import { type DefaultProps, Flex, FlexItem, Icon } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import { truncate } from 'lodash-es';
import React, { type FC } from 'react';

import { stripHtml } from '../../helpers/formatters/strip-html';
import { GET_BLOCK_ICON } from '../BlockList/BlockIconWrapper/BlockIconWrapper.consts';

import './DraggableBlock.scss';
import { tHtml } from '../../helpers/translate-html';

interface DraggableBlockProps extends DefaultProps {
	block?: Avo.Core.BlockItemBase;
}

export const DraggableBlock: FC<DraggableBlockProps> = ({ block, className }) => {
	if (!block) {
		return null;
	}

	const thumbnail = block.thumbnail_path || block.item_meta?.thumbnail_path;

	const label = [
		block.custom_title,
		(block as Avo.Assignment.Block).original_title,
		block.item_meta?.title,
		block.custom_description,
		(block as Avo.Assignment.Block).original_description,
		block.item_meta?.description,
	].find((string) => string && string.length > 0);

	return (
		<Flex className={clsx('c-draggable-block', className)} center>
			<FlexItem shrink>
				{thumbnail ? (
					<div style={{ backgroundImage: `url(${thumbnail})` }} />
				) : (
					<Icon name={GET_BLOCK_ICON(block)} />
				)}
			</FlexItem>
			<FlexItem>
				<BlockHeading type="h4">
					{label ? (
						truncate(stripHtml(label), { length: 45 })
					) : (
						<span className="c-draggable-block__placeholder">
							{tHtml(
								'shared/components/draggable-block/draggable-block___instructies-of-omschrijving'
							)}
						</span>
					)}
				</BlockHeading>
			</FlexItem>
		</Flex>
	);
};
