import { type DefaultProps, IconName } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { clsx } from 'clsx';
import React, { type FC, type ReactNode, useMemo } from 'react';

import { CollectionBlockType } from '../../../../collection/collection.const';
import {
	CollectionFragmentFlowPlayer,
	type CollectionFragmentFlowPlayerProps,
} from '../../../../collection/components/CollectionFragmentFlowPlayer';
import {
	CollectionFragmentTitle,
	type CollectionFragmentTitleProps,
} from '../../../../collection/components/CollectionFragmentTitle';
import { tHtml } from '../../../helpers/translate-html';
import { tText } from '../../../helpers/translate-text';
import { ItemMetadata } from '../../BlockItemMetadata/ItemMetadata';
import { CollapsibleColumn } from '../../CollapsibleColumn/CollapsibleColumn';
import { TextWithTimestamps } from '../../TextWithTimestamp/TextWithTimestamps';

import './CollectionFragmentTypeItem.scss';

export interface CollectionFragmentTypeItemProps extends DefaultProps {
	block: Avo.Core.BlockItemBase;
	flowPlayer?: CollectionFragmentFlowPlayerProps;
	buildSeriesLink?: (series: string) => ReactNode;
	title?: CollectionFragmentTitleProps;
	canOpenOriginal?: boolean;
}

export const CollectionFragmentTypeItem: FC<CollectionFragmentTypeItemProps> = ({
	block,
	title,
	buildSeriesLink,
	flowPlayer,
	className,
	canOpenOriginal,
}) => {
	const custom = block.use_custom_fields && block.custom_description;
	const original =
		(block as Avo.Assignment.Block).original_description || block.item_meta?.description;

	const customDescription = useMemo(
		() => (
			<>
				{canOpenOriginal && (
					<b>
						{tHtml(
							'shared/components/block-list/blocks/collection-fragment-type-item___beschrijving-leerling'
						)}
					</b>
				)}

				<TextWithTimestamps
					content={
						(block?.use_custom_fields || block?.type === CollectionBlockType.TEXT
							? block.custom_description
							: block?.item_meta?.description) || ''
					}
				/>
			</>
		),
		[canOpenOriginal, block]
	);

	const originalDescription = useMemo(
		() => (
			<>
				{canOpenOriginal && (
					<b>
						{tHtml(
							'shared/components/block-list/blocks/collection-fragment-type-item___originele-beschrijving'
						)}
					</b>
				)}

				<TextWithTimestamps content={original || ''} />
			</>
		),
		[canOpenOriginal, original]
	);

	return (
		<div className={clsx(className, 'c-collection-fragment-type-item')}>
			{title && <CollectionFragmentTitle {...title} />}

			{flowPlayer && (
				<div className="c-collection-fragment-type-item__video">
					<CollectionFragmentFlowPlayer {...flowPlayer} />
				</div>
			)}

			{block && (
				<div className="c-collection-fragment-type-item__sidebar">
					<CollapsibleColumn>
						{
							<ItemMetadata
								item={block.item_meta as Avo.Item.Item}
								buildSeriesLink={buildSeriesLink}
							/>
						}

						{custom ? customDescription : custom === false ? originalDescription : null}
					</CollapsibleColumn>

					{custom && canOpenOriginal && (
						<CollapsibleColumn
							button={{
								icon: (expanded) => (expanded ? IconName.eyeOff : IconName.eye),
								label: (expanded) =>
									expanded
										? tText(
												'shared/components/block-list/blocks/collection-fragment-type-item___verberg'
										  )
										: tText(
												'shared/components/block-list/blocks/collection-fragment-type-item___toon'
										  ),
							}}
						>
							{originalDescription}
						</CollapsibleColumn>
					)}
				</div>
			)}
		</div>
	);
};
