import { convertToHtml, DefaultProps } from '@viaa/avo2-components';
import React, { FC, useRef } from 'react';

import CollectionFragmentFlowPlayer, {
	CollectionFragmentFlowPlayerProps,
} from '../../../../collection/components/CollectionFragmentFlowPlayer';
import CollectionFragmentMeta, {
	CollectionFragmentMetaProps,
} from '../../../../collection/components/CollectionFragmentMeta';
import CollectionFragmentRichText, {
	CollectionFragmentRichTextProps,
} from '../../../../collection/components/CollectionFragmentRichText';
import CollectionFragmentTitle, {
	CollectionFragmentTitleProps,
} from '../../../../collection/components/CollectionFragmentTitle';
import { useVideoWithTimestamps } from '../../../hooks/useVideoWithTimestamps';
import { CollapsibleColumn } from '../../index';

export interface CollectionFragmentTypeItemProps extends DefaultProps {
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
				enableScrollable
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
		</>
	);
};

export default CollectionFragmentTypeItem;
