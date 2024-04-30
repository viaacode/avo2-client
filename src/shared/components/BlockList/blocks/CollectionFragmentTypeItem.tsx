import { type DefaultProps, IconName } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import classNames from 'classnames';
import React, { type FC, useMemo } from 'react';

import { CollectionBlockType } from '../../../../collection/collection.const';
import CollectionFragmentFlowPlayer, {
	type CollectionFragmentFlowPlayerProps,
} from '../../../../collection/components/CollectionFragmentFlowPlayer';
import CollectionFragmentTitle, {
	type CollectionFragmentTitleProps,
} from '../../../../collection/components/CollectionFragmentTitle';
import useTranslation from '../../../../shared/hooks/useTranslation';
import {
	BlockItemMetadata,
	type BlockItemMetadataProps,
} from '../../BlockItemMetadata/BlockItemMetadata';
import CollapsibleColumn from '../../CollapsibleColumn/CollapsibleColumn';
import TextWithTimestamps from '../../TextWithTimestamp/TextWithTimestamps';

import './CollectionFragmentTypeItem.scss';

export interface CollectionFragmentTypeItemProps extends DefaultProps {
	block: Avo.Core.BlockItemBase;
	flowPlayer?: CollectionFragmentFlowPlayerProps;
	meta?: Omit<BlockItemMetadataProps, 'block'>; // TODO @Ian cleanup configs and having to pass block multiple times
	title?: CollectionFragmentTitleProps;
	canOpenOriginal?: boolean;
}

const CollectionFragmentTypeItem: FC<CollectionFragmentTypeItemProps> = ({
	block,
	title,
	meta,
	flowPlayer,
	className,
	canOpenOriginal,
}) => {
	const { tText, tHtml } = useTranslation();

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
		[canOpenOriginal, block, tHtml]
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
		[canOpenOriginal, original, tHtml]
	);

	return (
		<div className={classNames(className, 'c-collection-fragment-type-item')}>
			{title && <CollectionFragmentTitle {...title} />}

			{flowPlayer && (
				<div className="c-collection-fragment-type-item__video">
					<CollectionFragmentFlowPlayer {...flowPlayer} />
				</div>
			)}

			{meta && block && (
				<div className="c-collection-fragment-type-item__sidebar">
					<CollapsibleColumn>
						{meta && <BlockItemMetadata {...meta} block={block} />}

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

export default CollectionFragmentTypeItem;
