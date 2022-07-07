import { convertToHtml } from '@viaa/avo2-components';
import React, { FC } from 'react';

import Html, { HtmlProps } from '../../shared/components/Html/Html';
import { BlockItemComponent } from '../collection.types';

export type CollectionFragmentRichTextProps = BlockItemComponent &
	Omit<HtmlProps, 'content'> &
	Partial<Pick<HtmlProps, 'content'>> & {
		ref?: React.MutableRefObject<HTMLDivElement | null>;
	};

const CollectionFragmentRichText: FC<CollectionFragmentRichTextProps> = (props) => {
	const { block, ...rest } = props;

	return (
		<div className="c-collection-fragment-rich-text" ref={rest.ref}>
			<Html
				type="div"
				className="c-collection-fragment-rich-text__parser c-content"
				sanitizePreset="full"
				content={convertToHtml(
					block?.use_custom_fields
						? block.custom_description
						: block?.item_meta?.description
				)}
				{...rest}
			/>
		</div>
	);
};

export default CollectionFragmentRichText;
