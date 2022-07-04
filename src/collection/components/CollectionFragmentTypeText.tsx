import React, { FC } from 'react';

import CollectionFragmentRichText, {
	CollectionFragmentRichTextProps,
} from './CollectionFragmentRichText';
import CollectionFragmentTitle, { CollectionFragmentTitleProps } from './CollectionFragmentTitle';

interface CollectionFragmentTypeTextProps {
	title?: CollectionFragmentTitleProps;
	richText?: CollectionFragmentRichTextProps;
	enableContentLinks: boolean;
}

const CollectionFragmentTypeText: FC<CollectionFragmentTypeTextProps> = ({
	title,
	richText,
	enableContentLinks,
}) => {
	return (
		<>
			{title && <CollectionFragmentTitle {...title} enableTitleLink={enableContentLinks} />}
			{richText && <CollectionFragmentRichText {...richText} />}
		</>
	);
};

export default CollectionFragmentTypeText;
