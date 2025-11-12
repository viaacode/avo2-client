import {convertToHtml} from '@viaa/avo2-components';
import React, {type FC} from 'react';

import {Html, type HtmlProps} from '../../shared/components/Html/Html.js';
import {type BlockItemComponent} from '../collection.types.js';
import {Avo} from "@viaa/avo2-types";

type CollectionFragmentRichTextProps = BlockItemComponent &
	Omit<HtmlProps, 'content'> &
	Partial<Pick<HtmlProps, 'content'>> & {
		ref?: React.MutableRefObject<HTMLDivElement | null>;
	};

export const CollectionFragmentRichText: FC<CollectionFragmentRichTextProps> = (props) => {
	const { block, ...rest } = props;

	return (
		<div className="c-collection-fragment-rich-text" ref={rest.ref}>
			<Html
				type="div"
				className="c-collection-fragment-rich-text__parser c-content"
				sanitizePreset={'full' as any}
				content={convertToHtml(
					block?.use_custom_fields || block?.type === Avo.Core.BlockItemType.TEXT
						? block.custom_description
						: block?.item_meta?.description
				)}
				{...rest}
			/>
		</div>
	);
};
