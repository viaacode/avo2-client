import { Button, DefaultProps } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CollectionBlockType } from '../../../../collection/collection.const';
import CollectionFragmentFlowPlayer, {
	CollectionFragmentFlowPlayerProps,
} from '../../../../collection/components/CollectionFragmentFlowPlayer';
import CollectionFragmentTitle, {
	CollectionFragmentTitleProps,
} from '../../../../collection/components/CollectionFragmentTitle';
import {
	BlockItemMetadata,
	BlockItemMetadataProps,
} from '../../BlockItemMetadata/BlockItemMetadata';
import CollapsibleColumn from '../../CollapsibleColumn/CollapsibleColumn';
import TextWithTimestamps from '../../TextWithTimestamp/TextWithTimestamps';

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
	const [showOriginal, setShowOriginal] = useState<boolean>(false);

	const [t] = useTranslation();

	const renderComparison = () => {
		const cast = block as AssignmentBlock;

		const custom = cast.use_custom_fields && cast.custom_description;
		const hasCustom = !!custom;

		const original = cast.original_description || cast.item_meta?.description;

		return (
			<>
				{hasCustom && (
					<>
						<b>
							{t(
								'shared/components/block-list/blocks/collection-fragment-type-item___beschrijving-leerling'
							)}
						</b>

						<TextWithTimestamps
							content={
								(block?.use_custom_fields ||
								block?.type === CollectionBlockType.TEXT
									? block.custom_description
									: block?.item_meta?.description) || ''
							}
						/>
					</>
				)}

				{(!hasCustom || showOriginal) && (
					<>
						<b>
							{t(
								'shared/components/block-list/blocks/collection-fragment-type-item___originele-beschrijving'
							)}
						</b>

						<TextWithTimestamps content={original || ''} />
					</>
				)}

				{hasCustom && (
					<Button
						onClick={() => setShowOriginal(!showOriginal)}
						type="inline-link"
						icon="align-left"
						label={
							showOriginal
								? t(
										'shared/components/block-list/blocks/collection-fragment-type-item___verberg-originele-beschrijving'
								  )
								: t(
										'shared/components/block-list/blocks/collection-fragment-type-item___toon-originele-beschrijving'
								  )
						}
					/>
				)}
			</>
		);
	};

	return (
		<div className="c-collection-fragment--type-item">
			{title && <CollectionFragmentTitle {...title} />}
			<CollapsibleColumn
				className={className}
				grow={flowPlayer ? <CollectionFragmentFlowPlayer {...flowPlayer} /> : <div />}
				bound={
					<>
						{meta && <BlockItemMetadata {...meta} block={block} />}

						{block && !canOpenOriginal && (
							<TextWithTimestamps
								content={
									(block?.use_custom_fields
										? block?.custom_description
										: block?.item_meta?.description) || ''
								}
							/>
						)}

						{block && canOpenOriginal && renderComparison()}
					</>
				}
			/>
		</div>
	);
};

export default CollectionFragmentTypeItem;
