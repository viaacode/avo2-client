import React, { FC, useRef } from 'react';

import { convertToHtml, DefaultProps } from '@viaa/avo2-components';

import { CollapsibleColumn } from '../../shared/components';
import { useVideoWithTimestamps } from '../../shared/hooks/useVideoWithTimestamps';

import CollectionFragmentFlowPlayer, {
	CollectionFragmentFlowPlayerProps,
} from './CollectionFragmentFlowPlayer';
import CollectionFragmentMeta, { CollectionFragmentMetaProps } from './CollectionFragmentMeta';
import CollectionFragmentRichText, {
	CollectionFragmentRichTextProps,
} from './CollectionFragmentRichText';
import CollectionFragmentTitle, { CollectionFragmentTitleProps } from './CollectionFragmentTitle';

interface CollectionFragmentTypeItemProps extends DefaultProps {
	title?: CollectionFragmentTitleProps;
	richText?: CollectionFragmentRichTextProps;
	meta?: CollectionFragmentMetaProps;
	flowPlayer?: CollectionFragmentFlowPlayerProps;
}

const CollectionFragmentTypeItem: FC<CollectionFragmentTypeItemProps> = ({
	title,
	richText,
	meta,
	flowPlayer,
	className,
}) => {
	const richTextRef = useRef(null);
	const [time, , formatTimestamps] = useVideoWithTimestamps(richTextRef);

	return (
		<>
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
						{meta && <CollectionFragmentMeta {...meta} />}
						{richText &&
							(() => {
								// Add timestamps
								const formatted = formatTimestamps(
									convertToHtml(
										richText.fragment.use_custom_fields
											? richText.fragment.custom_description
											: richText.fragment.item_meta?.description
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
		</>
	);
};

export default CollectionFragmentTypeItem;
