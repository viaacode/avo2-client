import { SanitizePreset } from '@meemoo/admin-core-ui';
import { convertToHtml } from '@viaa/avo2-components';
import React, { type FC } from 'react';

import Html, { type HtmlProps } from '../../shared/components/Html/Html';
import { CollectionBlockType } from '../collection.const';
import { type BlockItemComponent } from '../collection.types';

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
				sanitizePreset={SanitizePreset.full}
				content={convertToHtml(
					block?.use_custom_fields || block?.type === CollectionBlockType.TEXT
						? block.custom_description
						: block?.item_meta?.description
				)}
				{...rest}
			/>
		</div>
	);
};

export default CollectionFragmentRichText;
