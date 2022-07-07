import React, { FC } from 'react';

import CollectionFragmentRichText, {
	CollectionFragmentRichTextProps,
} from './CollectionFragmentRichText';
import CollectionFragmentTitle, { CollectionFragmentTitleProps } from './CollectionFragmentTitle';

export interface CollectionFragmentTypeTextProps {
	title?: CollectionFragmentTitleProps;
	richText?: CollectionFragmentRichTextProps;
}

const CollectionFragmentTypeText: FC<CollectionFragmentTypeTextProps> = ({ title, richText }) => {
	return (
		<>
			{title && <CollectionFragmentTitle {...title} />}
			{richText && <CollectionFragmentRichText {...richText} />}
		</>
	);
};

export default CollectionFragmentTypeText;
