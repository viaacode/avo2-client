import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import { type DefaultProps, Flex, FlexItem, Icon } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import classNames from 'classnames';
import { truncate } from 'lodash-es';
import React, { type FC } from 'react';

import useTranslation from '../../../shared/hooks/useTranslation';
import { stripHtml } from '../../helpers';

import './DraggableBlock.scss';
import { BLOCK_ITEM_ICONS } from '../BlockList/BlockList.consts';

interface DraggableBlockProps extends DefaultProps {
	block?: Avo.Core.BlockItemBase;
}

const DraggableBlock: FC<DraggableBlockProps> = ({ block, className }) => {
	const { tHtml } = useTranslation();

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
		<Flex className={classNames('c-draggable-block', className)} center>
			<FlexItem shrink>
				{thumbnail ? (
					<div style={{ backgroundImage: `url(${thumbnail})` }} />
				) : (
					<Icon name={BLOCK_ITEM_ICONS()[block.type]()} />
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

export default DraggableBlock;
