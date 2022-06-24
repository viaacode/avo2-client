import React, { FC } from 'react';

import { convertToHtml } from '@viaa/avo2-components';

import Html, { HtmlProps } from '../../shared/components/Html/Html';
import { FragmentComponent } from '../collection.types';

export type CollectionFragmentRichTextProps = FragmentComponent &
	Omit<HtmlProps, 'content'> &
	Partial<Pick<HtmlProps, 'content'>> & {
		ref?: React.MutableRefObject<HTMLDivElement | null>;
	};

const CollectionFragmentRichText: FC<CollectionFragmentRichTextProps> = (props) => {
	const { fragment, ...rest } = props;

	return (
		<div className="c-collection-fragment-rich-text" ref={rest.ref}>
			<Html
				type="div"
				className="c-collection-fragment-rich-text__parser c-content"
				sanitizePreset="full"
				content={convertToHtml(
					fragment.use_custom_fields
						? fragment.custom_description
						: fragment.item_meta?.description
				)}
				{...rest}
			/>
		</div>
	);
};

export default CollectionFragmentRichText;
