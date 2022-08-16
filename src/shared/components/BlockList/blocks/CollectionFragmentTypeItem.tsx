import { Button, convertToHtml, DefaultProps } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import React, { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CollectionFragmentFlowPlayer, {
	CollectionFragmentFlowPlayerProps,
} from '../../../../collection/components/CollectionFragmentFlowPlayer';
import CollectionFragmentRichText, {
	CollectionFragmentRichTextProps,
} from '../../../../collection/components/CollectionFragmentRichText';
import CollectionFragmentTitle, {
	CollectionFragmentTitleProps,
} from '../../../../collection/components/CollectionFragmentTitle';
import { useVideoWithTimestamps } from '../../../hooks/useVideoWithTimestamps';
import {
	BlockItemMetadata,
	BlockItemMetadataProps,
} from '../../BlockItemMetadata/BlockItemMetadata';
import CollapsibleColumn from '../../CollapsibleColumn/CollapsibleColumn';

export interface CollectionFragmentTypeItemProps extends DefaultProps {
	block: Avo.Core.BlockItemBase;
	flowPlayer?: CollectionFragmentFlowPlayerProps;
	meta?: Omit<BlockItemMetadataProps, 'block'>; // TODO @Ian cleanup configs and having to pass block multiple times
	richText?: CollectionFragmentRichTextProps | null;
	title?: CollectionFragmentTitleProps;
	canOpenOriginal?: boolean;
}

const CollectionFragmentTypeItem: FC<CollectionFragmentTypeItemProps> = ({
	block,
	title,
	richText,
	meta,
	flowPlayer,
	className,
	canOpenOriginal,
}) => {
	const boundColumnContentRef = useRef(null);
	const [showOriginal, setShowOriginal] = useState<boolean>(false);

	const [t] = useTranslation();

	const { time, format } = useVideoWithTimestamps(boundColumnContentRef);

	const renderComparison = () => {
		if (!richText || !richText.block) {
			return null;
		}

		const cast = richText.block as AssignmentBlock;

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

						<CollectionFragmentRichText
							{...richText}
							content={format(convertToHtml(custom))}
							ref={boundColumnContentRef}
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

						<CollectionFragmentRichText
							{...richText}
							content={
								hasCustom
									? convertToHtml(original)
									: format(convertToHtml(original))
							}
							ref={hasCustom ? undefined : boundColumnContentRef}
						/>
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
				grow={
					flowPlayer ? (
						<CollectionFragmentFlowPlayer {...flowPlayer} seekTime={time} />
					) : (
						<div />
					)
				}
				bound={
					<div ref={boundColumnContentRef}>
						{meta && <BlockItemMetadata {...meta} block={block} />}

						{richText && !canOpenOriginal && (
							<CollectionFragmentRichText
								{...richText}
								content={format(
									convertToHtml(
										richText.block?.use_custom_fields
											? richText.block?.custom_description
											: richText.block?.item_meta?.description
									)
								)}
							/>
						)}

						{richText && canOpenOriginal && renderComparison()}
					</div>
				}
			/>
		</div>
	);
};

export default CollectionFragmentTypeItem;
