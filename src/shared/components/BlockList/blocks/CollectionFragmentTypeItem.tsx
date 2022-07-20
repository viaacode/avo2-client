import { convertToHtml, DefaultProps } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { FC, useRef } from 'react';

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
	title?: CollectionFragmentTitleProps;
	richText?: CollectionFragmentRichTextProps;
	flowPlayer?: CollectionFragmentFlowPlayerProps;

	meta?: Omit<BlockItemMetadataProps, 'block'>; // TODO @Ian cleanup configs and having to pass block multiple times
	block: Avo.Core.BlockItemBase;
}

const CollectionFragmentTypeItem: FC<CollectionFragmentTypeItemProps> = ({
	block,
	title,
	richText,
	meta,
	flowPlayer,
	className,
}) => {
	const richTextRef = useRef(null);
	const [time, , formatTimestamps] = useVideoWithTimestamps(richTextRef);

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
					<>
						{meta && <BlockItemMetadata {...meta} block={block} />}
						{richText &&
							(() => {
								// Add timestamps
								const formatted = formatTimestamps(
									convertToHtml(
										richText.block?.use_custom_fields
											? richText.block?.custom_description
											: richText.block?.item_meta?.description
									) || ''
								);

								return (
									<CollectionFragmentRichText
										{...richText}
										content={formatted}
										ref={richTextRef}
									/>
								);
							})()}
					</>
				}
			/>
		</div>
	);
};

export default CollectionFragmentTypeItem;
